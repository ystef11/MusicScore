import { useInjectStoreChunk } from '@ug/store'

import { scoreStoreChunk } from './scoreStoreChunk'

export const useLoadScoreStoreChunk = () => {
    useInjectStoreChunk(scoreStoreChunk, 'modules', scoreStoreChunk.getInitialState())
}
