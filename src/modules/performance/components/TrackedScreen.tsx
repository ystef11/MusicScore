import { ReactElement, ReactNode, useEffect } from 'react'

import type { TPerformanceScreen } from '../constants/performanceScreens'
import type { TMetricTags } from '../helpers/metricTags'
import { useScreenTracker } from '../hooks/useScreenTracker'
import { performanceLogService } from '../services/performanceLogService'

/**
 * A screen that has not reported itself ready by now never will: the load failed or hung.
 * It is reported as `result: timeout` so the failures stay countable instead of vanishing.
 */
const INTERACTIVE_TIMEOUT_MS = 15_000

type TProps = {
    screenName: TPerformanceScreen
    /**
     * Data-ready flag of the screen. When passed, `FSR <screen>` is sent once it turns true;
     * when omitted, the screen counts as interactive two frames after its first layout.
     */
    interactive?: boolean
    enabled?: boolean
    tags?: TMetricTags
    children: ReactNode
}

export const TrackedScreen = ({
    screenName,
    interactive,
    enabled = true,
    tags,
    children,
}: TProps) => {
    const { handleLayout, markInteractive } = useScreenTracker(screenName, {
        enabled,
        manual: interactive !== undefined,
        tags,
        getScreens: performanceLogService.getScreens,
    })

    useEffect(() => {
        if (!enabled) return undefined

        const frame = requestAnimationFrame(handleLayout)

        return () => cancelAnimationFrame(frame)
    }, [enabled, handleLayout])

    useEffect(() => {
        if (interactive) markInteractive()
    }, [interactive, markInteractive])

    useEffect(() => {
        if (!enabled || interactive === undefined || interactive) return undefined

        const timer = setTimeout(() => markInteractive('timeout'), INTERACTIVE_TIMEOUT_MS)

        return () => clearTimeout(timer)
    }, [enabled, interactive, markInteractive])

    return children as ReactElement
}
