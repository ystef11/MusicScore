import { createStoreChunk } from '@ug/store'

type TTourUpdateScreenState = Record<string, string>

export const tourUpdateScreenStoreChunk = createStoreChunk<TTourUpdateScreenState>({
    treeKey: 'modules',
    storeKey: 'tourUpdate',
})({
    initialState: {},
    actions: {},
})
