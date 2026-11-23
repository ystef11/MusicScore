import {
    ApiErrorCodes,
    apiRequest,
    getServerTimestamp,
    responseCode,
    scoreContracts,
} from '@mu-native/api'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { DispatchFun, GetStateFun, store } from '@mu-native/common'
import { hubConstants, THub, THubDetailsDynamicStoreChunk } from '@mu-native/hub-common'
import { recentlyViewedScoresStoreChunk } from '@mu-native/recently-viewed-scores'
import {
    buildSearchEventParams,
    convertBrowseFiltersData,
    processBrowseFilters,
    resolveInitialFilters,
    searchService,
    searchThunks,
    selectedFiltersToQueryParams,
    TFilterSelectionStoreChunk,
    TInitialFilter,
    TSelectedFilters,
} from '@mu-native/search'
import { checkConnectionSafely } from '@mu-native/system'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import MetricaEvents from '../constants/MetricaEvents'
import MSScore, { MSScoreT } from '../Model/MSScore'
import { State } from '../Reducers/Types'
import { requestRecentlyScores } from '../Services/ScoreInfoProvider'
import { doFetchScores, fetchScores, loadMoreScores } from '../Services/SearchProvider'
import reportEvent from '../Utils/Analytics'
import SentryUtils from '../Utils/Sentry'

import { getExploreContext } from './exploreSelectors'
import { requestHubInfo, requestHubScores, requestHubSubscription } from './hubService'

export function fetchHubInfo(chunk: THubDetailsDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const hubId = chunk.props.getHub(getState()).id

        if (hubId === hubConstants.hubNewForYou.id) return

        const response = await requestHubInfo(hubId)
        if (!response) return

        dispatch(chunk.actions.setHub({ ...response.hub, subscribed: response.subscribed }))
    }
}

function doFetchHubScores(chunk: TUniversalScoreListDynamicStoreChunk, page = 1) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        try {
            const totalPages = chunk.props.getTotalPages(getState())

            if (page > 1 && page >= totalPages) {
                return
            }

            const hubId = chunk.props.getUniqueId(getState())
            const existingScores = chunk.props.getScoresIds(getState())
            const offset = page > 1 ? existingScores.length : 0

            const response = await requestHubScores(hubId, page)

            if (!response) return

            const { scores, ...pagination } = response

            if (page === 1) {
                dispatch(chunk.actions.setScores(scores))
            } else {
                dispatch(chunk.actions.appendScores(scores))
            }
            dispatch(chunk.actions.setPagination(pagination))
            scores?.forEach((score, position) => {
                const params = buildSearchEventParams({
                    filters: [{ key: 'hub', value: `${hubId}` }],
                    totalCount: offset + scores.length,
                    page: page + 1,
                    score,
                    offset,
                    position,
                    screen: 'HubMain',
                })
                reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW, params)
            })
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

export function fetchHubScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun) => {
        await dispatch(doFetchHubScores(chunk, 1))
    }
}

export function loadMoreHubScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const currentPage = chunk.props.getCurrentPage(getState())
        await dispatch(doFetchHubScores(chunk, currentPage + 1))
    }
}

export function updateHubSubscription(chunk: THubDetailsDynamicStoreChunk, subscribed: boolean) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isAuthorized = getIsAuthorized(getState())
        const hub = chunk.props.getHub(getState())

        if (!isAuthorized) {
            dispatch(
                authStoreChunk.actions.presentAuthModal(() =>
                    updateHubSubscription(chunk, subscribed),
                ),
            )
        } else {
            const success = await requestHubSubscription(hub.id, subscribed)
            if (success) {
                dispatch(chunk.actions.setHub({ ...hub, subscribed }))
            }
        }
    }
}

