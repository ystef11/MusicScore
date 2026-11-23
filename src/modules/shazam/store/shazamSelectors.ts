import {
    createFiltersAsQueryParamsSelector,
    createFlattenedSelectedFiltersSelector,
    createSelectedFiltersQuantitySelector,
    createSortAsQueryParamsSelector,
} from '@mu-native/search'
import { createSelector } from 'reselect'

import type { MSScoreT } from '../../../App/Model/MSScore'

import { shazamScoreListStoreChunk } from './shazamScoreListStoreChunk'
import { shazamStoreChunk } from './shazamStoreChunk'

export const getShazamScores = createSelector(
    shazamScoreListStoreChunk.props.getScoresIds,
    shazamScoreListStoreChunk.props.getScoresMap,
    (ids, map) => ids.map((id: string | number) => map[id]).filter(Boolean) as MSScoreT[],
)

export const getShazamFilterParams = createSelector(
    shazamStoreChunk.props.getFilterParams,
    filterParams => filterParams,
)

export const getShazamFiltersAsQueryParams = createFiltersAsQueryParamsSelector(
    shazamStoreChunk.props.getSelectedFilters,
)

export const getShazamFlattenedSelectedFilters = createFlattenedSelectedFiltersSelector(
    shazamStoreChunk.props.getSelectedFilters,
)

export const getShazamSortAsQueryParams = createSortAsQueryParamsSelector(
    shazamStoreChunk.props.getSelectedSort,
)

export const getShazamSelectedFiltersQuantity = createSelectedFiltersQuantitySelector(
    shazamStoreChunk.props.getSelectedFilters,
)
