import { useInjectStoreChunk } from '@ug/store'

import { hubsStoreChunk } from './hubsStoreChunk'

export const useLoadHubsStoreChunk = () => {
    useInjectStoreChunk(hubsStoreChunk, 'modules', hubsStoreChunk.getInitialState())
}
