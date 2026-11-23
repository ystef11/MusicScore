import { useInjectStoreChunk } from '@ug/store'
import { authStoreChunk } from './authStoreChunk'

export const useLoadAuthStoreChunk = () => {
    useInjectStoreChunk(authStoreChunk, 'modules', authStoreChunk.getInitialState())
}
