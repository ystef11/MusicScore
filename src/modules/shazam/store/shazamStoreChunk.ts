import type { TShazamSearchMode as TShazamSearchModeDto } from '@mu-native/api'
import {
    TRenderFilters,
    TSelectableFilterKey,
    TSelectedFilters,
    TSelectedSort,
    TSortItem,
} from '@mu-native/search'
import { createExtendedStoreChunk } from '@ug/store'

export type TShazamSearchMode = TShazamSearchModeDto

export type TShazamSearchMeta = {
    title: string
    artist: string
    composer_name: string
    isrc: string
    apple_music_id: string
    shazam_id: string
}

type TShazamState = {
    hasUsedShazam: boolean
    searchMeta: TShazamSearchMeta | null
    mode: TShazamSearchMode | null
    // Filter structure (available options) returned by the shazam search endpoint.
    // Kept separate from searchStoreChunk.filterParams so the narrower shazam-side
    // taxonomy doesn't leak into Browse's filter sheet.
    filterParams: TRenderFilters | undefined
    // Shazam-session-scoped filter selections. Decoupled from searchStoreChunk so
    // applying a filter inside the Shazam flow doesn't bleed into Browse and vice
    // versa.
    selectedFilters: TSelectedFilters | null
    selectedSort: TSelectedSort | undefined
}

const INITIAL_SELECTED_SORT: TSelectedSort = 'relevance'

export const shazamStoreChunk = createExtendedStoreChunk<TShazamState>({
    storeKey: 'shazam',
    treeKey: 'modules',
})({
    initialState: {
        hasUsedShazam: false,
        searchMeta: null,
        mode: null,
        filterParams: undefined,
        selectedFilters: null,
        selectedSort: INITIAL_SELECTED_SORT,
    },
    persist: ['hasUsedShazam'],
    actions: {
        markUsed: () => ({ hasUsedShazam: true }),
        setSearchMeta: (searchMeta: TShazamSearchMeta | null) => ({ searchMeta }),
        setMode: (mode: TShazamSearchMode | null) => ({ mode }),
        setFilterParams: (filterParams: TRenderFilters | undefined) => ({ filterParams }),
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
        ) => ({
            selectedFilters: {
                ...state.selectedFilters,
                [filterKey]: {
                    ...state.selectedFilters?.[filterKey],
                    [itemId]: value ?? !state.selectedFilters?.[filterKey]?.[itemId],
                },
            },
        }),
        clearSelectedFilters: (filterKey: TSelectableFilterKey, state) => {
            const selectedFilters = { ...state.selectedFilters }
            if (filterKey in selectedFilters) {
                delete selectedFilters[filterKey]
            }
            return { selectedFilters }
        },
        resetAllSelectedFilters: () => ({ selectedFilters: null }),
        setSelectedSort: (itemId: TSortItem['id']) => ({ selectedSort: itemId }),
        resetSelectedSort: () => ({ selectedSort: INITIAL_SELECTED_SORT }),
    },
})
