import { createExtendedStoreChunk } from '@ug/store'

type TLocaleState = {
    locale: string | null
}

export const localeStoreChunk = createExtendedStoreChunk<TLocaleState>({
    storeKey: 'locale',
    treeKey: 'modules',
})({
    initialState: {
        locale: null,
    },
})
