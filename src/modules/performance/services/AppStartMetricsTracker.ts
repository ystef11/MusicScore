import { AppState, AppStateStatus, NativeEventSubscription, NativeModules } from 'react-native'

import {
    APP_START_MARKS,
    APP_START_MEASURES,
    MAX_APP_START_DURATION_MS,
} from '../constants/appStartMarks'
import { PERFORMANCE_EVENTS } from '../constants/performanceEvents'

import type { TPerformanceLogger } from './performanceLogger'

export type TAppStartMeasures = {
    nativeInit: number
    jsInit: number
    tti: number
    total: number
}

export type TLaunchType = 'cold' | 'prewarmed' | 'background' | 'headless'

export type TLaunchParams = {
    launch_type: TLaunchType
    was_backgrounded: 0 | 1
}

/** Constants exported by the native `AppStartTiming` module (ios/AppStartTiming.swift, AppStartTimingModule.kt) */
type TAppStartTimingModule = {
    nativeStartTime?: number
    isBackgroundLaunch?: boolean
    isPrewarmed?: boolean
    wasHeadlessStart?: boolean
}

const getNativeTiming = (): TAppStartTimingModule => NativeModules.AppStartTiming ?? {}

const getMeasureDuration = (name: string): number => {
    const entries = performance.getEntriesByName(name, 'measure')

    return entries.length > 0 ? entries[0].duration : 0
}

/**
 * Native Init ends where RN starts executing the JS bundle, both stamps share the
 * monotonic clock: `CACurrentMediaTime` / `SystemClock.uptimeMillis` on the native side and
 * `performance.rnStartupTiming` on the JS side.
 */
const getNativeInitDuration = (): number => {
    const { nativeStartTime } = getNativeTiming()
    const jsBundleStart = performance.rnStartupTiming?.executeJavaScriptBundleEntryPointStart

    if (nativeStartTime && jsBundleStart) {
        return jsBundleStart - nativeStartTime
    }

    return 0
}

const getLaunchType = (): TLaunchType => {
    const { isPrewarmed, isBackgroundLaunch, wasHeadlessStart } = getNativeTiming()

    if (isPrewarmed) return 'prewarmed'
    if (isBackgroundLaunch) return 'background'
    if (wasHeadlessStart) return 'headless'

    return 'cold'
}

/**
 * App start timeline. Phases are measured back to back:
 * Native Init (process start → JS bundle start) → JS Init (bundle start → first React render)
 * → TTI (first render → app interactive). Total is their sum.
 */
export class AppStartMetricsTracker {
    private logger: TPerformanceLogger

    private measured = false

    private wasBackgrounded = false

    private appStateSubscription: NativeEventSubscription | null = null

    constructor({ logger }: { logger: TPerformanceLogger }) {
        this.logger = logger

        // On a real iOS background launch (content-available push, background fetch)
        // `AppState.currentState` is often still 'unknown' this early, so the native flag
        // captured in didFinishLaunching is the authoritative signal.
        const { isBackgroundLaunch } = getNativeTiming()
        if (isBackgroundLaunch || AppState.currentState === 'background') {
            this.wasBackgrounded = true
        }

        this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange)
    }

    private handleAppStateChange = (appState: AppStateStatus) => {
        if (appState === 'background') {
            this.wasBackgrounded = true
        }
    }

    markFirstRender() {
        if (this.measured) return
        performance.mark(APP_START_MARKS.firstRender)
    }

    /** Closes the timeline. Returns the measures once; later calls are no-ops. */
    markInteractive(): TAppStartMeasures | null {
        if (this.measured) return null
        this.measured = true

        performance.mark(APP_START_MARKS.interactive)

        try {
            const nativeInit = getNativeInitDuration()

            performance.measure(APP_START_MEASURES.nativeInit, { start: 0, duration: nativeInit })
            performance.measure(
                APP_START_MEASURES.jsInit,
                APP_START_MARKS.jsBundleExecStart,
                APP_START_MARKS.firstRender,
            )
            performance.measure(
                APP_START_MEASURES.tti,
                APP_START_MARKS.firstRender,
                APP_START_MARKS.interactive,
            )

            const jsInit = getMeasureDuration(APP_START_MEASURES.jsInit)
            const tti = getMeasureDuration(APP_START_MEASURES.tti)

            performance.measure(APP_START_MEASURES.total, {
                start: 0,
                duration: nativeInit + jsInit + tti,
            })

            return {
                nativeInit,
                jsInit,
                tti,
                total: getMeasureDuration(APP_START_MEASURES.total),
            }
        } catch (error) {
            if (__DEV__) console.warn('[AppStartMetrics] failed to compute measures', error)

            return null
        } finally {
            this.appStateSubscription?.remove()
            this.appStateSubscription = null
        }
    }

    log(measures: TAppStartMeasures) {
        const events = [
            { event: PERFORMANCE_EVENTS.APP_START_NATIVE_INIT, value: measures.nativeInit },
            { event: PERFORMANCE_EVENTS.APP_START_JS_INIT, value: measures.jsInit },
            { event: PERFORMANCE_EVENTS.APP_START_TTI, value: measures.tti },
            { event: PERFORMANCE_EVENTS.APP_START_TOTAL, value: measures.total },
        ]
        const params = this.launchParams()

        events.forEach(({ event, value }) => {
            if (value > 0 && value <= MAX_APP_START_DURATION_MS) {
                this.logger.send({ event, value: Math.round(value), params })
            }
        })
    }

    launchParams(): TLaunchParams {
        return {
            launch_type: getLaunchType(),
            was_backgrounded: this.wasBackgrounded ? 1 : 0,
        }
    }
}
