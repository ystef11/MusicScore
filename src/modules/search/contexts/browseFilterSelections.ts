import { getAllSelectedFiltersQuantity } from '../store/searchSelectors'
import { searchStoreChunk } from '../store/searchStoreChunk'

import { FilterSelectionsSource } from './FilterSelectionsContext'

export const browseFilterSelections: FilterSelectionsSource = {
    getSelectedFilters: searchStoreChunk.props.getSelectedFilters,
    getSelectedSort: searchStoreChunk.props.getSelectedSort,
    getSelectedFiltersQuantity: getAllSelectedFiltersQuantity,
    setSelectedFilter: searchStoreChunk.actions.setSelectedFilters,
    clearSelectedFilters: searchStoreChunk.actions.clearSelectedFilters,
    resetAllSelectedFilters: searchStoreChunk.actions.resetAllSelectedFilters,
    setSelectedSort: searchStoreChunk.actions.setSelectedSort,
    resetSelectedSort: searchStoreChunk.actions.resetSelectedSort,
}
