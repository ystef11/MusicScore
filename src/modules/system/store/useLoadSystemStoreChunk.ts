import { useInjectStoreChunk } from '@ug/store'
import { systemStoreChunk } from './systemStoreChunk'

export const useLoadSystemStoreChunk = () => {
    useInjectStoreChunk(systemStoreChunk, 'modules', systemStoreChunk.getInitialState())
}
