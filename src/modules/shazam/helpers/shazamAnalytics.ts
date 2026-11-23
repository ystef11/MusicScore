import { getStoreValue } from '@mu-native/common'
import { Screen } from '@mu-native/navigation'
import {
    buildSearchEventParams,
    getFlattenedSelectedFilters,
    getSortAsQueryParams,
} from '@mu-native/search'

import type { MSScoreT } from '../../../App/Model/MSScore'
import { shazamStoreChunk } from '../store/shazamStoreChunk'

export const buildShazamScoreClickEventParams = ({
    score,
    scores,
}: {
    score: MSScoreT
    scores: MSScoreT[]
}) => {
    const meta = getStoreValue(shazamStoreChunk.props.getSearchMeta)
    const filtersFlattened = getStoreValue(getFlattenedSelectedFilters)
    const sortQueryParams = getStoreValue(getSortAsQueryParams)
    const searchQuery = meta ? [meta.title, meta.artist].filter(Boolean).join(' ') : ''

    return buildSearchEventParams({
        filters: filtersFlattened,
        sort: sortQueryParams.sort || 'relevance',
        totalCount: scores.length,
        // Match browse-click convention: page=0 on click events.
        page: 0,
        position: scores.indexOf(score),
        score,
        searchQuery,
        screen: Screen.shazamResults,
        searchType: 'shazam',
    })
}
