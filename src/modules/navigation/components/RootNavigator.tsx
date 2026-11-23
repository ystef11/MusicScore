import React, { JSX, useEffect } from 'react'
import { SheetProvider } from 'react-native-sheet2'

import { AppsFlyerService } from '@mu-native/api'
import { AppAlertHost, colors } from '@mu-native/ds'
import { NpsSheet } from '@mu-native/nps'
import { OmrSheet } from '@mu-native/omr'
import { DeviceVerificationSheet, RatingScoreSheet } from '@mu-native/score-screen'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { ForcedLogoutContainer } from '../../../App/ForcedLogout/ForcedLogoutContainer.tsx'
import { ListItemsSheet } from '../../../App/ListItemsSheet.tsx'
import reportEvent from '../../../App/Utils/Analytics'
import { Screen } from '../constants/screens'
import NavigationService from '../services/NavigationService'
import { navigationThunks } from '../store/navigationThunks'
import { TNavigatorParams } from '../types/navgationTypes'

import { Linking } from './Linking'
import { StackNavigator } from './StackNavigator'

type TProps = {
    screenOptions?: NativeStackNavigationOptions
    stack: TNavigatorParams[]
    onReady?: () => void
}

const getRoute = (data: any): string => {
    const route = data.routes[data.index]

    if (route.state) {
        return getRoute(route.state)
    }
    // TODO: удалить, когда перепишем profileScreen
    // нужно для mcdp ProfileFollowers
    if (route.params?.customScreenName) {
        return route.params?.customScreenName
    }

    return route.name
}

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: colors.white,
    },
}

export const RootNavigator = ({ screenOptions, stack, onReady }: TProps): JSX.Element => {
    const actions = useActions({
        setScreens: navigationThunks.setScreen,
    })

    const handleChangeNavigationState = React.useCallback((state: unknown) => {
        const route = getRoute(state)
        const excluded: string[] = [
            // it involves complicated logic with SearchMain screen name so it's encapsulated in the ScreenExplore itself
            Screen.browseMain,
        ]

        if (__DEV__) console.log('🧭 [NAVIGATION]', route)
        reportEvent(MetricaEvents.VIEW_PAGE)
        if (excluded.includes(route)) return

        actions.setScreens(getRoute(state))
    }, [])

    useEffect(() => {
        AppsFlyerService.startListeningDeepLinks()
    }, [])

    const handleReady = () => {
        NavigationService.handleContainerReady()
        onReady?.()
    }

    return (
        <NavigationContainer
            linking={Linking}
            theme={theme}
            ref={NavigationService.setContainer}
            onReady={handleReady}
            onStateChange={handleChangeNavigationState}
        >
            <SheetProvider addGlobalSheetView>
                <StackNavigator screenOptions={screenOptions} screens={stack} />
                <RatingScoreSheet />
                <ListItemsSheet />
                <AppAlertHost />
                <OmrSheet />
                <ForcedLogoutContainer />
                <DeviceVerificationSheet />
                <NpsSheet />
            </SheetProvider>
        </NavigationContainer>
    )
}
