import { apiRequest, purchaseContracts } from '@mu-native/api'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import MSScore from '../../Model/MSScore'
import SentryUtils from '../../Utils/Sentry'

const fetchOrders = (chunk: TUniversalScoreListDynamicStoreChunk, page = 1) => {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        if (chunk.props.getIsLoading(getState())) return

        const totalPages = chunk.props.getTotalPages(getState())
        if (page > 1 && page > totalPages) return

        try {
            dispatch(chunk.actions.setIsLoading(true))

            const response = await apiRequest(purchaseContracts.scoreOrders, { params: { page } })

            const scores = response.items?.length
                ? MSScore.processOrdersSourceData(response.items)
                : null

            if (page === 1) {
                dispatch(chunk.actions.setScores(scores ?? []))
            } else if (scores?.length) {
                dispatch(chunk.actions.appendScores(scores))
            }

            dispatch(
                chunk.actions.setPagination({
                    currentPage: page,
                    totalPages: response._meta?.pageCount ?? 1,
                    totalItems: response._meta?.totalCount ?? scores?.length ?? 0,
                }),
            )
        } catch (error) {
            SentryUtils.sendMessage('updateOrdersScoresError', error)
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

export const updateOrders = (chunk: TUniversalScoreListDynamicStoreChunk) => {
    return async (dispatch: (...args: Array<any>) => any) => {
        await dispatch(fetchOrders(chunk, 1))
    }
}

export const loadMoreOrders = (chunk: TUniversalScoreListDynamicStoreChunk) => {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        const currentState = getState()
        const currentPage = chunk.props.getCurrentPage(currentState)
        const totalPages = chunk.props.getTotalPages(currentState)

        if (currentPage >= totalPages) return

        await dispatch(fetchOrders(chunk, currentPage + 1))
    }
}
