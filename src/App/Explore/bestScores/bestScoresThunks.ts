import { DispatchFun } from '@mu-native/common'
import { playlistService } from '@mu-native/playlist-scores'

import { bestScoresStoreChunk } from './bestScoresStoreChunk.ts'

export const bestScoresThunks = {
    fetchScores: () => {
        return async (dispatch: DispatchFun) => {
            try {
                dispatch(bestScoresStoreChunk.actions.setIsLoading(true))
                const { best_of_musescore: id } = await playlistService.fetchSpecialPlaylistIds()
                if (id) {
                    const scores = await playlistService.fetchScoreList(id)
                    dispatch(bestScoresStoreChunk.actions.setScores(scores))
                }
            } catch (error) {
                console.warn('[bestScoresThunks.fetchScores]: ', error)
            } finally {
                dispatch(bestScoresStoreChunk.actions.setIsLoading(false))
            }
        }
    },
}
