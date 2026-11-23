import { createContext, ReactNode, useContext } from 'react'

import {
    TSelectableFilterKey,
    TSelectedFilters,
    TSelectedSort,
    TSortItem,
} from '../types/searchTypes'

// Abstracts where filter/sort selections live — Browse uses searchStoreChunk,
// Shazam uses shazamStoreChunk, the shared filter sheet UI is agnostic.
export type FilterSelectionsSource = {
    getSelectedFilters: (state: any) => TSelectedFilters | null
    getSelectedSort: (state: any) => TSelectedSort | undefined
    getSelectedFiltersQuantity: (state: any) => number
    setSelectedFilter: (payload: {
        filterKey: TSelectableFilterKey
        itemId: string | number
        value?: string | boolean
    }) => any
    clearSelectedFilters: (filterKey: TSelectableFilterKey) => any
    resetAllSelectedFilters: () => any
    setSelectedSort: (itemId: TSortItem['id']) => any
    resetSelectedSort: () => any
}

const FilterSelectionsContext = createContext<FilterSelectionsSource | null>(null)

export const FilterSelectionsProvider = ({
    source,
    children,
}: {
    source: FilterSelectionsSource
    children: ReactNode
}) => <FilterSelectionsContext.Provider value={source}>{children}</FilterSelectionsContext.Provider>

export const useFilterSelections = (): FilterSelectionsSource => {
    const source = useContext(FilterSelectionsContext)
    if (!source) {
        throw new Error('useFilterSelections must be used inside FilterSelectionsProvider')
    }
    return source
}
