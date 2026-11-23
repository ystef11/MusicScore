import { useInjectStoreChunk } from '@ug/store'
import { profileStoreChunk } from './profileStoreChunk'

export const useLoadProfileStoreChunk = () => {
    useInjectStoreChunk(profileStoreChunk, 'modules', profileStoreChunk.getInitialState())
}
