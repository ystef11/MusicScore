import { createExtendedStoreChunk } from '@ug/store'

type TScoreSaleScreenData = {
    title: string
}

const scoreSaleScreenStoreChunk = createExtendedStoreChunk<TScoreSaleScreenData>({
    treeKey: 'screens',
    storeKey: 'scoreSale',
})({
    initialState: {
        title: '',
    },
})

export default scoreSaleScreenStoreChunk
