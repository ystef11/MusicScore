import { useInjectStoreChunk } from '@ug/store'
import { apiStoreChunk } from './apiStoreChunk'

export const useLoadApiStoreChunk = () => {
    useInjectStoreChunk(apiStoreChunk, 'modules', apiStoreChunk.getInitialState())
}
