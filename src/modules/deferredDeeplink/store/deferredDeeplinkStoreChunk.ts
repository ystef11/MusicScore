import { createExtendedStoreChunk } from '@ug/store'

import { DeepLinksValues } from '../types/deepLinks.ts'

type TDeferredDeeplinkState = {
    data: { action: DeepLinksValues; payload: string }[]
}

export const deferredDeeplinkStoreChunk = createExtendedStoreChunk<TDeferredDeeplinkState>({
    treeKey: 'modules',
    storeKey: 'deferredDeeplink',
})({
    persist: ['data'],
    initialState: {
        data: [],
    },
    actions: {
        filterDeeplinkDataByAction: (action: DeepLinksValues, state) => ({
            data: state.data.filter(item => item.action !== action),
        }),
    },
})
