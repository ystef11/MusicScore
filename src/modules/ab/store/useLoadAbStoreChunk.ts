import { useInjectStoreChunk } from '@ug/store'
import { abStoreChunk } from './abStoreChunk'

export const useLoadAbStoreChunk = () => {
    useInjectStoreChunk(abStoreChunk, 'modules', abStoreChunk.getInitialState())
}
