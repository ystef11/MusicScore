import { apiRequest, playlistContracts } from '@mu-native/api'

import MSScore from '../../../../../App/Model/MSScore'
import { TPlaylist } from '../types/playlistTypes.ts'

export const playlistService = {
    fetchList: async () => {
        const { playlists } = await apiRequest(playlistContracts.search)
        return playlists
    },
    fetchSpecialPlaylistIds: async () => {
        const { best_of_musescore, trending_now } = await apiRequest(playlistContracts.search)
        return { best_of_musescore, trending_now }
    },
    /** First page only (20 scores); the pagination headers are not followed. */
    fetchScoreList: async (id: TPlaylist['id']) => {
        const { data } = await apiRequest(playlistContracts.info, { params: { id } })
        return data.scores.map(item => new MSScore(item))
    },
}
