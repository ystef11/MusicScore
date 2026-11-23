import { useEffect, useRef } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { platform, StoreContainer } from '@mu-native/common'
import { globalStyles, SafeAreaProvider } from '@mu-native/ds'
import { performanceLogService } from '@mu-native/performance'
import { useAppState } from '@mu-native/system'

import { LocaleSetupHoc } from '../modules/locale/hocs/LocaleSetupHoc.tsx'

import AppEffectsContainer from './AppEffectsContainer.tsx'
import { AppModalsContainer } from './AppModalsContainer.tsx'
import AppSetupContainer from './AppSetupContainer.tsx'
import MainAppContainer from './MainAppContainer.tsx'

if (platform.isAndroid) {
    require('../App/Services/GeneralResponsesProvider')
}

const App = () => {
    useEffect(() => {
        performanceLogService.appStart.markFirstRender()
    }, [])

    return (
        <GestureHandlerRootView style={globalStyles.flex1}>
            <SafeAreaProvider>
                <StoreContainer>
                    <LocaleSetupHoc>
                        <AppSetupContainer>
                            <MainAppContainer />
                            <AppModalsContainer />
                            <AppEffectsContainer />
                        </AppSetupContainer>
                    </LocaleSetupHoc>
                </StoreContainer>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}

const HeadlessCheck = () => {
    const appState = useAppState()

    const appLoaded = useRef(false)

    /** Prevent app running when its boot triggered by a background notification
     * but don't prevent it running in background after a normal start in foreground
     */

    if (['background', 'unknown', 'inactive'].includes(appState) && !appLoaded.current) {
        return null
    }

    /**
     * Marking the normal start in foreground
     */
    appLoaded.current = true

    return <App />
}

export default HeadlessCheck
