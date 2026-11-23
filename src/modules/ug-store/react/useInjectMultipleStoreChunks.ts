import { useStore } from 'react-redux'
import { createStoreChunkManager } from '../init'
import type { TStoreChunkInjectParams } from '../types/storeInjectTypes'

export const useInjectMultipleStoreChunks = <T>(stores: TStoreChunkInjectParams<T>[]) => {
    const store = useStore()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const chunkManager = createStoreChunkManager(store)
    stores.forEach(chunk => chunkManager.injectChunk(chunk))
}
