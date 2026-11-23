import { useEffect, useState } from 'react'
import { AppStateStatus, AppState } from 'react-native'

import { getCurrentAppState } from '../helpers/getCurrentAppState'

export const useAppState = (
    onStateChange?: (state: AppStateStatus) => void,
    deps: Array<any> = [],
) => {
    const [appState, setAppState] = useState<AppStateStatus>(getCurrentAppState)

    useEffect(() => {
        const subscription = AppState.addEventListener('change', newState => {
            // Отменяем коллбэк, если состояние не изменилось
            if (appState === newState) {
                return
            }

            setAppState(newState)
            onStateChange?.(newState)
        })

        return () => subscription.remove()
    }, [appState, ...deps])

    return appState
}
