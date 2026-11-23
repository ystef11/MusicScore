import { useCallback, useEffect, useState } from 'react'

import { useIsFocused } from '@mu-native/navigation'
import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

/**
 * Owns the XTZ engine slot for the Score Info page preview (MUP-14066).
 *
 * XTZ is a process-wide singleton and only one XtzView may be attached at a
 * time, so the preview holds the engine only while Score Info is the visible
 * screen. It is released before Score Play (or another Score Info) mounts its
 * own view, and re-acquired — which re-opens the score — on the way back.
 */
/** Time for the previous screen's XtzView to finish its native teardown. */
const ENGINE_HANDOVER_MS = 500

export const useScoreInfoPreviewXtz = () => {
    const isFocused = useIsFocused()
    // ScoreInfoPdfExporter needs the same single engine to render a PDF.
    const [pendingPdfExport] = useValues([scoreStoreChunk.props.getPendingPdfExport])
    const [isXtzActive, setIsXtzActive] = useState(false)

    useEffect(() => {
        if (!isFocused || pendingPdfExport) {
            setIsXtzActive(false)
            return undefined
        }
        // Opening a score is heavy — don't do it while the screen animates in.
        // Score Play's XtzView is not recycled and its native teardown lags the
        // React unmount, so mounting ours too early binds the engine to state the
        // old view still holds. Give the popped screen a beat to actually die.
        let timer: ReturnType<typeof setTimeout> | undefined
        const idleCallback = requestIdleCallback(() => {
            timer = setTimeout(() => setIsXtzActive(true), ENGINE_HANDOVER_MS)
        })
        return () => {
            cancelIdleCallback(idleCallback)
            if (timer) clearTimeout(timer)
        }
    }, [isFocused, pendingPdfExport])

    /**
     * Blur alone is too late when we navigate away ourselves: the pushed screen
     * can attach its XtzView in the same commit we detach ours. Call this first,
     * then navigate on the next frame.
     */
    const releaseXtz = useCallback(() => setIsXtzActive(false), [])

    return { isXtzActive, releaseXtz }
}
