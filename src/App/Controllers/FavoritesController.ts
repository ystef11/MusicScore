import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import type { MSScoreT } from '../Model/MSScore'
import FavoritesProvider from '../Services/FavoritesProvider'
import '../Model/MSScore'
import SentryUtils from '../Utils/Sentry'

import { spotlightDomains, updateSpotlightIndex } from './SpotlightController'

import '../Utils/Sort'

export default {
    fetchFavorites(chunk: TUniversalScoreListDynamicStoreChunk, interactive = false, onComplete?: (error: string | null) => void) {
        return async (dispatch: (...args: Array<any>) => any, getState: any) => {
            const searchText = chunk.props.getSearchQuery(getState())
            const sortOrder = chunk.props.getSortOrder(getState())
            const sortKind = chunk.props.getSortKind(getState())
            const sort = {
                kind: sortKind,
                order: sortOrder,
            }

            let failure: string | null = null
            try {
                dispatch(chunk.actions.setIsLoading(true))
                const response = await FavoritesProvider.fetchFavorites(sort, 1, searchText, interactive)

                dispatch(chunk.actions.setScores(response.scores))
                dispatch(chunk.actions.setCurrentPage(1))
                dispatch(chunk.actions.setTotalPages(response.totalPages))
                dispatch(chunk.actions.setTotalItems(response.totalItems))
                updateSpotlightIndex(response.scores, spotlightDomains.FAVORITES)
            } catch (error) {
                SentryUtils.sendMessage('fetchFavorites', error)
                failure = error instanceof Error ? error.message : String(error)
            } finally {
                dispatch(chunk.actions.setIsLoading(false))
                onComplete?.(failure)
            }
        }
    },

    loadMoreFavorites(chunk: TUniversalScoreListDynamicStoreChunk) {
        return async (dispatch: (...args: Array<any>) => any, getState: () => any) => {
            const currentPage = chunk.props.getCurrentPage(getState())
            const totalPages = chunk.props.getTotalPages(getState())

            if (currentPage >= totalPages) {
                return
            }

            const searchText = chunk.props.getSearchQuery(getState())
            const sortOrder = chunk.props.getSortOrder(getState())
            const sortKind = chunk.props.getSortKind(getState())
            const sort = {
                kind: sortKind,
                order: sortOrder,
            }

            try {
                dispatch(chunk.actions.setIsLoading(true))
                const response = await FavoritesProvider.fetchFavorites(
                    sort,
                    currentPage + 1,
                    searchText,
                )

                dispatch(chunk.actions.appendScores(response.scores))
                dispatch(chunk.actions.setCurrentPage(response.currentPage))
                dispatch(chunk.actions.setTotalPages(response.totalPages))
                dispatch(chunk.actions.setTotalItems(response.totalItems))

                updateSpotlightIndex(response.scores, spotlightDomains.FAVORITES)
            } catch (error) {
                SentryUtils.sendMessage('loadMoreFavorites', error)
            } finally {
                dispatch(chunk.actions.setIsLoading(false))
            }
        }
    },

    addToFavorites(score: MSScoreT) {
        return async () => {
            await FavoritesProvider.performAddToFavoritesRequest(score.id, score)
            score.isFavorite = true
        }
    },

    removeFromFavorites(score: MSScoreT) {
        return async () => {
            await FavoritesProvider.performRemoveFromFavoritesRequest(score.id, score)
            score.isFavorite = false
        }
    },
}
