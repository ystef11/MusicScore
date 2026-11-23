import { createExtendedStoreChunk } from '@ug/store'

import {
    DigitalEbookFilters,
    DigitalEbookModel,
    DigitalEbooksSectionList,
} from '../api/digital.ebooks.models'

type DigitalEbooksStoreState = {
    isInitialLoading: boolean
    ebooks: DigitalEbooksSectionList[]
    suggestions: string[]

    uiListResult:
        | { type: 'feed' }
        | { type: 'search'; data: DigitalEbookModel[] }
        | { type: 'searchEmpty'; data: DigitalEbookModel[] }
        | { type: 'initialLoading' }
        | { type: 'searching' }

    filters: DigitalEbookFilters | null
    originalFilters: DigitalEbookFilters | null
    isLoadingFilters: boolean
    isUpdatingFilter: boolean
    hasAnySelectedFilter: boolean

    isSearching: boolean
    searchText: string
    searchEbooksResult: DigitalEbookModel[]
    didSearchEndReached: boolean
    isSearchFetchingMore: boolean
    searchPage: number
}

const INITIAL_PAGINATION = {
    didSearchEndReached: false,
    searchEbooksResult: [],
    searchPage: 1,
}

const RECENTLY_VIEWED = 'recently-viewed'
export const digitalEbooksStore = createExtendedStoreChunk<DigitalEbooksStoreState>({
    storeKey: 'digital_ebooks',
    treeKey: 'screens',
})({
    persist: [],
    initialState: {
        uiListResult: { type: 'initialLoading' },
        searchText: '',
        isInitialLoading: true,
        ebooks: [],
        filters: null,
        originalFilters: null,
        isLoadingFilters: false,
        isUpdatingFilter: false,
        hasAnySelectedFilter: false,
        suggestions: [],

        isSearching: false,
        searchEbooksResult: [],
        didSearchEndReached: false,
        isSearchFetchingMore: false,
        searchPage: 1,
    },

    actions: {
        resetPagination: () => {
            return { ...INITIAL_PAGINATION }
        },

        clearSearch: (_: null, state) => {
            return {
                ...INITIAL_PAGINATION,
                searchText: '',
                uiListResult: { type: 'feed', data: [...state.ebooks] },
            }
        },

        updateRecentlyViewed: (item: DigitalEbookModel, state) => {
            const section = state.ebooks.find(e => e.uri === RECENTLY_VIEWED)
            if (!section) return state
            section.data = section.data.filter(e => e.id !== item.id)
            section.data.unshift(item)
            return { ebooks: [...state.ebooks] }
        },

        clearFilters: (_: null, state) => {
            return {
                ...INITIAL_PAGINATION,
                hasAnySelectedFilter: false,
                filters: null,
                originalFilters: null,
                uiListResult: { type: 'feed', data: [...state.ebooks] },
            }
        },

        updateFilterSelected: (
            { id, type }: { id: string; type: keyof DigitalEbookFilters['filters'] },
            state,
        ) => {
            if (!state.filters) return state
            if (type === 'sort') {
                return {
                    hasAnySelectedFilter: true,
                    filters: {
                        ...state.filters,
                        filters: {
                            ...state.filters.filters,
                            sort: state.filters.filters.sort.map(s => {
                                if (s.type !== id) return { ...s, selected: false }
                                return { ...s, selected: true }
                            }),
                        },
                    },
                }
            }
            let filter = state.filters.filters[type]
            filter = filter.map(f => {
                if (f.id !== id) return f
                return { ...f, selected: !f.selected }
            })
            const isAnySelected = !!filter.find(f => f.selected)
            return {
                hasAnySelectedFilter: isAnySelected,
                filters: {
                    ...state.filters,
                    filters: { ...state.filters.filters, [type]: filter },
                },
            }
        },

        changeSuggestions: (data: string[]) => {
            return { suggestions: data }
        },
    },
})
