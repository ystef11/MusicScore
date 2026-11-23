import { getScreenRenderEventName } from '../constants/performanceEvents'
import { getMetricTags, removeMetricTags } from '../helpers/metricTags'
import { clearScreenTrackerEntries, parseScreenTrackerMeasure } from '../helpers/screenTrackerMarks'

import type { TPerformanceLogger } from './performanceLogger'
import type { PerformanceSessionManager } from './PerformanceSessionManager'

type TParams = {
    logger: TPerformanceLogger
    sessionManager: PerformanceSessionManager
}

const asScreen = (value: unknown): string | null => (typeof value === 'string' ? value : null)

/** Turns `tracker-<screen>-<n>-tti` measures produced by `useScreenTracker` into `FSR <screen>` events */
export class ScreenRenderPerformance {
    private logger: TPerformanceLogger

    private sessionManager: PerformanceSessionManager

    private observer: PerformanceObserver | null = null

    constructor({ logger, sessionManager }: TParams) {
        this.logger = logger
        this.sessionManager = sessionManager

        if (typeof PerformanceObserver === 'undefined') return

        this.observer = new PerformanceObserver(list => {
            list.getEntriesByType('measure').forEach(this.handleMeasureEntry)
        })
        this.observer.observe({ entryTypes: ['measure'] })
    }

    handleMeasureEntry = (entry: Pick<PerformanceEntry, 'name' | 'duration'>) => {
        const screenName = parseScreenTrackerMeasure(entry.name)
        if (!screenName) return

        // Route names captured by the tracker when the screen mounted, not the live navigation
        // state: a screen that reports after the user has moved on must not borrow their route.
        const { screen, previous_screen: previousScreen, ...tags } = getMetricTags(entry.name) ?? {}

        this.logger.send({
            event: getScreenRenderEventName(screenName),
            value: Math.round(entry.duration),
            screen: asScreen(screen),
            previous_screen: asScreen(previousScreen),
            params: { ...tags, performance_session_id: this.sessionManager.sessionId },
        })

        removeMetricTags(entry.name)
        clearScreenTrackerEntries(entry.name)
    }

    destroy() {
        this.observer?.disconnect()
        this.observer = null
    }
}
