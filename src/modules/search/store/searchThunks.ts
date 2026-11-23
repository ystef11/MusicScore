import type { DispatchFun, TThunkAction } from '@mu-native/common'

import { convertBrowseFiltersData } from '../dataConverters/convertBrowseFilterData.ts'
import { processBrowseFilters } from '../helpers/browseFilters.ts'
import { searchService } from '../services/searchService.ts'
import { TFiltersAPIData } from '../types/searchTypes'

import { TFilterSelectionStoreChunk } from './filterSelectionStoreChunk.ts'
import { searchStoreChunk } from './searchStoreChunk'

const initFilterParams: TThunkAction = () => async (dispatch: DispatchFun) => {
    try {
        const { filters } = await searchService.getBrowseFilters()
        dispatch(setFilterParams(filters))
    } catch (error) {
        console.log('@@initFilterParams error', error)
    }
}

const setFilterParams = (rawFilters: TFiltersAPIData) => (dispatch: DispatchFun) => {
    try {
        const filters = convertBrowseFiltersData(rawFilters)

        const processedFilters = processBrowseFilters(filters)

        dispatch(searchStoreChunk.actions.setQuickFilters(rawFilters.quick_filters ?? []))
        dispatch(searchStoreChunk.actions.setFilterParams(processedFilters))
    } catch (error) {
        console.log('@@setFilterParams error', error)
    }
}

// Loads the filter schema into an arbitrary (e.g. screen-scoped) chunk instead
// of the global one, so encapsulated screens can own their own catalog.
const loadFilterParamsInto =
    (chunk: TFilterSelectionStoreChunk) => async (dispatch: DispatchFun) => {
        try {
            const { filters } = await searchService.getBrowseFilters()
            dispatch(chunk.actions.setQuickFilters(filters.quick_filters ?? []))
            dispatch(
                chunk.actions.setFilterParams(
                    processBrowseFilters(convertBrowseFiltersData(filters)),
                ),
            )
        } catch (error) {
            console.log('@@loadFilterParamsInto error', error)
        }
    }

const setFilterParamsInto =
    (chunk: TFilterSelectionStoreChunk, rawFilters: TFiltersAPIData) => (dispatch: DispatchFun) => {
        try {
            dispatch(
                chunk.actions.setFilterParams(
                    processBrowseFilters(convertBrowseFiltersData(rawFilters)),
                ),
            )
        } catch (error) {
            console.log('@@setFilterParamsInto error', error)
        }
    }

export const searchThunks = {
    get initFilterParams() {
        return initFilterParams
    },

    get setFilterParams() {
        return setFilterParams
    },

    get loadFilterParamsInto() {
        return loadFilterParamsInto
    },

    get setFilterParamsInto() {
        return setFilterParamsInto
    },
}
