import { apiRequest, scoreContracts, TScoreDto } from '@mu-native/api'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import {
    buildSearchEventParams,
    getFiltersAsQueryParams,
    getFlattenedSelectedFilters,
    getSortAsQueryParams,
    searchService,
    searchStoreChunk,
    searchThunks,
    TFilterSelectionStoreChunk,
} from '@mu-native/search'
import { checkConnection } from '@mu-native/system'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import { getIsSelectedAnyQuickFilter } from '../../modules/search/store/searchSelectors.ts'
import MetricaEvents from '../constants/MetricaEvents'
import MSScore, { MSScoreT } from '../Model/MSScore'
import type { State } from '../Reducers/Types'
import reportEvent from '../Utils/Analytics'

export type SearchOptions = {
    text?: string
    parts?: number
    page: number
    instrument?: string[]
    instrumentation?: string[]
    sort?: string
    hub_alias?: string | null
    artist_id?: number | string
    song_id?: number | string
    recording_type?: string
    no_search_correction?: boolean
    /** 'non-official' исключает официальные (платные) скоры из выдачи. */
    type?: string
}
export type SearchResult = {
    corrected_query?: string
    scores: Array<MSScoreT>
    currentPage: number
    totalPages: number
    totalItems: number
}

function processSearchResults(results: TScoreDto[]): Array<MSScoreT> {
    return results
        .filter(item => MSScore.isScoreSourceItemValid(item))
        ?.map(item => new MSScore(item))
}

function getParts(parts_min: number, parts_max: number) {
    if (!parts_min && !parts_max) {
        return {}
    }

    if (parts_min && !parts_max) {
        return { parts: parts_min }
    }

    if (parts_max && !parts_min) {
        return { parts: parts_max }
    }

    if (parts_min === parts_max) {
        return { parts: parts_min }
    }

    return { parts_min, parts_max }
}

function processSearchOptions(options: Record<string, any>): SearchOptions {
    const { searchText, page, filters, sort, no_search_correction } = options

    const searchOptions: SearchOptions = {
        text: searchText,
        ...getParts(filters?.partsMin, filters?.partsMax),
        page,
        sort: sort || 'relevance',
        no_search_correction,
    }

    return { ...filters, ...searchOptions }
}

export async function performSearch(searchOptions: SearchOptions): Promise<SearchResult | null> {
    try {
        checkConnection(false)
        const { data, pagination } = await apiRequest(scoreContracts.search, {
            params: searchOptions,
        })

        return {
            scores: processSearchResults(data.scores),
            corrected_query: data.corrected_query,
            ...pagination,
        }
    } catch (error) {
        reportEvent('performSearch', { error: String(error) })
        return null
    }
}

export function doFetchScores(
    chunk: TUniversalScoreListDynamicStoreChunk,
    page = 1,
    omitEvents = false,
    no_search_correction: boolean | undefined = undefined,
    // When provided, these are used instead of the global selection — lets a
    // screen fetch with its own encapsulated filters / text query.
    filtersOverride: Record<string, string> | undefined = undefined,
    searchTextOverride: string | undefined = undefined,
    sortOverride: Record<string, string> | undefined = undefined,
    // When provided, the fresh query-scoped schema is written into this
    // encapsulated chunk instead of the global one — keeps a screen's pinned
    // filter options in sync with the live result set and leaves the global
    // browse schema (control group) untouched.
    filterParamsChunk: TFilterSelectionStoreChunk | undefined = undefined,
) {
    return async (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        if (chunk.props.getIsLoading(getState())) return

        try {
            dispatch(chunk.actions.setIsLoading(true))
            const totalPages = chunk.props.getTotalPages(getState())
            const scoreIds = chunk.props.getScoresIds(getState())
            if (page > 1 && page >= totalPages) return

            const searchText =
                searchTextOverride ?? searchStoreChunk.props.getSearchTerm(getState())
            const filters = filtersOverride ?? getFiltersAsQueryParams(getState())
            const filtersFlattened = getFlattenedSelectedFilters(getState())
            const sortQueryParams = sortOverride ?? getSortAsQueryParams(getState())
            const searchQueryId = searchStoreChunk.props.getSearchQueryId(getState())
            const isQuickFilterSelected = getIsSelectedAnyQuickFilter(getState())

            const searchOptions = processSearchOptions({
                ...sortQueryParams,
                filters,
                searchText,
                page,
                no_search_correction,
            })

            const offset = page > 1 ? scoreIds.length : 0
            const { filters: rawFilters } = await searchService.getBrowseFilters({
                ...filters,
                ...(searchText ? { text: searchText } : {}),
            })
            if (filterParamsChunk) {
                dispatch(searchThunks.setFilterParamsInto(filterParamsChunk, rawFilters))
            } else {
                dispatch(searchThunks.setFilterParams(rawFilters))
            }

            const response = await performSearch(searchOptions)

            if (!response) throw new Error()

            const { scores, ...pagination } = response
            scores.forEach((score, position) => {
                const params = buildSearchEventParams({
                    filters: filtersFlattened,
                    sort: searchOptions.sort || 'relevance',
                    totalCount: offset + scores.length,
                    page: pagination.currentPage,
                    score,
                    offset,
                    position,
                    searchQueryId,
                    searchQuery: searchText,
                    quickFilters: isQuickFilterSelected,
                })
                if (!omitEvents) {
                    reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW, params)
                }
            })

            if (page === 1) {
                dispatch(chunk.actions.setScores(scores))
            } else {
                dispatch(chunk.actions.appendScores(scores))
            }
            dispatch(chunk.actions.setPagination(pagination))
            dispatch(chunk.actions.setCorrectedQuery(response.corrected_query ?? ''))

            const isHaveOffScores = scores.some(item => !!item?.isOfficial)
            if (isHaveOffScores) {
                reportEvent(MetricaEvents.BROWSE_OFFICIAL_SCORE_SHOW)
            }
        } catch (error: any) {
            switch (error?.message) {
                case 'No results found':
                    break

                default:
                    reportEvent('updateScores', error)
            }
            // show error
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
            dispatch(chunk.actions.setIsInitialLoading(false))
        }
    }
}

export function loadMoreScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const currentPage = chunk.props.getCurrentPage(getState())
        await dispatch(doFetchScores(chunk, currentPage + 1))
    }
}

export function fetchScores(chunk: TUniversalScoreListDynamicStoreChunk, omitEvents = false) {
    return async (dispatch: (...args: Array<any>) => any) => {
        await dispatch(doFetchScores(chunk, 1, omitEvents))
    }
}
