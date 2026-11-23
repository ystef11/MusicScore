import { useInjectStoreChunk } from '@ug/store'
import { reviewAppStoreChunk } from './reviewAppStoreChunk'

export const useLoadReviewAppStoreChunk = () => {
    useInjectStoreChunk(reviewAppStoreChunk, 'modules', reviewAppStoreChunk.getInitialState())
}