function doFetchPersonalScores(chunk: TUniversalScoreListDynamicStoreChunk, page = 1) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            // Raised like doFetchScores does: the Browse FSR waits for this flag's load edge
            dispatch(chunk.actions.setIsLoading(true))
            const totalPages = chunk.props.getTotalPages(getState())
            const existingScores = chunk.props.getScoresIds(getState())

            if (page > 1 && page >= totalPages) return
            const response = await requestHubScores(hubConstants.hubSelectedForYou.id, page)
            if (!response) return
            const { scores, ...pagination } = response

            if (page === 1) {
                dispatch(chunk.actions.setScores(scores))
            } else {
                dispatch(chunk.actions.appendScores(scores))
            }

            dispatch(chunk.actions.setPagination(pagination))

            const offset = page === 1 ? 0 : existingScores.length
            response.scores?.forEach((score: MSScoreT, position: number) => {
                const params = buildSearchEventParams({
                    filters: [{ key: 'hub', value: `${hubConstants.hubNewForYou.id}` }],
                    totalCount: offset + response.scores.length,
                    page: 1,
                    score,
                    offset,
                    position,
                    screen: 'BrowseMain',
                })
                reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW, params)
            })
        } catch (error) {
            SentryUtils.sendMessage('doFetchPersonalScores', error)
        } finally {
            dispatch(chunk.actions.setIsLoading(false))
        }
    }
}

function fetchPersonalScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: DispatchFun) => {
        await dispatch(doFetchPersonalScores(chunk, 1))
    }
}

function loadMorePersonalScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        const currentPage = chunk.props.getCurrentPage(getState())
        dispatch(doFetchPersonalScores(chunk, currentPage + 1))
    }
}

export async function updateRecentlyScores() {
    // Discard any previously queued view statistics without transmitting them.
    store.dispatch(recentlyViewedScoresStoreChunk.actions.setEvents([]))
}
export function fetchRecentlyScores(screen: 'BrowseMain' | 'ScoreRecently' = 'BrowseMain') {
    return async (dispatch: (...args: Array<any>) => any, getState: () => State) => {
        try {
            const currentState = getState()
            const isAuthorized = getIsAuthorized(currentState)
            if (!isAuthorized) return
            dispatch(recentlyViewedScoresStoreChunk.actions.setIsLoading(true))
            await updateRecentlyScores()
            const response = await requestRecentlyScores()
            const recentlyScores = MSScore.processRecentlySourceData(response)
            if (!recentlyScores) return
            dispatch(recentlyViewedScoresStoreChunk.actions.setScores(recentlyScores))
            const offset = 0
            recentlyScores.forEach((score, position) => {
                const params = buildSearchEventParams({
                    filters: [{ key: 'recently_viewed', value: '1' }],
                    sort: 'date_updated',
                    totalCount: offset + recentlyScores.length,
                    page: 1,
                    entity: 'recently_viewed',
                    score: score as unknown as MSScoreT,
                    offset,
                    position,
                    screen,
                })
                reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW, params)
            })
        } catch (error) {
            SentryUtils.sendMessage('fetchRecentlyScores', error)
        } finally {
            dispatch(recentlyViewedScoresStoreChunk.actions.setIsLoading(false))
        }
    }
}
export function updateRecentlyEvents(score: MSScoreT, time_spent = 0) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        try {
            const timeStamp = getServerTimestamp(getState())
            const recentlyEvent = {
                score_id: score.id,
                time_spent,
                date_updated: Math.floor(timeStamp / 1000),
            }
            dispatch(recentlyViewedScoresStoreChunk.actions.addEvent(recentlyEvent))

            const scoreToInsert = { ...score }
            scoreToInsert.dateUpdated = Math.floor(timeStamp / 1000)
            dispatch(recentlyViewedScoresStoreChunk.actions.addScore(scoreToInsert))
        } catch (error) {
            SentryUtils.sendMessage('updateRecentlyEvents', error)
        }
    }
}

export function clearRecentlyScores() {
    return (dispatch: any) => {
        dispatch(recentlyViewedScoresStoreChunk.actions.setScores([]))
    }
}

export function initScoreFilters() {
    return async (dispatch: DispatchFun) => {
        await dispatch(searchThunks.initFilterParams())
    }
}

