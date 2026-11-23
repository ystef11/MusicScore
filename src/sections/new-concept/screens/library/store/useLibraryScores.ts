import { useCallback, useMemo } from 'react'

import { getUserId } from '@mu-native/auth'
import {
    fetchLibraryScores,
    mapScoreCards,
    usePaginatedList,
    type TLibraryScoresSort,
    type TPageSeed,
} from '@mu-native/new-concept-shared'
import { songbookStoreChunk, useLoadSongbookStoreChunk } from '@mu-native/songbook'
import { useValues } from '@ug/store'

import type { MSScoreT } from '../../../../../App/Model/MSScore'

import { type TLibraryFilterKey, type TLibrarySortKey } from './libraryFilters'

type TParams = {
    filter: TLibraryFilterKey
    sort: TLibrarySortKey
    /** Trimmed search text; empty string means "not searching". */
    searchQuery: string
    /** Controller's eager first page for the default query (§1.1). */
    seed: TPageSeed<MSScoreT> | null | undefined
}

type TLibraryScores = {
    scores: MSScoreT[]
    totalCount: number
    isLoading: boolean
    loadMore: () => void
    /** Re-fetch page 1 of the current query (screen focus, §7 "no cache"). */
    refresh: () => Promise<void>
    /** Offline items available locally — gates the "Offline access" chip. */
    offlineCount: number
}

// The unified library-scores endpoint (§7) is server-tabbed + server-sorted.
const SORT_PARAM: Record<TLibrarySortKey, TLibraryScoresSort> = {
    recent: 'recent',
    mostViewed: 'most_viewed',
}
// `all` is the default tab (no param); the others map to the endpoint's names.
const TAB_PARAM: Record<TLibraryFilterKey, 'uploaded' | 'purchased' | undefined> = {
    all: undefined,
    uploads: 'uploaded',
    purchased: 'purchased',
    offline: undefined, // handled client-side, never sent
}

// Offline scores carry a different shape (MSOfflineScoreT) but expose enough fields
// (id/title/authorName/previewImageUrl/isOffline) for the shared ScoreItem and the
// score viewer, so we pass them through untouched.
const asScores = (items: unknown[]) => items as MSScoreT[]

const matchesQuery = (score: MSScoreT, query: string) => {
    const lowerQuery = query.toLowerCase()
    return (
        score.title?.toLowerCase().includes(lowerQuery) ||
        score.authorName?.toLowerCase().includes(lowerQuery)
    )
}

const byDateUpdatedDesc = (a: MSScoreT, b: MSScoreT) => (b.dateUpdated ?? 0) - (a.dateUpdated ?? 0)

/**
 * Library scores section. `all`/`uploads`/`purchased` come from the unified
 * `fetchLibraryScores` endpoint (server does the merge/dedup and sorting;
 * guests get device-bound purchases only, §7); `offline` reads the local
 * songbook store. "Search in my library" is a client-side substring filter
 * over the loaded items — the endpoint takes only tab/sort/page (§12), no
 * text param. The default query's first page is seeded from the Library
 * controller so opening the screen issues no extra request.
 */
export const useLibraryScores = ({ filter, sort, searchQuery, seed }: TParams): TLibraryScores => {
    const [userId] = useValues([getUserId])

    // The persisted songbook store is the only offline source, as in the legacy
    // songbook screen. Scanning the documents dir (SongBookController.updateSongBook)
    // is deliberately NOT done here: it fabricates metadata-less entries titled by
    // bare score id for any score file whose store entry is gone (e.g. after logout
    // cleanup), and its add-thunk can trigger the paywall flow for non-pro users.
    useLoadSongbookStoreChunk()
    const [offlineScores, offlineOrders] = useValues([
        songbookStoreChunk.props.getScores,
        songbookStoreChunk.props.getOrderScores,
    ])

    const isOffline = filter === 'offline'
    const isDefaultQuery = filter === 'all' && sort === 'recent'

    const fetchPage = useCallback(
        (page: number) =>
            fetchLibraryScores({
                tab: TAB_PARAM[filter],
                sort: SORT_PARAM[sort],
                page,
            }).then(res => ({ ...res, items: mapScoreCards(res.items) })),
        // The endpoint is session-scoped, so `userId` isn't sent — it's here to
        // invalidate the query (and any in-flight pages) when the account changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [filter, sort, userId],
    )

    const list = usePaginatedList<MSScoreT>(fetchPage, {
        enabled: !isOffline,
        seed,
        seedApplies: isDefaultQuery,
    })

    const offlineList = useMemo(() => {
        const result = asScores([...offlineScores, ...offlineOrders])
        // No server sort for local content; 'views' keeps the source order.
        return sort === 'recent' ? [...result].sort(byDateUpdatedDesc) : result
    }, [offlineScores, offlineOrders, sort])

    const scores = useMemo(() => {
        const source = isOffline ? offlineList : list.items
        if (!searchQuery) return source
        return source.filter(score => matchesQuery(score, searchQuery))
    }, [isOffline, offlineList, list.items, searchQuery])

    const totalCount = useMemo(() => {
        // While searching, the count reflects the client-filtered subset (§7).
        if (searchQuery || isOffline) return scores.length
        return list.totalCount
    }, [searchQuery, isOffline, scores.length, list.totalCount])

    return {
        scores,
        totalCount,
        isLoading: isOffline ? false : list.isLoading,
        loadMore: list.loadMore,
        refresh: list.refresh,
        offlineCount: offlineScores.length + offlineOrders.length,
    }
}
