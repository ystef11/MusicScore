import { DispatchFun, GetStateFun } from '@mu-native/common'

import { requestSets } from '../../../../../App/profileScreens/users/userService'
import SentryUtils from '../../../../../App/Utils/Sentry'

import { TScoreSetListDynamicStoreChunk } from './scoreSetListDynamicStoreChunk'

function fetchSets(scoreSetListChunk: TScoreSetListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const userId = scoreSetListChunk.props.getId(getState())
            const result = await requestSets(userId)

            if (result) {
                const { sets } = result
                dispatch(scoreSetListChunk.actions.setItems(sets))
                dispatch(scoreSetListChunk.actions.setPagination(result))
            }
        } catch (error) {
            SentryUtils.sendMessage('fetchSets', error)
        } finally {
            dispatch(scoreSetListChunk.actions.setIsLoading(false))
        }
    }
}

function loadMoreSets(scoreSetListChunk: TScoreSetListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const userId = scoreSetListChunk.props.getId(getState())
            const currentPage = scoreSetListChunk.props.getCurrentPage(getState())
            const totalPages = scoreSetListChunk.props.getTotalPages(getState())

            if (currentPage >= totalPages) return

            const page = currentPage + 1
            const result = await requestSets(userId, page)

            if (result) {
                const { sets } = result
                dispatch(scoreSetListChunk.actions.appendSets(sets))
                dispatch(scoreSetListChunk.actions.setPagination(result))
            }
        } catch (error) {
            SentryUtils.sendMessage('loadMoreSets', error)
        } finally {
            dispatch(scoreSetListChunk.actions.setIsLoading(false))
        }
    }
}

export default {
    fetchSets,
    loadMoreSets,
}
