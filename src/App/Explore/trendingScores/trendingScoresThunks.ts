import { DispatchFun } from '@mu-native/common'
import { playlistService } from '@mu-native/playlist-scores'

import { trendingStoreChunk } from './trendingStoreChunk.ts'

export const trendingScoresThunks = {
    fetchScores: () => {
        return async (dispatch: DispatchFun) => {
            try {
                dispatch(trendingStoreChunk.actions.setIsLoading(true))
                const { trending_now: id } = await playlistService.fetchSpecialPlaylistIds()
                if (id) {
                    const scores = await playlistService.fetchScoreList(id)
                    dispatch(trendingStoreChunk.actions.setScores(scores))
                }
            } catch (error) {
                console.warn('[trendingScoresThunks.fetchScores]: ', error)
            } finally {
                dispatch(trendingStoreChunk.actions.setIsLoading(false))
            }
        }
    },
}
