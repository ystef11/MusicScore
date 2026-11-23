import { useInjectStoreChunk } from '@ug/store'

import { ebookWebViewScreenStoreChunk } from './ebookWebViewScreenStoreChunk'

const useLoadCurrentEbookScreenStore = () => {
    useInjectStoreChunk(
        ebookWebViewScreenStoreChunk,
        'screens',
        ebookWebViewScreenStoreChunk.getInitialState(),
    )
}

export default useLoadCurrentEbookScreenStore
