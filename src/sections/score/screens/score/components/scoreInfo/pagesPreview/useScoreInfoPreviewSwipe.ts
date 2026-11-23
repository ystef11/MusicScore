import { useMemo, useRef } from 'react'
import { PanResponder } from 'react-native'

import { isPageTurn, resolveSwipeAxis, SwipeAxis } from './scoreInfoSwipeGate'

/**
 * Horizontal swipe paging for the Score Info preview, calling `onTurnPage` with
 * +1 / -1. XTZ's own `onSwipeLeft/Right` never fires here — the wrapper is
 * `box-only`, so the native view never sees the touch.
 *
 * PanResponder and not gesture-handler on purpose: this module is in the startup
 * bundle (rt-analytics imports the score-screen index), and a gesture-handler /
 * Reanimated edge there reorders module init enough to segfault Hermes on launch.
 *
 * Capture-phase, but only once the drag reads as horizontal, so vertical
 * scrolling still wins. The axis locks once per touch — otherwise the ScrollView
 * fights a capture handler that re-arms on every move. See
 * {@link resolveSwipeAxis} for how the axis is picked.
 */
export const useScoreInfoPreviewSwipe = (
    onTurnPage: (delta: number) => void,
    /**
     * Raised while the drag is ours. iOS never blocks an ancestor ScrollView for
     * a descendant JS responder, so the screen has to stop scrolling itself —
     * otherwise it drifts vertically under a page swipe.
     */
    onPagingChange: (isPaging: boolean) => void,
) => {
    const axis = useRef<SwipeAxis>('idle')

    const responder = useMemo(() => {
        const commit = (dx: number, vx: number) => {
            const turn = axis.current === 'x' && isPageTurn(dx, vx)
            onPagingChange(false)
            if (!turn) return
            onTurnPage(dx < 0 ? 1 : -1)
        }

        return PanResponder.create({
            onStartShouldSetPanResponderCapture: () => {
                axis.current = 'idle'
                onPagingChange(false)
                return false
            },
            onMoveShouldSetPanResponderCapture: (_, { dx, dy }) => {
                const before = axis.current
                axis.current = resolveSwipeAxis(axis.current, dx, dy)
                if (before !== 'x' && axis.current === 'x') onPagingChange(true)
                return axis.current === 'x'
            },
            // Once the drag is ours, nothing takes it back mid-swipe.
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: (_, { dx, vx }) => commit(dx, vx),
            // iOS never blocks an ancestor ScrollView for a descendant responder,
            // so a swipe can still be terminated out from under us — commit anyway.
            onPanResponderTerminate: (_, { dx, vx }) => commit(dx, vx),
        })
    }, [onTurnPage, onPagingChange])

    return responder.panHandlers
}
