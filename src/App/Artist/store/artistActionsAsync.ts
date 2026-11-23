import { apiRequest, artistContracts, songContracts } from '@mu-native/api'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import { performSearch } from '../../Services/SearchProvider'
import SentryUtils from '../../Utils/Sentry'

import { TArtistDetailsDynamicStoreChunk } from './artistDetailsDynamicStoreChunk.ts'
import { TCompositionDetailsDynamicStoreChunk } from './compositionDetailsDynamicStoreChunk.ts'

export function loadArtistScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const artist_id = chunk.props.getUniqueId(getState())
            const response = await performSearch({ artist_id, page: 1 })

            if (!response) {
                return
            }
            const { scores, ...pagination } = response
            dispatch(chunk.actions.setScores(scores))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            dispatch(chunk.actions.setScores([]))
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

export function loadMoreArtistScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const currentPage = chunk.props.getCurrentPage(getState())
            const totalPages = chunk.props.getTotalPages(getState())

            if (currentPage >= totalPages) {
                return
            }

            const artist_id = chunk.props.getUniqueId(getState())
            const response = await performSearch({ artist_id, page: currentPage + 1 })

            if (!response) {
                return
            }
            const { scores, ...pagination } = response
            dispatch(chunk.actions.appendScores(scores))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            console.log('LOAD MORE ARTIST SCORES ERROR', error)
        }
    }
}

export function loadArtistInfo(chunk: TArtistDetailsDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const id = chunk.props.getId(getState())
        try {
            const response = await apiRequest(artistContracts.info, { params: { id } })

            dispatch(
                chunk.actions.setInfo({
                    ...response,
                    avatar: response.avatar_image,
                }),
            )
        } catch (error) {
            SentryUtils.sendMessage('loadArtistInfo', error)
        }
    }
}

export function loadCompositionScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const song_id = chunk.props.getUniqueId(getState())
            const response = await performSearch({ song_id, page: 1 })

            if (!response) {
                return
            }
            const { scores, ...pagination } = response
            dispatch(chunk.actions.setScores(scores))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            dispatch(chunk.actions.setScores([]))
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

export function loadMoreCompositionScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const currentPage = chunk.props.getCurrentPage(getState())
            const totalPages = chunk.props.getTotalPages(getState())

            if (currentPage >= totalPages) {
                return
            }

            const song_id = chunk.props.getUniqueId(getState())
            const response = await performSearch({ song_id, page: currentPage + 1 })

            if (!response) {
                return
            }
            const { scores, ...pagination } = response
            dispatch(chunk.actions.appendScores(scores))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            console.log('LOAD MORE ARTIST SCORES ERROR', error)
        }
    }
}

export function loadCompositionInfo(chunk: TCompositionDetailsDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const id = chunk.props.getId(getState())
        const response = await apiRequest(songContracts.info, { params: { id } })

        dispatch(
            chunk.actions.setInfo({
                ...response,
                avatar: response.avatar_image,
            }),
        )
    }
}
