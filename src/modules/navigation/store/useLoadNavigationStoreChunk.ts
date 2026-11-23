import { useInjectStoreChunk } from '@ug/store'
import { navigationStoreChunk } from './navigationStoreChunk'

export const useLoadNavigationStoreChunk = () => {
    useInjectStoreChunk(navigationStoreChunk, 'modules', navigationStoreChunk.getInitialState())
}
