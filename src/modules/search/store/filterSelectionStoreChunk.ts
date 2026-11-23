import { createExtendedStoreChunk } from '@ug/store'

import { FilterSelectionsSource } from '../contexts/FilterSelectionsContext'
import {
    TCommonRenderSort,
    TQuickFilterFilterAPIItem,
    TRenderFilters,
    TSelectableFilterKey,
    TSelectedFilters,
    TSelectedSort,
} from '../types/searchTypes'

import { createSelectedFiltersQuantitySelector } from './searchSelectors'

// Holds the filter schema (`filterParams`) together with the current selection
// (`selectedFilters` / `selectedSort`). This mirrors the filter slice of the
// global `searchStoreChunk`, but as a factory so each screen can own an
// encapsulated, disposable instance (inject on mount, drop on unmount) the same
// way `createUniversalScoreListDynamicStoreChunk` works for score lists.
export type TFilterSelectionState = {
    filterParams: TRenderFilters | undefined
    quickFilters: TQuickFilterFilterAPIItem[]
    selectedFilters: TSelectedFilters | null
    selectedSort: TSelectedSort | undefined
    sortParams: TCommonRenderSort | null
    // The text query is part of the encapsulated state too, so a search screen
    // can own its query alongside its filters (browse screens just leave it '').
    searchTerm: string
}

const DEFAULT_SORT_PARAMS: TCommonRenderSort = [
    { id: 'relevance', name: 'relevance' },
    { id: 'comment_count', name: 'comment count' },
    { id: 'view_count', name: 'view count' },
    { id: 'rating', name: 'rating' },
    { id: 'date_uploaded', name: 'upload date' },
]

const DEFAULT_SORT: TSelectedSort = 'relevance'

export function createFilterSelectionStoreChunk(key: string) {
    return createExtendedStoreChunk<TFilterSelectionState>({
        treeKey: 'screens',
        storeKey: key,
    })({
        initialState: {
            filterParams: undefined,
            quickFilters: [],
            selectedFilters: null,
            selectedSort: DEFAULT_SORT,
            sortParams: DEFAULT_SORT_PARAMS,
            searchTerm: '',
        },
        actions: {
            setSearchTerm: (searchTerm: string) => ({ searchTerm }),
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
            setSelectedSort: (itemId: TSelectedSort) => ({ selectedSort: itemId }),
            resetSelectedSort: () => ({ selectedSort: DEFAULT_SORT }),
        },
    })
}

export type TFilterSelectionStoreChunk = ReturnType<typeof createFilterSelectionStoreChunk>

// Adapts a filter-selection chunk to the source the shared filter UI expects,
// so the sheet/chips read and write this encapsulated chunk instead of global.
export function createFilterSelectionsSource(
    chunk: TFilterSelectionStoreChunk,
): FilterSelectionsSource {
    return {
        getSelectedFilters: chunk.props.getSelectedFilters,
        getSelectedSort: chunk.props.getSelectedSort,
        getSelectedFiltersQuantity: createSelectedFiltersQuantitySelector(
            chunk.props.getSelectedFilters,
        ),
        setSelectedFilter: chunk.actions.setSelectedFilters,
        clearSelectedFilters: chunk.actions.clearSelectedFilters,
        resetAllSelectedFilters: chunk.actions.resetAllSelectedFilters,
        setSelectedSort: chunk.actions.setSelectedSort,
        resetSelectedSort: chunk.actions.resetSelectedSort,
    }
}