export function loadExploreScores(chunk: TUniversalScoreListDynamicStoreChunk, isInitial: boolean) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        if (!isInitial && !checkConnectionSafely()) return

        const context = getExploreContext(getState())
        if (context === 'common') {
            dispatch(fetchRecentlyScores())
            await dispatch(fetchScores(chunk))
        } else {
            await dispatch(fetchRecentlyScores())
            await dispatch(fetchPersonalScores(chunk))
        }
        dispatch(chunk.actions.setIsLoading(false))
    }
}

export function loadMoreExploreScores(chunk: TUniversalScoreListDynamicStoreChunk) {
    return async (dispatch: any, getState: any) => {
        reportEvent(MetricaEvents.BROWSE_LOAD_MORE)
        const context = getExploreContext(getState())
        if (context === 'common') {
            await dispatch(loadMoreScores(chunk))
            return
        }
        await dispatch(loadMorePersonalScores(chunk))
    }
}

// Browse/search scores using a screen-encapsulated query chunk instead of the
// global state: the filter params, text query and sort are read from
// `queryChunk` at dispatch time and passed straight to the fetch.
const selectionSortToQueryParams = (
    queryChunk: TFilterSelectionStoreChunk,
    getState: GetStateFun,
): Record<string, string> => {
    const selectedSort = queryChunk.props.getSelectedSort(getState())
    return selectedSort ? { sort: selectedSort } : {}
}

export function searchScoresWithSelection(
    chunk: TUniversalScoreListDynamicStoreChunk,
    queryChunk: TFilterSelectionStoreChunk,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const filtersQuery = selectedFiltersToQueryParams(
            queryChunk.props.getSelectedFilters(getState()),
        )
        const searchText = queryChunk.props.getSearchTerm(getState())
        const sortQuery = selectionSortToQueryParams(queryChunk, getState)
        dispatch(chunk.actions.setScores([]))
        dispatch(chunk.actions.resetPagination())
        await dispatch(
            doFetchScores(
                chunk,
                1,
                false,
                undefined,
                filtersQuery,
                searchText,
                sortQuery,
                queryChunk,
            ),
        )
    }
}

export function loadMoreScoresWithSelection(
    chunk: TUniversalScoreListDynamicStoreChunk,
    queryChunk: TFilterSelectionStoreChunk,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        reportEvent(MetricaEvents.BROWSE_LOAD_MORE)
        const filtersQuery = selectedFiltersToQueryParams(
            queryChunk.props.getSelectedFilters(getState()),
        )
        const searchText = queryChunk.props.getSearchTerm(getState())
        const sortQuery = selectionSortToQueryParams(queryChunk, getState)
        const currentPage = chunk.props.getCurrentPage(getState())
        await dispatch(
            doFetchScores(
                chunk,
                currentPage + 1,
                false,
                undefined,
                filtersQuery,
                searchText,
                sortQuery,
                queryChunk,
            ),
        )
    }
}

// One-shot filtered fetch for sections that don't expose editable filters
// (e.g. Home Recommended): resolves the given filter descriptors against the
// catalog into query-params and fetches page 1 — no store chunk needed.
export function loadScoresWithInitialFilters(
    chunk: TUniversalScoreListDynamicStoreChunk,
    initialFilters: TInitialFilter[],
) {
    return async (dispatch: DispatchFun) => {
        let filterParams
        try {
            const { filters } = await searchService.getBrowseFilters()
            filterParams = processBrowseFilters(convertBrowseFiltersData(filters))
        } catch (error) {
            SentryUtils.sendMessage('loadScoresWithInitialFilters', error)
        }

        const selectedFilters: TSelectedFilters = {}
        resolveInitialFilters(filterParams, initialFilters).forEach(filter => {
            selectedFilters[filter.filterKey] = {
                ...selectedFilters[filter.filterKey],
                [filter.itemId]: true,
            }
        })

        const filtersQuery = selectedFiltersToQueryParams(selectedFilters)
        dispatch(chunk.actions.setScores([]))
        dispatch(chunk.actions.resetPagination())
        await dispatch(doFetchScores(chunk, 1, false, undefined, filtersQuery))
    }
}
