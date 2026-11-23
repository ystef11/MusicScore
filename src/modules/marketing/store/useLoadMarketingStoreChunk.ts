import { useInjectStoreChunk } from '@ug/store'
import { marketingStoreChunk } from './marketingStoreChunk'

export const useLoadMarketingStoreChunk = () => {
    useInjectStoreChunk(marketingStoreChunk, 'modules', marketingStoreChunk.getInitialState())
}
