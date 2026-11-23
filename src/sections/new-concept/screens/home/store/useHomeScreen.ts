import { useCallback, useMemo, useRef, useState } from 'react'

import {
    fetchHomeScreen,
    mapScoreCards,
    mapV2Playlist,
    readBlock,
    useScreenController,
    type TApiFilterChip,
} from '@mu-native/new-concept-shared'
import type { TPlaylist } from '@mu-native/playlist-scores'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import { performSearch } from '../../../../../App/Services/SearchProvider'
import type { DigitalEbookModel } from '../../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'

const MAX_GENRE_SCORES = 9

export type THomeGenres = {
    /** Genre filter chips (first is active on first render). */
    chips: TApiFilterChip[]
    /** Currently active chip key, or `null` when there are no chips. */
    activeKey: string | null
    /** Scores for the active genre (replaced on chip switch, Home is not re-fetched). */
    scores: MSScoreT[]
    isLoading: boolean
    /** Active chip's replay params, for the "View all" grid. */
    activeParams?: Record<string, unknown>
    selectGenre: (key: string) => void
}

export type THomeScreen = {
    isLoading: boolean
    isError: boolean
    /** True once the first frame has loaded — gates the full-screen states. */
    hasData: boolean
    refresh: () => Promise<void>
    recentlyViewed: { scores: MSScoreT[]; totalCount: number }
    playlists: TPlaylist[]
    easyPieces: { scores: MSScoreT[]; params?: Record<string, unknown> }
    genres: THomeGenres
    songbooks: DigitalEbookModel[]
    courses: TCourse[]
}

/**
 * Single Home controller (§3): one `GET /screen/home` call yields all six eager
 * blocks; the screen renders the first frame with no further requests, and
 * re-fetches on focus so recently-viewed stays live. Genre-chip switching
 * replays the chip's `params` through `/score/search` and replaces the genre
 * scores in place — Home itself is never re-fetched for that.
 */
export const useHomeScreen = (): THomeScreen => {
    const { response, isLoading, isError, hasData, refresh } = useScreenController(fetchHomeScreen)

    const [activeGenreKey, setActiveGenreKey] = useState<string | null>(null)
    // Cache of already-fetched genre scores, keyed by chip key.
    const [genreScoresByKey, setGenreScoresByKey] = useState<Record<string, MSScoreT[]>>({})
    const [genreLoading, setGenreLoading] = useState(false)
    // Monotonic id — only the latest chip request may apply its result (§3: a
    // chip switch replaces items; a slower earlier response must not win).
    const genreRequestRef = useRef(0)

    const genresBlock = useMemo(() => readBlock(response?.scores_by_favorite_genres), [response])

    // The first chip is active and its scores arrive eagerly with the screen.
    const firstChip = genresBlock.filters[0]
    const eagerGenreScores = useMemo(
        () => (firstChip ? mapScoreCards(genresBlock.items) : []),
        [firstChip, genresBlock],
    )
    const activeKey = activeGenreKey ?? firstChip?.key ?? null

    const selectGenre = useCallback(
        (key: string) => {
            setActiveGenreKey(key)
            if (key === firstChip?.key || genreScoresByKey[key]) return // eager or cached

            const chip = genresBlock.filters.find(item => item.key === key)
            if (!chip) return

            const requestId = ++genreRequestRef.current
            setGenreLoading(true)
            performSearch({ ...chip.params, page: 1, sort: 'relevance' } as never)
                .then(result => {
                    if (genreRequestRef.current !== requestId) return
                    setGenreScoresByKey(prev => ({
                        ...prev,
                        [key]: result?.scores?.slice(0, MAX_GENRE_SCORES) ?? [],
                    }))
                })
                .catch(() => {
                    // Keep the empty state; re-tapping the chip retries.
                })
                .finally(() => {
                    if (genreRequestRef.current === requestId) setGenreLoading(false)
                })
        },
        [firstChip, genreScoresByKey, genresBlock],
    )

    const recentlyBlock = useMemo(() => readBlock(response?.scores_recently_viewed), [response])
    const easyBlock = useMemo(() => readBlock(response?.scores_easy_pieces_for_you), [response])
    const playlistsBlock = useMemo(() => readBlock(response?.playlists), [response])
    const songbooksBlock = useMemo(() => readBlock(response?.songbooks), [response])
    const coursesBlock = useMemo(() => readBlock(response?.courses), [response])

    const recentlyViewed = useMemo(
        () => ({
            scores: mapScoreCards(recentlyBlock.items),
            totalCount: recentlyBlock.totalCount,
        }),
        [recentlyBlock],
    )
    const playlists = useMemo(() => playlistsBlock.items.map(mapV2Playlist), [playlistsBlock])
    const easyPieces = useMemo(
        () => ({ scores: mapScoreCards(easyBlock.items), params: easyBlock.params }),
        [easyBlock],
    )
    const activeChip = useMemo(
        () => genresBlock.filters.find(chip => chip.key === activeKey),
        [genresBlock, activeKey],
    )
    const genres = useMemo<THomeGenres>(
        () => ({
            chips: genresBlock.filters,
            activeKey,
            scores: activeKey
                ? (genreScoresByKey[activeKey] ??
                  (activeKey === firstChip?.key ? eagerGenreScores : []))
                : [],
            isLoading: genreLoading,
            activeParams: activeChip?.params,
            selectGenre,
        }),
        [
            genresBlock,
            activeKey,
            genreScoresByKey,
            firstChip,
            eagerGenreScores,
            genreLoading,
            activeChip,
            selectGenre,
        ],
    )

    return {
        isLoading,
        isError,
        hasData,
        refresh,
        recentlyViewed,
        playlists,
        easyPieces,
        genres,
        songbooks: songbooksBlock.items,
        courses: coursesBlock.items,
    }
}
