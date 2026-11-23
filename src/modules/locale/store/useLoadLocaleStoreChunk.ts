import { useInjectStoreChunk } from '@ug/store'
import { localeStoreChunk } from './localeStoreChunk'

export const useLoadLocaleStoreChunk = () => {
    useInjectStoreChunk(localeStoreChunk, 'modules', localeStoreChunk.getInitialState())
}
