import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

export type DigitalEbooksSimilarStoreState = {
    ebookId: string
    page: number
    didEndReached: boolean
    isFetchingMore: boolean
    state:
        | { type: 'initialLoading' }
        | { type: 'ebooks'; data: DigitalEbookModel[] }
        | { type: 'error'; data: string }
}

export function createDigitalEbooksSimilarChunkStore(key: string, ebookId: string) {
    return createExtendedStoreChunk<DigitalEbooksSimilarStoreState>({
        treeKey: 'screens',
        storeKey: `${Date.now()}_${key}`,
    })({
        initialState: {
            ebookId,
            page: 1,
            didEndReached: false,
            isFetchingMore: false,
            state: { type: 'initialLoading' },
        },
        actions: {
            setNewState: (items: DigitalEbookModel[], state) => {
                const prevItems = state.state.type === 'ebooks' ? state.state.data : []
                return {
                    didEndReached: items.length === 0 || items.length < 20,
                    page: state.page + 1,
                    isFetchingMore: false,
                    state: {
                        type: 'ebooks',
                        data: state.page > 1 ? [...prevItems, ...items] : items,
                    },
                }
            },
        },
    })
}

export type DigitalEbooksSimilarChunk = ReturnType<typeof createDigitalEbooksSimilarChunkStore>

export const DigitalEbooksSimilarContext = createContext<
    ReturnType<DigitalEbooksSimilarChunk> | undefined
>(undefined)
export function useDigitalEbooksSimilarChunk() {
    return useContext(DigitalEbooksSimilarContext)! as DigitalEbooksSimilarChunk
}
