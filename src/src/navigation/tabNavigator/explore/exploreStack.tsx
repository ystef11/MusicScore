import type { TNavigatorParams } from '@mu-native/navigation'

import { NavHeader } from '../../../../App/Components/NavHeader/NavHeader.tsx'

import { exploreScreens } from './exploreScreens'

export const exploreStack: TNavigatorParams[] = [
    {
        name: exploreScreens.browseMain,
        component: require('@mu-native/explore-screen').ExploreScreen,
        options: {
            header: () => <NavHeader noNotifications={false} tab showProfile />,
            headerTransparent: true,
        },
    },
    {
        name: exploreScreens.browseExploreScores,
        component: require('@mu-native/new-concept-home-screen').ExploreScoresScreen,
        options: { headerShown: false },
    },
    {
        name: exploreScreens.songbooks,
        component: require('@mu-native/new-concept-home-screen').SongbooksScreen,
        options: { headerShown: false },
    },
]
