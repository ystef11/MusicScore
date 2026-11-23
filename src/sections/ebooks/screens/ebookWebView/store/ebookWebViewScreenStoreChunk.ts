import { createExtendedStoreChunk } from '@ug/store'

type TCurrentEbookScreenData = {
    ebookUrl: string
    isLoading: boolean
}

export const ebookWebViewScreenStoreChunk = createExtendedStoreChunk<TCurrentEbookScreenData>({
    treeKey: 'screens',
    storeKey: 'ebookWebView',
})({
    initialState: {
        ebookUrl: '',
        isLoading: false,
    },
})
