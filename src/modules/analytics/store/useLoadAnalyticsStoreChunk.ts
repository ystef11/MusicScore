import { useInjectStoreChunk } from '@ug/store'
import { analyticsStoreChunk } from './analyticsStoreChunk'

export const useLoadAnalyticsStoreChunk = () => {
    useInjectStoreChunk(analyticsStoreChunk, 'modules', analyticsStoreChunk.getInitialState())
}
