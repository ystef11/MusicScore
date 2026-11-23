import { useInjectStoreChunk } from '@ug/store'

import { libraryPurchasesStoreChunk } from './libraryPurchasesStoreChunk'

export const useLoadLibraryPurchasesStoreChunk = () => {
    useInjectStoreChunk(
        libraryPurchasesStoreChunk,
        'modules',
        libraryPurchasesStoreChunk.getInitialState(),
    )
}
