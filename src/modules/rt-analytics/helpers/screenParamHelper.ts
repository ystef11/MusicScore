import { getIsNewAppConcept } from '@mu-native/ab'
import { store } from '@mu-native/common'
import { NavigationService, Screen, PartialRoute } from '@mu-native/navigation'
import { searchStoreChunk } from '@mu-native/search'

// Screens reported to analytics under a name different from their route name.
// Every other screen is reported with its real route name.
const screenNameOverrides: Record<string, string> = {
    [Screen.scoreInfo]: 'ScoreInfoScreen',
    [Screen.activity]: 'Notifications',
}

type HistoryItem = { key: string }
type History = HistoryItem[]

const extractLastTabRoute = (route: PartialRoute<any>) => {
    if (!route.state || !route.state.history) return null

    const { history: tabHistory, routes: tabRoutes } = route.state
    const lastTab =
        tabHistory.length > 1
            ? (tabHistory as History).find(route => !route.key.startsWith(Screen.browse))
            : tabHistory[0]

    if (!lastTab) return null

    const lastTabRoute = tabRoutes.find(r => r.key === (lastTab as HistoryItem).key)

    if (!lastTabRoute || !lastTabRoute.state) return null

    const { routes: lastTabRoutes } = lastTabRoute.state
    return lastTabRoutes.at(-1)
}

const processScreenName = (route: PartialRoute<any>, state: any) => {
    const { name: screenName, params } = route
    if (screenName === Screen.browseMain) {
        if (getIsNewAppConcept()) {
            return 'HomeMain'
        }

        const searchQuery = searchStoreChunk.props.getSearchTerm(state)

        if (searchQuery) {
            return 'SearchMain'
        }
    }

    let processedScreenName = screenName
    if (screenName === Screen.followers) {
        const { mode } = params
        processedScreenName = mode === 'followings' ? 'ProfileFollowings' : 'ProfileFollowers'
    }

    return processedScreenName
}

export const getScreenParams = (): { screen: string | null; previousScreen: string | null } => {
    const state = store.getState()
    const navState = NavigationService.getState()

    if (!navState) {
        return { screen: 'Other', previousScreen: null }
    }

    const { routes: rootRoutes } = navState
    const appRoute = rootRoutes[0]

    const stack = appRoute.state

    if (!stack) {
        return { screen: 'Other', previousScreen: null }
    }

    const { routes } = stack
    const history = [...routes].reverse() as PartialRoute<any>[]
    let lastRoute = history[0]

    if (!lastRoute) {
        return { screen: 'Other', previousScreen: null }
    }

    if (lastRoute.name === Screen.tabNavigator) {
        const route = extractLastTabRoute(lastRoute)
        if (!route) {
            return { screen: 'Other', previousScreen: null }
        }
        lastRoute = route
    }

    let lastScreenName = processScreenName(lastRoute, state)
    lastScreenName = screenNameOverrides[lastScreenName] ?? lastScreenName

    let prevLastRoute = history[1]

    if (!prevLastRoute) {
        return { screen: lastScreenName, previousScreen: null }
    }

    if (prevLastRoute.name === Screen.tabNavigator) {
        const route = extractLastTabRoute(prevLastRoute)
        if (!route) {
            return { screen: lastScreenName, previousScreen: null }
        }
        prevLastRoute = route
    }

    let prevLastScreenName = processScreenName(prevLastRoute, state)
    prevLastScreenName = screenNameOverrides[prevLastScreenName] ?? prevLastScreenName

    return {
        screen: lastScreenName,
        previousScreen: prevLastScreenName,
    }
}
