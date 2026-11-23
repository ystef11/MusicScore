import { useInjectStoreChunk } from '@ug/store'

import scoreSaleScreenStoreChunk from './scoreSaleScreenStoreChunk'

export const useLoadScoreSaleScreenStore = () => {
    useInjectStoreChunk(
        scoreSaleScreenStoreChunk,
        'screens',
        scoreSaleScreenStoreChunk.getInitialState(),
    )
}
