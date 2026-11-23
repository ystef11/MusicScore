import type { TNavigatorParams } from '@mu-native/navigation'

import { exploreScreens } from '../explore/exploreScreens'

import { searchScreens } from './searchScreens'

export const searchStack: TNavigatorParams[] = [
    {
        name: searchScreens.searchRoot,
        component: require('@mu-native/new-concept-search-screen').SearchScreen,
        options: { headerShown: false },
    },
    {
        name: searchScreens.searchResults,
        component: require('@mu-native/new-concept-search-screen').SearchResultsScreen,
        options: { headerShown: false },
    },
    {
        // Reused for the genre drill-down so it stays within the Search tab stack.
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
