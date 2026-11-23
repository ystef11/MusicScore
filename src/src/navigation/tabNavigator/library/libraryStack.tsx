import type { TNavigatorParams } from '@mu-native/navigation'

import { NavHeader } from '../../../../App/Components/NavHeader/NavHeader.tsx'

import { libraryScreens } from './libraryScreens'

export const libraryStack: TNavigatorParams[] = [
    {
        name: libraryScreens.libraryMain,
        component: require('@mu-native/new-concept-library-screen').LibraryRootScreen,
        options: {
            header: () => <NavHeader noNotifications={false} tab showProfile />,
            headerTransparent: true,
        },
    },
    {
        name: libraryScreens.librarySavedScores,
        component: require('@mu-native/new-concept-library-screen').LibrarySavedScoresScreen,
        options: { headerShown: false },
    },
    {
        name: libraryScreens.librarySongbooks,
        component: require('@mu-native/new-concept-library-screen').LibrarySongbooksScreen,
        options: { headerShown: false },
    },
    {
        name: libraryScreens.librarySet,
        component: require('@mu-native/new-concept-library-screen').LibrarySetScreen,
        options: { headerShown: false },
    },
]
