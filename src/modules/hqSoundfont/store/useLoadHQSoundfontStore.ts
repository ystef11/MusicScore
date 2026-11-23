import { useInjectStoreChunk } from '@ug/store'

import { hqSoundfontStoreChunk } from './hqSoundfontStoreChunk'

export const useLoadHQSoundfontStore = () => {
    useInjectStoreChunk(hqSoundfontStoreChunk, 'modules')
}
