import { useInjectStoreChunk } from '@ug/store'
import { searchStoreChunk } from './searchStoreChunk'

export const useLoadSearchStoreChunk = () => {
    useInjectStoreChunk(searchStoreChunk, 'modules', searchStoreChunk.getInitialState())
}
