import { createExtendedStoreChunk } from '@ug/store'

import { MSScoreT } from '../../../App/Model/MSScore.ts'
import {
    TRenderFilters,
    TCommonRenderSort,
    TRecentSearch,
    TRecentSearchFilter,
    TSearchSession,
    TSortItem,
    TSelectedFilters,
    TSelectedSort,
    TSelectableFilterKey,
    TQuickFilterFilterAPIItem,
} from '../types/searchTypes'

type TSearchState = {
    isSearchInputFocused: boolean
    searchSession: TSearchSession | null
    searchTerm: string
    searchQueryId: number | undefined
    filterParams: TRenderFilters | undefined
    quickFilters: TQuickFilterFilterAPIItem[]
    selectedFilters: TSelectedFilters | null
    sortParams: TCommonRenderSort | null
    selectedSort: TSelectedSort | undefined
    searchHistory: string[]
    // Locally persisted query+filters pairs; richer than the server-side
    // text-only `searchHistory`.
    recentSearches: TRecentSearch[]
    suggestions: string[]
    trendingSearchSuggestions: { suggestions: string[]; trendingScores: MSScoreT[] } | undefined
    headerHeight: number
}

const initialState: TSearchState = {
    isSearchInputFocused: false,
    searchSession: null,
    searchTerm: '',
    searchQueryId: undefined,
    filterParams: undefined,
    selectedFilters: null,
    headerHeight: 0,
    quickFilters: [],
    sortParams: [
        {
            id: 'relevance',
            name: 'relevance',
        },
        {
            id: 'comment_count',
            name: 'comment count',
        },
        {
            id: 'view_count',
            name: 'view count',
        },
        {
            id: 'rating',
            name: 'rating',
        },
        {
            id: 'date_uploaded',
            name: 'upload date',
        },
    ],
    selectedSort: 'relevance',
    searchHistory: [],
    recentSearches: [],
    suggestions: [],
    trendingSearchSuggestions: undefined,
}

const SEARCH_SESSION_TTL = 30 * 60 * 1000 // ms

function updateSearchSession(state: TSearchState, forceUpdate = false): TSearchSession {
    const storedSearchSession = state.searchSession
    let searchSession = storedSearchSession ? { ...storedSearchSession } : null
    const now = Date.now()
    if (forceUpdate || !searchSession) {
        searchSession = { id: now }
    } else {
        const isLive = now - searchSession.id < SEARCH_SESSION_TTL
        searchSession.id = isLive ? searchSession.id : now
    }
    return searchSession
}

export const searchStoreChunk = createExtendedStoreChunk<TSearchState>({
    treeKey: 'modules',
    storeKey: 'search',
})({
    persist: ['recentSearches'],
    initialState,
    actions: {
        setSearchTerm: (searchTerm: string, state) => {
            const isChanged = searchTerm !== state.searchTerm
            let searchQueryId
            if (searchTerm) {
                searchQueryId = isChanged ? Date.now() : state.searchQueryId
            } else {
                searchQueryId = undefined
            }

            const isBrowseSearchTransition =
                (!!searchTerm && !state.searchTerm) || (!searchTerm && !!state.searchTerm)
            const searchSession = updateSearchSession(state, isBrowseSearchTransition)

            return {
                searchTerm,
                searchQueryId,
                searchSession,
            }
        },
        setSelectedFilters: (
            {
                filterKey,
                itemId,
                value,
            }: {
                filterKey: TSelectableFilterKey
                itemId: string | number
                value?: string | boolean
            },
            state,
        ) => {
            const selectedFilters = {
                ...state.selectedFilters,
                [filterKey]: {
                    ...state.selectedFilters?.[filterKey],
                    [itemId]: value ?? !state.selectedFilters?.[filterKey]?.[itemId],
                },
            }

            return {
                selectedFilters,
            }
        },
        clearSelectedFilters: (filterKey: TSelectableFilterKey, state) => {
            const selectedFilters = {
                ...state.selectedFilters,
            }

            if (filterKey in selectedFilters) {
                delete selectedFilters[filterKey]
            }

            return {
                selectedFilters,
            }
        },
        createSearchSession: (_, state) => ({
            searchSession: updateSearchSession(state),
        }),

        resetSelectedSort: () => ({
            selectedSort: initialState.selectedSort,
        }),
        resetAllSelectedFilters: () => {
            return { selectedFilters: null }
        },
        setFilterParams: (filterParams: TRenderFilters) => ({
            filterParams,
        }),
        setSelectedSort: (itemId: TSortItem['id']) => ({
            selectedSort: itemId,
        }),
        setIsSearchInputFocused: (isFocused: boolean) => ({
            isSearchInputFocused: isFocused,
        }),
        addToSearchHistory: (searchTerm: string, state) => {
            let searchHistory = state.searchHistory.filter(item => item !== searchTerm)
            searchHistory = [searchTerm, ...searchHistory]
            searchHistory = searchHistory.slice(0, 10)

            return { searchHistory }
        },
        // Upserts the entry for the query: re-searching moves it to the top, and
        // filters applied during the session replace the remembered ones. Passing
        // no filters keeps whatever the entry already had.
        addRecentSearch: (
            { query, filters }: { query: string; filters?: TRecentSearchFilter[] },
            state,
        ) => {
            const trimmed = query.trim()
            if (!trimmed) return {}

            const lowerQuery = trimmed.toLowerCase()
            const existing = state.recentSearches.find(
                item => item.query.toLowerCase() === lowerQuery,
            )
            const entry: TRecentSearch = {
                query: trimmed,
                filters: filters ?? existing?.filters ?? [],
            }
            const rest = state.recentSearches.filter(
                item => item.query.toLowerCase() !== lowerQuery,
            )
            return { recentSearches: [entry, ...rest].slice(0, 10) }
        },
    },
})
