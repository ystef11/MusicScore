import { getIsAuthorized } from '@mu-native/auth'
import { getFlattenedSelectedFilters, searchStoreChunk } from '@mu-native/search'

import { State } from '../Reducers/Types'

export function getExploreContext(state: State) {
    const isAuthorized = getIsAuthorized(state)
    const searchTerm = searchStoreChunk.props.getSearchTerm(state)
    const filtersApplied = getFlattenedSelectedFilters(state)
    const sortApplied = searchStoreChunk.props.getSelectedSort(state)
    return isAuthorized &&
        !searchTerm?.length &&
        !filtersApplied.length &&
        sortApplied === 'relevance'
        ? 'personal'
        : 'common'
}
