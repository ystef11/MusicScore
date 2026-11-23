/**
 * Redesign API v2 service methods, on the typed contracts of `@mu-native/api`.
 *
 * Each screen-controller call returns the flat block object; the unified list endpoints return
 * `{ items, _meta }` (+ `tabs` where applicable). Interactions that load on user action
 * (view-all, chip switch) are NOT here — they go through the existing `/score/search`,
 * `/course/search`, etc. (§1.6).
 */
import {
    apiRequest,
    libraryContracts,
    screenContracts,
    searchContracts,
    type TLibraryScoreSort,
} from '@mu-native/api'

/** Unified `tab` param — omit for the default `all` tab (§7/§8/§10). */
export type TListTab = 'saved' | 'purchased' | 'uploaded'

export type TLibraryScoresSort = TLibraryScoreSort

// ── Screen controllers (first frame, all blocks eager) ──────────────────────

export const fetchHomeScreen = () => apiRequest(screenContracts.home)

export const fetchSearchScreen = () => apiRequest(screenContracts.search)

export const fetchLibraryScreen = () => apiRequest(screenContracts.library)

export const fetchLearnScreen = () => apiRequest(screenContracts.learn)

// ── Unified list endpoints (tab switch / pagination) ────────────────────────

export const fetchLibraryScores = (params: {
    /** Omit for the default `all` tab. */
    tab?: 'uploaded' | 'purchased'
    sort?: TLibraryScoresSort
    page?: number
}) => apiRequest(libraryContracts.scores, { params })

export const fetchSongbooks = (params: {
    /** Omit for the default `all` tab. */
    tab?: 'saved' | 'purchased'
    page?: number
}) => apiRequest(libraryContracts.songbooks, { params })

export const fetchMyCourses = (params: {
    /** Omit for the default `all` tab. */
    tab?: 'saved' | 'purchased'
    page?: number
}) => apiRequest(libraryContracts.courses, { params })

// ── Search suggestions (§6, MVP-light) ──────────────────────────────────────

export const fetchSearchSuggestions = (q: string) =>
    apiRequest(searchContracts.suggestScores, { params: { q } })
