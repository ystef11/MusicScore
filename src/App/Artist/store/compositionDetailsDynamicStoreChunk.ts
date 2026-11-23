import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

type TCompositionDetailsDynamicStoreChunkState = {
    id: number
    info: {
        name: string
        counters: { scores: number }
        avatar: string | null
    } | null
}

export const createCompositionDetailsDynamicStoreChunk = (
    key: string,
    id: number,
    increment = 0,
) => {
    return createExtendedStoreChunk<TCompositionDetailsDynamicStoreChunkState>({
        treeKey: 'screens',
        storeKey: `composition_details_${key}_${id}_${increment}`,
    })({
        initialState: {
            id,
            info: null,
        },
    })
}

export type TCompositionDetailsDynamicStoreChunk = ReturnType<
    typeof createCompositionDetailsDynamicStoreChunk
>

export const CompositionDetailsContext = createContext<
    ReturnType<TCompositionDetailsDynamicStoreChunk> | undefined
>(undefined)

export function useCompositionDetailsContext() {
    return useContext(CompositionDetailsContext)! as TCompositionDetailsDynamicStoreChunk
}
