import { type TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import { State } from '../../Reducers/Types'
import UserScoresProvider from '../../Services/UserScoresProvider'
import SentryUtils from '../../Utils/Sentry'
import { TSortParams } from '../../Utils/Sort'

interface LoadUserParams {
    userId: number | string
    page?: number
    sort?: TSortParams
    searchText?: string | undefined | null
}

function loadUserScores(
    chunk: TUniversalScoreListDynamicStoreChunk,
    {
        page = 1,
        sort = { kind: 'date_updated', order: 'desc' },
        searchText,
        userId,
    }: LoadUserParams,
) {
    return async (dispatch: (...args: Array<any>) => any) => {
        dispatch(chunk.actions.setIsLoading(true))

        try {
            const perPage = 15
            const { scores, totalPages, currentPage, totalItems } =
                // @ts-ignore
                await UserScoresProvider.performGetUserScoresRequest(userId, {
                    page,
                    sort,
                    searchText,
                    perPage,
                })

            if (page > 1) {
                dispatch(chunk.actions.appendScores(scores))
            } else {
                dispatch(chunk.actions.setScores(scores))
            }

            dispatch(chunk.actions.setTotalPages(totalPages))
            dispatch(chunk.actions.setCurrentPage(currentPage))
            dispatch(chunk.actions.setTotalItems(totalItems))
        } catch (error) {
            SentryUtils.sendMessage('loadUserScores', error)
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

export function updateUserScores(chunk: TUniversalScoreListDynamicStoreChunk, page?: number) {
    return async (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        const userId = chunk.props.getUniqueId(getState())
        const sortOrder = chunk.props.getSortOrder(getState())
        const sortKind = chunk.props.getSortKind(getState())
        const searchText = chunk.props.getSearchQuery(getState())

        const sort = { kind: sortKind, order: sortOrder }

        await dispatch(loadUserScores(chunk, { userId, sort, searchText, page }))
    }
}

export function loadMoreUserScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        const currentPage = chunk.props.getCurrentPage(getState())
        const totalPages = chunk.props.getTotalPages(getState())
        const sortOrder = chunk.props.getSortOrder(getState())
        const sortKind = chunk.props.getSortKind(getState())
        const searchText = chunk.props.getSearchQuery(getState())

        const sort = { kind: sortKind, order: sortOrder }

        if (currentPage >= totalPages) {
            return
        }

        const userId = chunk.props.getUniqueId(getState())
        dispatch(
            loadUserScores(chunk, {
                userId,
                page: currentPage + 1,
                sort,
                searchText,
            }),
        )
    }
}
