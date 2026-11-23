import { useInjectStoreChunk } from '@ug/store'

import { npsStoreChunk } from './npsStoreChunk'

export const useLoadNpsStoreChunk = () => {
    useInjectStoreChunk(npsStoreChunk, 'modules', npsStoreChunk.getInitialState())
}
