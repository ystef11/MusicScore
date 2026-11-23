import { useCallback, useEffect, useRef } from 'react'

import { setMetricTags, TMetricTags } from '../helpers/metricTags'
import { createScreenTrackerMarks, TScreenTrackerMarks } from '../helpers/screenTrackerMarks'

/** `timeout` marks a screen that never reported itself ready: count these, do not average them */
export type TScreenResult = 'ok' | 'timeout'

export type TTrackedScreens = { screen: string | null; previousScreen: string | null }

type TOptions = {
    enabled?: boolean
    /** When true, TTI is marked only through `markInteractive()` */
    manual?: boolean
    tags?: TMetricTags
    /** Route names of the screen being tracked and the one before it, for the event columns */
    getScreens?: () => TTrackedScreens
}

/**
 * Marks the screen start synchronously during the first render and produces the
 * `tracker-<screen>-<n>-tti` measure once the screen is interactive: automatically two frames
 * after the first layout, or manually via `markInteractive()` when the screen knows better
 * (its data has loaded).
 */
export const useScreenTracker = (
    screenName: string,
    { enabled = true, manual = false, tags, getScreens }: TOptions = {},
) => {
    const marksRef = useRef<TScreenTrackerMarks | null>(null)
    const hasMarkedStart = useRef(false)
    const hasMarkedTTI = useRef(false)
    const trackedScreenRef = useRef(screenName)

    if (marksRef.current === null || trackedScreenRef.current !== screenName) {
        trackedScreenRef.current = screenName
        marksRef.current = createScreenTrackerMarks(screenName)
        hasMarkedStart.current = false
        hasMarkedTTI.current = false
    }

    const marks = marksRef.current
    const tagsRef = useRef(tags)
    tagsRef.current = tags
    const getScreensRef = useRef(getScreens)
    getScreensRef.current = getScreens

    if (enabled && !hasMarkedStart.current) {
        try {
            performance.mark(marks.start)
            hasMarkedStart.current = true
        } catch (error) {
            if (__DEV__)
                console.warn(`[useScreenTracker] failed to mark start of ${screenName}`, error)
        }
    }

    /**
     * Taken once, on the first frame after mount: the navigator updates its state in an effect
     * that runs after the screen's own, so at mount time the route still names the screen left
     * behind. A screen that is ready before its first frame marks TTI at once but reports on
     * that frame, for the same reason.
     */
    const screensRef = useRef<TTrackedScreens | null>(null)

    const captureScreens = useCallback(() => {
        if (screensRef.current === null && getScreensRef.current) {
            screensRef.current = getScreensRef.current()
        }
    }, [])

    const markInteractive = useCallback(
        (result: TScreenResult = 'ok') => {
            if (!enabled || !hasMarkedStart.current || hasMarkedTTI.current) return

            try {
                performance.mark(marks.tti)
                hasMarkedTTI.current = true
            } catch (error) {
                if (__DEV__)
                    console.warn(`[useScreenTracker] failed to mark TTI of ${screenName}`, error)

                return
            }

            // The measure is taken between the two marks, so deferring it does not change the value
            const report = () => {
                captureScreens()

                try {
                    setMetricTags(marks.tti, {
                        ...tagsRef.current,
                        result,
                        screen: screensRef.current?.screen ?? undefined,
                        previous_screen: screensRef.current?.previousScreen ?? undefined,
                    })
                    performance.measure(marks.tti, marks.start, marks.tti)
                } catch (error) {
                    if (__DEV__)
                        console.warn(
                            `[useScreenTracker] failed to report TTI of ${screenName}`,
                            error,
                        )
                }
            }

            if (screensRef.current !== null || !getScreensRef.current) {
                report()
            } else {
                requestAnimationFrame(report)
            }
        },
        [enabled, screenName, marks, captureScreens],
    )

    // Cancelled on unmount: a screen dismissed mid-chain must not report a TTI it never reached.
    const pendingFrame = useRef<number | null>(null)

    useEffect(
        () => () => {
            if (pendingFrame.current !== null) cancelAnimationFrame(pendingFrame.current)
        },
        [],
    )

    /** Call on the first frame after mount, on the manual path too */
    const handleLayout = useCallback(() => {
        captureScreens()
        if (manual) return

        // Two frames after layout: the first one is the paint, the second lets the JS thread idle.
        pendingFrame.current = requestAnimationFrame(() => {
            // Wrapped: rAF would otherwise pass its timestamp as the result argument
            pendingFrame.current = requestAnimationFrame(() => markInteractive())
        })
    }, [manual, markInteractive, captureScreens])

    return { handleLayout, markInteractive }
}
