import { DispatchFun } from '@mu-native/common'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import { playlistDataConverter } from '../dataConverters/playlistDataConverter.ts'
import { playlistService } from '../services/playlistService.ts'
import { TPlaylist } from '../types/playlistTypes.ts'

import { playlistsStoreChunk } from './playlistsStoreChunk.ts'

export const playlistsThunks = {
    fetchPlaylists: () => {
        return async (dispatch: DispatchFun) => {
            try {
                dispatch(playlistsStoreChunk.actions.setIsLoading(true))
                const rawPlaylists = await playlistService.fetchList()
                const playlists = rawPlaylists.map(playlistDataConverter)
                dispatch(playlistsStoreChunk.actions.setPlaylists(playlists))
            } catch (error) {
                console.warn(`[Playlists.fetchPlaylists]: `, error)
            } finally {
                dispatch(playlistsStoreChunk.actions.setIsLoading(false))
            }
        }
    },
    fetchScoreList: (chunk: TUniversalScoreListDynamicStoreChunk, id: TPlaylist['id']) => {
        return async (dispatch: DispatchFun) => {
            try {
                dispatch(chunk.actions.setIsInitialLoading(true))
                dispatch(chunk.actions.setIsLoading(true))
                const scores = await playlistService.fetchScoreList(id)
                dispatch(chunk.actions.setScores(scores))
            } catch (error) {
                console.warn(`[Playlists.fetchScoreList]: `, error)
            } finally {
                dispatch(chunk.actions.setIsLoading(false))
                dispatch(chunk.actions.setIsInitialLoading(false))
            }
        }
    },
}
