import { PERFORMANCE_EVENTS } from '../constants/performanceEvents'

import type { TPerformanceLogger } from './performanceLogger'

type TRoute = string
type TDurationMs = number

type TScreenRequests = {
    /** Completed requests only, route → duration */
    routes: Record<TRoute, TDurationMs>
    inFlight: number
    /** When the screen last went from idle to busy, `null` while nothing is in flight */
    busySince: number | null
}

type TParams = {
    logger: TPerformanceLogger
    getCurrentScreen: () => string
}

// Analytics traffic is a side effect of measuring, not of the screen: leave it out.
const IGNORED_ROUTE_PREFIX = 'analytics/'

/**
 * Longest a screen is held back for requests still in flight. Above the 15 s client abort in
 * `createApi`, so an API request still outstanding by now will never report: waiting further
 * would lose the screen's completed requests for good and leak the bucket. A transfer that does
 * settle later (a score file on a slow network) is still recorded and goes out with the next
 * flush.
 */
const MAX_IN_FLIGHT_WAIT_MS = 30_000

const toRoute = (url: string) => url.replace(/^\//, '').split('?')[0]

/**
 * Collects API request durations per screen and sends one `Network Requests` event per screen
 * once the user has left it (or the app goes to background): `params.key` holds the routes,
 * `params.value` the durations in ms.
 *
 * The screen is captured when the request *starts*, not when it finishes, so a response that
 * lands after a navigation is still credited to the screen that asked for it.
 */
export class NetworkPerformance {
    private logger: TPerformanceLogger

    private getCurrentScreen: () => string

    readonly idleRequestsForScreens = new Map<string, TScreenRequests>()

    constructor({ logger, getCurrentScreen }: TParams) {
        this.logger = logger
        this.getCurrentScreen = getCurrentScreen
    }

    private getScreenRequests(screen: string): TScreenRequests {
        const existing = this.idleRequestsForScreens.get(screen)
        if (existing) return existing

        const created: TScreenRequests = { routes: {}, inFlight: 0, busySince: null }
        this.idleRequestsForScreens.set(screen, created)

        return created
    }

    /**
     * Call when an API request starts; the returned callback records its duration.
     * Registered into `@mu-native/api` as the request observer.
     */
    trackRequest = (url: string) => {
        const route = toRoute(url)
        if (!route || route.startsWith(IGNORED_ROUTE_PREFIX)) return undefined

        const startedAt = performance.now()
        let screen: string | null = null
        let requests: TScreenRequests | null = null

        // The navigator commits a new route in an effect that runs after the screen's own, so a
        // request fired on mount still sees the route left behind (or `Other` for a tab whose
        // nested state is not there yet). The screen is read on the next frame instead; a
        // request that settles sooner reads it then. Before the navigator is ready that is
        // `Other`, which is how the launch bootstrap requests get reported.
        const attach = () => {
            if (requests) return

            screen = this.getCurrentScreen()
            requests = this.getScreenRequests(screen)
            requests.inFlight += 1
            if (requests.busySince === null) requests.busySince = startedAt
        }

        const frame = requestAnimationFrame(attach)
        let closed = false

        return () => {
            // `finally` in createApi runs once per request, but never trust that from here:
            // a double close would drop inFlight below zero and unblock the screen early.
            if (closed) return
            closed = true

            cancelAnimationFrame(frame)
            attach()
            if (!requests || screen === null) return

            requests.inFlight -= 1
            if (requests.inFlight <= 0) {
                requests.inFlight = 0
                requests.busySince = null
            }

            // Whichever bucket the screen has now: the original may have been flushed meanwhile
            this.getScreenRequests(screen).routes[route] = Math.round(performance.now() - startedAt)
        }
    }

    private static isBusy({ inFlight, busySince }: TScreenRequests) {
        if (inFlight <= 0 || busySince === null) return false

        return performance.now() - busySince < MAX_IN_FLIGHT_WAIT_MS
    }

    /** Flushes every screen except `currentScreen` and those with requests still in flight */
    sendIdleRequests(currentScreen?: string | null) {
        this.idleRequestsForScreens.forEach((requests, screen) => {
            if (screen === currentScreen) return
            if (NetworkPerformance.isBusy(requests)) return

            if (Object.keys(requests.routes).length > 0) {
                this.logger.send({
                    event: PERFORMANCE_EVENTS.NETWORK_REQUESTS,
                    screen,
                    params: requests.routes,
                })
            }

            this.idleRequestsForScreens.delete(screen)
        })
    }

    destroy() {
        this.idleRequestsForScreens.clear()
    }
}
