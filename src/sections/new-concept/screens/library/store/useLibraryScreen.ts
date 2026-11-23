import { useMemo } from 'react'

import {
    fetchLibraryScreen,
    mapScoreCards,
    useScreenController,
    type TApiTabs,
    type TPageSeed,
} from '@mu-native/new-concept-shared'

import type { MSScoreT } from '../../../../../App/Model/MSScore'

export type TLibraryTiles = {
    /** Show the "Saved scores" tile (§7). */
    savedScores: boolean
    /** Show the "Songbooks" tile (§7). */
    songbooks: boolean
}

/** A set tile from the controller's eager `sets` block (§7); the backend sends no score count. */
export type TLibrarySetTile = {
    id: number
    title: string
}

export type TLibraryScreen = {
    isLoading: boolean
    isError: boolean
    hasData: boolean
    refresh: () => Promise<void>
    tiles: TLibraryTiles
    /** Scores-section tab availability: `all` / `uploaded` / `purchased` (§7). */
    scoresTabs: TApiTabs | undefined
    /** First page of the user's sets, eager from the controller (§7). */
    sets: TLibrarySetTile[]
    /**
     * Eager first page of the scores section (default tab `all`, sort `recent`) —
     * seeds `useLibraryScores` so the first frame needs no extra request (§1.1).
     * `undefined` while loading, `null` when the controller failed.
     */
    scoresSeed: TPageSeed<MSScoreT> | null | undefined
}

/**
 * Library controller (§7): one `GET /v2/screen/library` returns the tile flags,
 * the eager first page of `sets` and `scores`, and the scores-section tab
 * availability. Works for guests too — a device-bound purchaser sees only
 * `purchased`; saved/uploaded/sets are empty. The screen is personal (no cache)
 * so it re-fetches on focus. Set pagination and tab switches use their own
 * endpoints (§1.6).
 */
export const useLibraryScreen = (): TLibraryScreen => {
    const { response, isLoading, isError, hasData, refresh } =
        useScreenController(fetchLibraryScreen)

    const tiles = useMemo<TLibraryTiles>(
        () => ({
            savedScores: !!response?.tabs?.saved_scores,
            songbooks: !!response?.tabs?.songbooks,
        }),
        [response],
    )

    const sets = useMemo<TLibrarySetTile[]>(
        () => (response?.sets?.items ?? []).map(raw => ({ id: raw.id, title: raw.title })),
        [response],
    )

    const scoresSeed = useMemo<TPageSeed<MSScoreT> | null | undefined>(() => {
        if (response === null) return isError ? null : undefined
        const block = response.scores
        if (!block || !Array.isArray(block.items)) return null
        return { items: mapScoreCards(block.items), meta: block._meta }
    }, [response, isError])

    return {
        isLoading,
        isError,
        hasData,
        refresh,
        tiles,
        scoresTabs: response?.scores?.tabs,
        sets,
        scoresSeed,
    }
}
