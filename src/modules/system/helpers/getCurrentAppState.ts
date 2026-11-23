import { AppState, type AppStateStatus } from 'react-native'

const appStateStatuses: ReadonlySet<string> = new Set<AppStateStatus>([
    'active',
    'background',
    'inactive',
    'extension',
    'unknown',
])

const isAppStateStatus = (state: string | null | undefined): state is AppStateStatus =>
    !!state && appStateStatuses.has(state)

export const getCurrentAppState = (): AppStateStatus => {
    const state = AppState.currentState
    return isAppStateStatus(state) ? state : 'unknown'
}
