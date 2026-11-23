import { useCallback, useEffect, useRef, useState } from 'react'

import { getStoreValue } from '@mu-native/common'
import { haptic } from '@mu-native/ds'
import {
    addShazamErrorListener,
    addShazamMatchListener,
    addShazamNoMatchListener,
    shazamScoreListStoreChunk,
    shazamSearchThunks,
    shazamStoreChunk,
    type ShazamMatch,
    startShazam,
    stopShazam,
} from '@mu-native/shazam'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../App/constants/MetricaEvents.ts'
import reportEvent from '../../App/Utils/Analytics.ts'

export type ShazamState =
    | { kind: 'listening'; phase: 'listening' | 'tough' }
    | { kind: 'matching'; match: ShazamMatch }
    | { kind: 'matched'; match: ShazamMatch }
    | { kind: 'no-match' }
    | { kind: 'error'; message: string }

const TOUGH_TIMEOUT_MS = 15_000

export const useShazamSession = (): {
    state: ShazamState
    mode: 'song' | 'artist' | 'empty' | null
    isLoading: boolean
    restart: () => void
} => {
    const [state, setState] = useState<ShazamState>({ kind: 'listening', phase: 'listening' })
    const isMountedRef = useRef(true)

    const startListening = useCallback(() => {
        setState({ kind: 'listening', phase: 'listening' })
        startShazam()
            .then(() => {
                if (!isMountedRef.current) return
                reportEvent(MetricaEvents.SHAZAM_LISTENING_START)
            })
            .catch(e => {
                if (!isMountedRef.current) return
                reportEvent(MetricaEvents.SHAZAM_ERROR, {
                    message: e?.message ?? 'Failed to start',
                })
                setState({ kind: 'error', message: e?.message ?? 'Failed to start' })
            })
    }, [])

    const [mode, isLoading, isInitialLoading, totalItems] = useValues([
        shazamStoreChunk.props.getMode,
        shazamScoreListStoreChunk.props.getIsLoading,
        shazamScoreListStoreChunk.props.getIsInitialLoading,
        shazamScoreListStoreChunk.props.getTotalItems,
    ])
    const actions = useActions({
        setSearchMeta: shazamStoreChunk.actions.setSearchMeta,
        setMode: shazamStoreChunk.actions.setMode,
        resetShazamFilterParams: shazamStoreChunk.actions.setFilterParams,
        resetShazamSelectedFilters: shazamStoreChunk.actions.resetAllSelectedFilters,
        resetShazamSelectedSort: shazamStoreChunk.actions.resetSelectedSort,
        resetScores: shazamScoreListStoreChunk.actions.setScores,
        resetPagination: shazamScoreListStoreChunk.actions.resetPagination,
        runShazamSearch: shazamSearchThunks.search,
    })

    useEffect(() => {
        isMountedRef.current = true

        const runScoreSearch = async (match: ShazamMatch) => {
            actions.setSearchMeta({
                title: match.title,
                artist: match.artist,
                composer_name: match.composer,
                isrc: match.isrc,
                apple_music_id: match.appleMusicID,
                shazam_id: match.shazamID,
            })
            await actions.runShazamSearch(shazamScoreListStoreChunk)
            if (!isMountedRef.current) return
            const totalAfter = getStoreValue(shazamScoreListStoreChunk.props.getTotalItems)
            haptic(totalAfter > 0 ? 'notificationSuccess' : 'notificationError')
            setState({ kind: 'matched', match })
        }

        const matchSub = addShazamMatchListener(match => {
            if (!isMountedRef.current) return
            reportEvent(MetricaEvents.SHAZAM_MATCH, {
                shazam_id: match.shazamID,
                has_composer: !!match.composer,
                has_isrc: !!match.isrc,
            })
            setState({ kind: 'matching', match })
            runScoreSearch(match)
        })
        const noMatchSub = addShazamNoMatchListener(() => {
            if (!isMountedRef.current) return
            reportEvent(MetricaEvents.SHAZAM_NO_MATCH)
            haptic('notificationError')
            setState({ kind: 'no-match' })
        })
        const errorSub = addShazamErrorListener(err => {
            if (!isMountedRef.current) return
            reportEvent(MetricaEvents.SHAZAM_ERROR, { message: err.message })
            setState({ kind: 'error', message: err.message })
        })

        startListening()

        return () => {
            isMountedRef.current = false
            matchSub?.remove()
            noMatchSub?.remove()
            errorSub?.remove()
            stopShazam()
            actions.setSearchMeta(null)
            actions.setMode(null)
            actions.resetShazamFilterParams(undefined)
            actions.resetShazamSelectedFilters()
            actions.resetShazamSelectedSort()
            actions.resetScores([])
            actions.resetPagination()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const isInitialListening = state.kind === 'listening' && state.phase === 'listening'
    useEffect(() => {
        if (!isInitialListening) return undefined
        const timer = setTimeout(() => {
            reportEvent(MetricaEvents.SHAZAM_LISTENING_TOUGH)
            setState({ kind: 'listening', phase: 'tough' })
        }, TOUGH_TIMEOUT_MS)
        return () => clearTimeout(timer)
    }, [isInitialListening])

    // Map mode='empty' once first-page load completes with zero results, even if backend
    // surfaced 'song' or 'artist' but server-side cap returned empty pages. Suppress
    // while loading so filter re-fetches don't briefly flash the empty-state screen.
    const effectiveMode =
        state.kind === 'matched' && !isInitialLoading && !isLoading && totalItems === 0
            ? 'empty'
            : mode

    return { state, mode: effectiveMode, isLoading, restart: startListening }
}
