import { useInjectStoreChunk } from '@ug/store'

import { shazamStoreChunk } from './shazamStoreChunk'

export const useLoadShazamStoreChunk = () => {
    useInjectStoreChunk(shazamStoreChunk, 'modules', shazamStoreChunk.getInitialState())
}
