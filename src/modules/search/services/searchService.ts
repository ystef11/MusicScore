import {
    apiRequest,
    scoreContracts,
    TScoreSearchFiltersDto,
    TScoreSearchParamsDto,
} from '@mu-native/api'

import type { TFiltersAPIData, TQuickFilterFilterAPIItem } from '../types/searchTypes'

/**
 * The wire types a quick filter's `param` as a free string; the app selects by
 * `TSelectableFilterKey`. Quick filters are configured on the backend against the app's own
 * filter keys, so they are trusted as-is, the way the untyped client always did.
 */
export const toFiltersAPIData = (filters: TScoreSearchFiltersDto): TFiltersAPIData => ({
    ...filters,
    quick_filters: filters.quick_filters as TQuickFilterFilterAPIItem[] | undefined,
})

const getBrowseFilters = async (params: Partial<TScoreSearchParamsDto> = {}) => {
    const response = await apiRequest(scoreContracts.searchFilterOptions, { params })
    return { ...response, filters: toFiltersAPIData(response.filters) }
}

export const searchService = {
    get getBrowseFilters() {
        return getBrowseFilters
    },
}
