import type { FilterSelectionsSource } from '@mu-native/search'

import { getShazamSelectedFiltersQuantity } from './shazamSelectors'
import { shazamStoreChunk } from './shazamStoreChunk'

export const shazamFilterSelections: FilterSelectionsSource = {
    getSelectedFilters: shazamStoreChunk.props.getSelectedFilters,
    getSelectedSort: shazamStoreChunk.props.getSelectedSort,
    getSelectedFiltersQuantity: getShazamSelectedFiltersQuantity,
    setSelectedFilter: shazamStoreChunk.actions.setSelectedFilters,
    clearSelectedFilters: shazamStoreChunk.actions.clearSelectedFilters,
    resetAllSelectedFilters: shazamStoreChunk.actions.resetAllSelectedFilters,
    setSelectedSort: shazamStoreChunk.actions.setSelectedSort,
    resetSelectedSort: shazamStoreChunk.actions.resetSelectedSort,
}
