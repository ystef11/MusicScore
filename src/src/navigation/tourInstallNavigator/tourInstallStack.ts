import type { TNavigatorParams } from '@mu-native/navigation'

import { tourInstallScreens } from './tourInstallScreens'

export const tourInstallStack: TNavigatorParams[] = [
    {
        name: tourInstallScreens.tourInstall,
        component: require('@mu-native/tour-install-screen').TourInstallScreen,
        options: { headerShown: false },
    },
    {
        name: tourInstallScreens.notifications,
        component: require('../../../App/Notifications/ScreenNotifications/ScreenNotifications')
            .ScreenNotificationsContainer,
        options: { headerShown: false },
    },
]
