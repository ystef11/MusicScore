import { createExtendedStoreChunk } from '@ug/store'

import { TPlaylistsStoreChunkState } from '../types/playlistTypes.ts'

export const playlistsStoreChunk = createExtendedStoreChunk<TPlaylistsStoreChunkState>({
    treeKey: 'screens',
    storeKey: 'playlists',
})({
    initialState: {
        playlists: [],
        isLoading: false,
    },
})
