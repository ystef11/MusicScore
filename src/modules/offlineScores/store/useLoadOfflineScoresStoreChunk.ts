import { useInjectStoreChunk } from '@ug/store'

import { offlineScoresStoreChunk } from './offlineScoresStoreChunk'

export const useLoadOfflineScoresStoreChunk = () => {
    useInjectStoreChunk(
        offlineScoresStoreChunk,
        'modules',
        offlineScoresStoreChunk.getInitialState(),
    )
}
