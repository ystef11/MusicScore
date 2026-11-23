import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native'

import { setRequestObserver } from '@mu-native/api'
import { NavigationService } from '@mu-native/navigation'
import { getScreenParams } from '@mu-native/rt-analytics'

import { AppStartMetricsTracker } from './AppStartMetricsTracker'
import { NetworkPerformance } from './NetworkPerformance'
import { performanceLogger, TPerformanceLogger } from './performanceLogger'
import { PerformanceSessionManager } from './PerformanceSessionManager'
import { ScreenRenderPerformance } from './ScreenRenderPerformance'

type TParams = {
    logger: TPerformanceLogger
}

class PerformanceLogService {
    readonly appStart: AppStartMetricsTracker

    private network: NetworkPerformance

    private render: ScreenRenderPerformance

    private sessionManager = new PerformanceSessionManager()

    private appStateSubscription: NativeEventSubscription | null

    private navigationSubscription: (() => void) | null

    /**
     * Screen history kept here rather than read from `getScreenParams()`: that one derives the
     * previous screen from the root stack, where the whole tab navigator is a single entry, so
     * every tab-to-tab transition would report no previous screen at all.
     */
    private currentScreen: string | null = null

    private previousScreen: string | null = null

    constructor({ logger }: TParams) {
        this.appStart = new AppStartMetricsTracker({ logger })
        this.network = new NetworkPerformance({
            logger,
            getCurrentScreen: () => getScreenParams().screen ?? 'Other',
        })
        this.render = new ScreenRenderPerformance({ logger, sessionManager: this.sessionManager })

        setRequestObserver(this.network.trackRequest)
        this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange)
        // First call comes on container ready, which seeds the initial route
        this.navigationSubscription = NavigationService.addStateListener(this.handleScreenChange)
    }

    getScreens = () => ({ screen: this.currentScreen, previousScreen: this.previousScreen })

    private handleAppStateChange = (appState: AppStateStatus) => {
        if (appState === 'active') {
            this.sessionManager.startNewSession()

            return
        }

        // Only a real departure flushes everything: on 'inactive' (sheets, control centre) the
        // screen is still in view and its requests keep arriving.
        if (appState === 'background') {
            this.network.sendIdleRequests()
        }
    }

    /** Runs on every navigation state change: requests of the screens left behind get reported */
    private handleScreenChange = () => {
        const { screen } = getScreenParams()

        if (screen !== this.currentScreen) {
            this.previousScreen = this.currentScreen
            this.currentScreen = screen
        }

        this.network.sendIdleRequests(screen)
    }

    /** Close the app start timeline once navigation is ready. */
    handleAppStart = () => {
        const measures = this.appStart.markInteractive()
        if (measures) {
            this.appStart.log(measures)
        }
    }

    destroy = () => {
        this.appStateSubscription?.remove()
        this.appStateSubscription = null
        this.navigationSubscription?.()
        this.navigationSubscription = null
        setRequestObserver(null)
        this.network.destroy()
        this.render.destroy()
    }
}

export const performanceLogService = new PerformanceLogService({ logger: performanceLogger })
