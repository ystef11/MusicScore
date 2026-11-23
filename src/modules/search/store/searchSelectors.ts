import { createSelector } from 'reselect'

import { camelToSnake } from '../helpers/common'
import { TSelectableFilterKey, TSelectedFilters, TSelectedSort } from '../types/searchTypes'

import { searchStoreChunk } from './searchStoreChunk'

type SelectedFiltersGetter = (state: any) => TSelectedFilters | null
type SelectedSortGetter = (state: any) => TSelectedSort | undefined

export const getBrowseFilters = createSelector(
    searchStoreChunk.props.getFilterParams,
    filterParams => filterParams,
)

export const createSortAsQueryParamsSelector = (getSelectedSort: SelectedSortGetter) =>
    createSelector(getSelectedSort, selectedSort => {
        if (!selectedSort) return {}
        return { sort: selectedSort }
    })

export const selectedFiltersToQueryParams = (
    selectedFilters: TSelectedFilters | null,
): Record<string, string> => {
    if (!selectedFilters) return {}

    const queryParams: Record<string, string> = {}

    ;(Object.keys(selectedFilters) as TSelectableFilterKey[]).forEach(filterKey => {
        const queryFilterKey = camelToSnake(filterKey)
        queryParams[queryFilterKey] = ''

        Object.keys(selectedFilters[filterKey] ?? {}).forEach(id => {
            const filter = selectedFilters[filterKey]?.[id]
            if (filter === undefined) {
                return
            }

            if (typeof filter !== 'boolean') {
                queryParams[id] = filter
                return
            }

            if (!filter) return

            if (queryParams[queryFilterKey]?.slice(-1) !== '') {
                queryParams[queryFilterKey] += `,${id}`
            } else {
                queryParams[queryFilterKey] += `${id}`
            }
        })
    })
    return queryParams
}

export const createFiltersAsQueryParamsSelector = (getSelectedFilters: SelectedFiltersGetter) =>
    createSelector(getSelectedFilters, selectedFiltersToQueryParams)

export const createFlattenedSelectedFiltersSelector = (getSelectedFilters: SelectedFiltersGetter) =>
    createSelector(getSelectedFilters, selectedFilters => {
        if (!selectedFilters) return []

        const flattened: { key: string; value: string | boolean }[] = []

        ;(Object.keys(selectedFilters) as TSelectableFilterKey[]).forEach(filterKey => {
            const filterName = camelToSnake(filterKey)

            Object.keys(selectedFilters[filterKey] ?? {}).forEach(id => {
                const item = selectedFilters[filterKey]
                if (item === undefined) return

                if (typeof item[id] !== 'boolean') {
                    flattened.push({
                        key: filterName,
                        value: item[id],
                    })
                    return
                }

                if (!item[id]) return
                flattened.push({ key: filterName, value: `${id}` })
            })
        })

        return flattened
    })

export const getSortAsQueryParams = createSortAsQueryParamsSelector(
    searchStoreChunk.props.getSelectedSort,
)

export const getFiltersAsQueryParams = createFiltersAsQueryParamsSelector(
    searchStoreChunk.props.getSelectedFilters,
)

export const getFlattenedSelectedFilters = createFlattenedSelectedFiltersSelector(
    searchStoreChunk.props.getSelectedFilters,
)

export const getIsSelectedAnyQuickFilter = createSelector(
    getFlattenedSelectedFilters,
    searchStoreChunk.props.getQuickFilters,
    (filters, quickFilters) => {
        if (!quickFilters) return false
        if (quickFilters.length === 0) return false
        // eslint-disable-next-line no-restricted-syntax
        for (const filter of filters) {
            // eslint-disable-next-line no-restricted-syntax
            for (const quickFilter of quickFilters) {
                if (
                    filter.key.toString() === quickFilter.param.toString() &&
                    filter.value.toString() === quickFilter.id.toString()
                ) {
                    return true
                }
            }
        }
        return false
    },
)

export const createSelectedFiltersQuantitySelector = (getSelectedFilters: SelectedFiltersGetter) =>
    createSelector(getSelectedFilters, selectedFilters => {
        if (selectedFilters) {
            return (Object.keys(selectedFilters) as TSelectableFilterKey[]).filter(
                filterItemKey => {
                    return Object.entries(selectedFilters[filterItemKey] ?? {}).some(
                        ([_, item]) => {
                            return !!item
                        },
                    )
                },
            )?.length
        }
        return 0
    })

export const getAllSelectedFiltersQuantity = createSelectedFiltersQuantitySelector(
    searchStoreChunk.props.getSelectedFilters,
)
