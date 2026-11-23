import {
    appNavigators,
    startScreens,
    mainAppScreens,
    exploreScreens,
    searchScreens,
    libraryScreens,
    profileScreens,
    coursesScreens,
    tourInstallScreens,
    tourUpdateScreens,
    tabNavigators,
    ebooksScreens,
} from '../../../src/navigation'
import { AuthStackScreens } from '../../auth/new/authStack'

export const NavigatorName = {
    AppNavigator: 'App',
    MainNavigator: 'Main',
    StartNavigator: 'Start',
    RootStack: 'Root',
    TourInstallNavigator: 'TourInstall',
    TourUpdateNavigator: 'TourUpdate',
} as const

export const Screen = {
    ...appNavigators,
    ...startScreens,
    ...mainAppScreens,
    ...exploreScreens,
    ...searchScreens,
    ...libraryScreens,
    ...profileScreens,
    ...coursesScreens,
    ...tourInstallScreens,
    ...tourUpdateScreens,
    ...tabNavigators,
    ...AuthStackScreens,
    ...ebooksScreens,
} as const
