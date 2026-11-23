import { useInjectStoreChunk } from '@ug/store'

import { profileScreenStoreChunk } from './profileScreenStoreChunk'

export const useLoadProfileScreenStore = () => {
    useInjectStoreChunk(
        profileScreenStoreChunk,
        'screens',
        profileScreenStoreChunk.getInitialState(),
    )
}
