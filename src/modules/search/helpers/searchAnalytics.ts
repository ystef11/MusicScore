import type { MSScoreT } from '../../../App/Model/MSScore'

type TSearchResultViewEventParams = {
    filters?: { key: string; value: string | boolean }[]
    sort?: string
    totalCount: number
    page: number
    entity?: 'score' | 'recently_viewed'
    offset?: number
    position: number
    score: MSScoreT
    searchQueryId?: number
    searchQuery?: string
    screen?: string
    quickFilters?: boolean
    searchType?: string
}

export const buildSearchEventParams = ({
    filters = [],
    sort = 'relevance',
    totalCount,
    page,
    entity = 'score',
    offset = 0,
    position,
    score,
    searchQueryId,
    searchQuery,
    quickFilters,
    screen = searchQuery ? 'SearchMain' : 'BrowseMain',
    searchType,
}: TSearchResultViewEventParams) => {
    // eslint-disable-next-line no-nested-ternary
    const computedSearchType = quickFilters ? 'quick filters' : searchQuery ? 'search' : 'browse'
    return {
        search_filters_group: filters.map(filter => filter.key),
        search_filters: filters.map(filter => `${filter.value}`),
        search_sort: sort,
        search_session_results_cnt: totalCount,
        search_result_page_num: page,
        search_result_entity: entity,
        search_result_entity_id: score?.idAnalytics,
        search_result_entity_place: position !== undefined ? offset + position : undefined,
        search_result_entity_num: position !== undefined ? offset + position : undefined,
        search_query_id: searchQueryId,
        search_session_text: searchQuery,
        'params.key': ['score_type'],
        'params.str_value': [score.isOfficial ? 'official' : 'regular'],
        'params.value': [0],
        screen,
        search_type: searchType ?? computedSearchType,
    }
}
