import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

export type DigitalEbookPurchasedStoreState = {
    state:
        | { type: 'initialLoading' }
        | { type: 'ebooks'; data: DigitalEbookModel[] }
        | { type: 'error'; data: string }
}

export function createDigitalEbookPurchasedChunkStore(key: string) {
    return createExtendedStoreChunk<DigitalEbookPurchasedStoreState>({
        storeKey: `${Date.now()}_${key}`,
        treeKey: 'screens',
    })({
        initialState: {
            state: { type: 'initialLoading' },
        },
        actions: {},
    })
}

export type DigitalEbookPurchasedChunk = ReturnType<typeof createDigitalEbookPurchasedChunkStore>

export const DigitalEbookPurchasedContext = createContext<
    ReturnType<DigitalEbookPurchasedChunk> | undefined
>(undefined)
export function useDigitalEbookPurchasedChunk() {
    return useContext(DigitalEbookPurchasedContext)! as DigitalEbookPurchasedChunk
}
