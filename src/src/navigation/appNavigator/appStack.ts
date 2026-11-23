import { TNavigatorParams } from '@mu-native/navigation'
import { TourUpdateScreen } from '@mu-native/tour-update-screen'

import { appNavigators } from './appNavigators'

export const appStack: TNavigatorParams[] = [
    {
        name: appNavigators.app,
        component: require('../mainAppNavigator/MainAppNavigator').MainAppNavigator,
    },
    {
        name: appNavigators.start,
        component: require('../startNavigator/StartNavigator').StartNavigator,
    },
    {
        name: appNavigators.tourInstall,
        component: require('../tourInstallNavigator/TourInstallNavigator').TourInstallNavigator,
        options: {
            gestureEnabled: false,
            animationDuration: 0,
        },
    },
    {
        name: appNavigators.tourUpdate,
        component: TourUpdateScreen,
    },
    {
        name: appNavigators.AuthStackScreen,
        component: require('@mu-native/auth/new/AuthStackScreen').AuthStackScreen,
        options: {
            headerShown: false,
            presentation: 'transparentModal',
        },
    },
]
