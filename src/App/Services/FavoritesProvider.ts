import { store } from '@mu-native/common'
import { getIsAuthorized } from '@mu-native/auth'
import { localFavoritesList, setLocalFavorite, isLocalFavorite } from './LocalFavorites'
import { hasWebFavoritesSession, webFavoritesList, setWebFavorite } from '../../modules/auth/services/webFavorites'
import { apiRequest, favoritesContracts } from '@mu-native/api'
import { checkConnection } from '@mu-native/system'

import MSScore from '../Model/MSScore'
import { TSortParams } from '../Utils/Sort'

export const usesLocalFavorites = () => !hasWebFavoritesSession() && !getIsAuthorized(store.getState())

export default {
    isFavorite(score: import('../Model/MSScore').MSScoreT) { return usesLocalFavorites() ? isLocalFavorite(score) : score.isFavorite },
    async fetchFavorites(sort: TSortParams, page: number, text?: string, interactive = false) {
        if (usesLocalFavorites()) return localFavoritesList(sort, page, text)
        if (hasWebFavoritesSession()) return webFavoritesList(sort, page, text, interactive)
        const { data, pagination } = await apiRequest(favoritesContracts.list, {
            params: {
                page,
                sort: `${sort.kind}_${sort.order}`,
                text,
            },
        })
        const scores = MSScore.processFavoritesSourceData(data.items) ?? []

        return {
            scores,
            ...pagination,
        }
    },

    async performAddToFavoritesRequest(scoreId: number, score?: import('../Model/MSScore').MSScoreT) {
        if (usesLocalFavorites()) { if (!score) throw new Error('Не получены данные партитуры.'); return setLocalFavorite(score, true) }
        if (hasWebFavoritesSession()) { if (!score) throw new Error('Не получены данные партитуры.'); return setWebFavorite(score, true) }
        checkConnection()
        return apiRequest(favoritesContracts.add, { payload: { score_id: scoreId } })
    },

    async performRemoveFromFavoritesRequest(scoreId: number, score?: import('../Model/MSScore').MSScoreT) {
        if (usesLocalFavorites()) { if (!score) throw new Error('Не получены данные партитуры.'); return setLocalFavorite(score, false) }
        if (hasWebFavoritesSession()) { if (!score) throw new Error('Не получены данные партитуры.'); return setWebFavorite(score, false) }
        checkConnection()
        return apiRequest(favoritesContracts.remove, { params: { score_id: scoreId } })
    },
}
