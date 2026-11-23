import { useInjectStoreChunk } from '@ug/store'

import { emailVerificationStoreChunk } from './emailVerificationStoreChunk'

export const useLoadEmailVerificationStoreChunk = () => {
    useInjectStoreChunk(
        emailVerificationStoreChunk,
        'modules',
        emailVerificationStoreChunk.getInitialState(),
    )
}
