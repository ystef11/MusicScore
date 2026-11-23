import { useInjectStoreChunk } from '@ug/store'

import { giftChecklistStoreChunk } from './giftChecklistStoreChunk.ts'

export const useLoadGiftChecklistStoreChunk = () => {
    useInjectStoreChunk(
        giftChecklistStoreChunk,
        'modules',
        giftChecklistStoreChunk.getInitialState(),
    )
}
