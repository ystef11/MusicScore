import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

export type DigitalEbookFavoritesStoreState = {
    state:
        | { type: 'initialLoading' }
        | { type: 'ebooks'; data: DigitalEbookModel[] }
        | { type: 'emptySearch' }
        | { type: 'empty' }
    searchText: string
    isSearching: boolean
    page: number
    isLoadingMore: boolean
    didReachedEnd: boolean
}

export function createDigitalEbookFavoritesChunkStore(key: string) {
    return createExtendedStoreChunk<DigitalEbookFavoritesStoreState>({
        treeKey: 'screens',
        storeKey: `${Date.now()}_${key}`,
    })({
        initialState: {
            searchText: '',
            isSearching: false,
            page: 1,
            isLoadingMore: false,
            didReachedEnd: false,
            state: { type: 'initialLoading' },
        },
        actions: {
            clearSearch: () => {
                return { searchText: '' }
            },

            resetPagination: () => {
                return {
                    didReachedEnd: false,
                    page: 1,
                    isLoadingMore: false,
                }
            },

            removeItem: (id: string, state) => {
                if (state.state.type !== 'ebooks') return state
                return {
                    state: { type: 'ebooks', data: state.state.data.filter(s => s.id !== id) },
                }
            },
        },
    })
}

export type DigitalEbookFavoritesChunk = ReturnType<typeof createDigitalEbookFavoritesChunkStore>

export const DigitalEbookFavoritesContext = createContext<
    ReturnType<DigitalEbookFavoritesChunk> | undefined
>(undefined)
export function useDigitalEbookFavoritesChunk() {
    return useContext(DigitalEbookFavoritesContext)! as DigitalEbookFavoritesChunk
}
