import { DispatchFun, GetStateFun } from '@mu-native/common'
import { Screen } from '@mu-native/navigation'
import {
    buildSearchEventParams,
    convertBrowseFiltersData,
    processBrowseFilters,
} from '@mu-native/search'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import type { State } from '../../../App/Reducers/Types'
import reportEvent from '../../../App/Utils/Analytics'
import { searchShazamScores } from '../services/shazamSearchService'

import {
    getShazamFiltersAsQueryParams,
    getShazamFlattenedSelectedFilters,
    getShazamSortAsQueryParams,
} from './shazamSelectors'
import { shazamStoreChunk, TShazamSearchMode } from './shazamStoreChunk'

const buildShazamSearchQuery = (state: State): string => {
    const meta = shazamStoreChunk.props.getSearchMeta(state)
    if (!meta) return ''
    return [meta.title, meta.artist].filter(Boolean).join(' ')
}

const buildBaseParams = (
    state: State,
    options: { withSticky: boolean },
): Record<string, string | number> | null => {
    const meta = shazamStoreChunk.props.getSearchMeta(state)
    if (!meta) return null

    const filterParams = getShazamFiltersAsQueryParams(state)
    const sortParams = getShazamSortAsQueryParams(state)
    const stickyMode = options.withSticky ? shazamStoreChunk.props.getMode(state) : null

    const base: Record<string, string | number> = {
        title: meta.title,
        artist: meta.artist,
        composer_name: meta.composer_name,
        isrc: meta.isrc,
        apple_music_id: meta.apple_music_id,
        shazam_id: meta.shazam_id,
        ...filterParams,
    }

    if (sortParams.sort) base.sort = sortParams.sort
    if (stickyMode === 'artist') base.mode = 'artist'

    return base
}

const fetchShazamScores =
    (chunk: TUniversalScoreListDynamicStoreChunk, page = 1) =>
    async (dispatch: DispatchFun, getState: GetStateFun) => {
        if (chunk.props.getIsLoading(getState())) return

        const base = buildBaseParams(getState(), { withSticky: page > 1 })
        if (!base) {
            dispatch(chunk.actions.setIsInitialLoading(false))
            return
        }

        dispatch(chunk.actions.setIsLoading(true))
        try {
            const totalPages = chunk.props.getTotalPages(getState())
            if (page > 1 && page >= totalPages) return

            const startedAt = Date.now()
            const offset = page > 1 ? chunk.props.getScoresIds(getState()).length : 0
            const result = await searchShazamScores({ ...base, page } as any)

            if (result.rawFilters) {
                try {
                    const processed = processBrowseFilters(
                        convertBrowseFiltersData(result.rawFilters),
                    )
                    dispatch(shazamStoreChunk.actions.setFilterParams(processed))
                } catch (error) {
                    console.log('@@shazamSetFilterParams error', error)
                }
            }

            if (page === 1) {
                dispatch(shazamStoreChunk.actions.setMode(result.mode as TShazamSearchMode))
                dispatch(chunk.actions.setScores(result.scores))
                reportEvent(MetricaEvents.SHAZAM_SEARCH_RESULT, {
                    mode: result.mode,
                    total_count: result.totalItems,
                    latency_ms: Date.now() - startedAt,
                })
            } else {
                dispatch(chunk.actions.appendScores(result.scores))
            }

            dispatch(
                chunk.actions.setPagination({
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalItems: result.totalItems,
                }),
            )

            const filtersFlattened = getShazamFlattenedSelectedFilters(getState())
            const sortQueryParams = getShazamSortAsQueryParams(getState())
            const searchQuery = buildShazamSearchQuery(getState())
            result.scores.forEach((score, position) => {
                const params = buildSearchEventParams({
                    filters: filtersFlattened,
                    sort: sortQueryParams.sort || 'relevance',
                    totalCount: result.totalItems,
                    page: result.currentPage,
                    score,
                    offset,
                    position,
                    searchQuery,
                    screen: Screen.shazamResults,
                    searchType: 'shazam',
                })
                reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW, params)
            })
        } catch (error) {
            reportEvent('shazamSearch', { error: String(error) })
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
            dispatch(chunk.actions.setIsInitialLoading(false))
        }
    }

const loadMoreShazamScores =
    (chunk: TUniversalScoreListDynamicStoreChunk) =>
    async (dispatch: DispatchFun, getState: GetStateFun) => {
        const currentPage = chunk.props.getCurrentPage(getState())
        await dispatch(fetchShazamScores(chunk, currentPage + 1))
    }

// Mirrors screenExploreThunks.search signature so ScreenFilterNew can dispatch it
// when filters/sort change. Re-fetches from page 1 — buildBaseParams reads sticky
// mode only for page>1, so the server naturally re-enters the song-first cascade.
// We keep the previous mode in the store so the screen doesn't flash 'empty' before
// the new response lands; the response overwrites mode on success.
const search =
    (chunk: TUniversalScoreListDynamicStoreChunk, _searchTerm?: string) =>
    async (dispatch: DispatchFun) => {
        dispatch(chunk.actions.setScores([]))
        dispatch(chunk.actions.resetPagination())
        await dispatch(fetchShazamScores(chunk, 1))
    }

export const shazamSearchThunks = {
    get fetch() {
        return fetchShazamScores
    },
    get loadMore() {
        return loadMoreShazamScores
    },
    get search() {
        return search
    },
}
