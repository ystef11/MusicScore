import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

type TArtistDetailsDynamicStoreChunkState = {
    id: number
    info: {
        name: string
        counters: { songs: number; scores: number }
        avatar: string | null
        songs: { id: number; name: string }[]
    } | null
}

export const createArtistDetailsDynamicStoreChunk = (key: string, id: number, increment = 0) => {
    return createExtendedStoreChunk<TArtistDetailsDynamicStoreChunkState>({
        storeKey: `artist_details_${key}_${id}_${increment}`,
        treeKey: 'screens',
    })({
        initialState: {
            id,
            info: null,
        },
    })
}

export type TArtistDetailsDynamicStoreChunk = ReturnType<
    typeof createArtistDetailsDynamicStoreChunk
>

export const ArtistDetailsContext = createContext<
    ReturnType<TArtistDetailsDynamicStoreChunk> | undefined
>(undefined)

export function useArtistDetailsContext() {
    return useContext(ArtistDetailsContext)! as TArtistDetailsDynamicStoreChunk
}
