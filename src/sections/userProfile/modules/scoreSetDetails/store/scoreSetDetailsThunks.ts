import { DispatchFun, GetStateFun } from '@mu-native/common'

import { requestSet } from '../../../../../App/profileScreens/users/userService'
import SentryUtils from '../../../../../App/Utils/Sentry'

import { TScoreSetDetailsDynamicStoreChunk } from './scoreSetDetailsDynamicStoreChunk'

function fetchSet(scoreSetDetailsChunk: TScoreSetDetailsDynamicStoreChunk, userId: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            dispatch(scoreSetDetailsChunk.actions.setIsLoading(true))
            const setId = scoreSetDetailsChunk.props.getId(getState())
            const result = await requestSet(setId, userId)

            if (result) {
                const { scores, set } = result
                dispatch(scoreSetDetailsChunk.actions.setScores(scores))
                dispatch(scoreSetDetailsChunk.actions.setSet(set))
                dispatch(scoreSetDetailsChunk.actions.setPagination(result))
            }
        } catch (error) {
            SentryUtils.sendMessage('fetchSet', error)
        } finally {
            dispatch(scoreSetDetailsChunk.actions.setIsLoading(false))
        }
    }
}

function loadMoreScoresInSet(
    scoreSetDetailsChunk: TScoreSetDetailsDynamicStoreChunk,
    userId: number,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        // onEndReached fires on the first layout, while fetchSet is still in
        // flight and the set has no id yet. Nothing to page through, and
        // nothing worth reporting (MUP-14221).
        const setId = scoreSetDetailsChunk.props.getSet(getState())?.id
        if (!setId) return

        const currentPage = scoreSetDetailsChunk.props.getCurrentPage(getState())
        const totalPages = scoreSetDetailsChunk.props.getTotalPages(getState())

        if (currentPage >= totalPages) return
        // currentPage only advances once the response lands, so without this guard
        // two onEndReached events request and append the same page twice (MUP-14275).
        if (scoreSetDetailsChunk.props.getIsLoadingMore(getState())) return

        dispatch(scoreSetDetailsChunk.actions.setIsLoadingMore(true))

        try {
            const page = currentPage + 1
            const result = await requestSet(setId, userId, page)

            if (result) {
                const { scores } = result
                dispatch(scoreSetDetailsChunk.actions.appendScores(scores))
                dispatch(scoreSetDetailsChunk.actions.setPagination(result))
            }
        } catch (error) {
            SentryUtils.sendMessage('loadMoreScoresInSet', error)
        } finally {
            // Paging owns isLoadingMore only. isLoading belongs to fetchSet, which
            // may still be in flight — clearing it here switched the initial loader
            // off early and flashed the empty state (MUP-14275).
            dispatch(scoreSetDetailsChunk.actions.setIsLoadingMore(false))
        }
    }
}

export default {
    fetchSet,
    loadMoreScoresInSet,
}
