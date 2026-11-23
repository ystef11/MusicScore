import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

export type DigitalEbooksCategoryStoreState = {
    isInitialLoading: boolean
    isFetchingMore: boolean
    didEndReached: boolean
    ebooks: DigitalEbookModel[]
    page: number
    categoryId: string
}

export function createDigitalEbooksCategoryChunkStore(key: string, categoryId: string) {
    return createExtendedStoreChunk<DigitalEbooksCategoryStoreState>({
        treeKey: 'modules',
        storeKey: `${Date.now()}_${key}`,
    })({
        initialState: {
            isInitialLoading: true,
            isFetchingMore: false,
            didEndReached: false,
            ebooks: [],
            page: 1,
            categoryId,
        },
        actions: {},
    })
}

export type DigitalEbookCategoryChunk = ReturnType<typeof createDigitalEbooksCategoryChunkStore>

export const DigitalEbooksCategoryContext = createContext<
    ReturnType<DigitalEbookCategoryChunk> | undefined
>(undefined)
export function useDigitalEbooksCategoryChunk() {
    return useContext(DigitalEbooksCategoryContext)! as DigitalEbookCategoryChunk
}
