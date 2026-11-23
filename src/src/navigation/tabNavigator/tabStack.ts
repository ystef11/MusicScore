import type { TNavigatorParams } from '@mu-native/navigation'

import { tabNavigators } from './tabNavigators'

export const getTabStack = (): TNavigatorParams[] => [
    {
        name: tabNavigators.browse,
        component: require('./explore/ExploreNavigator').default,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.search,
        component: require('./search/SearchNavigator').default,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.learn,
        component: require('./courses/CoursesNavigator').default,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.omr,
        component: require('./profile/ProfileNavigator').ProfileNavigator,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.ebooks,
        component: require('./ebooks/EbooksNavigator').EbookNavigator,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.library,
        component: require('./library/LibraryNavigator').default,
        options: { headerShown: false },
    },
    {
        name: tabNavigators.profile,
        component: require('./profile/ProfileNavigator').ProfileNavigator,
        options: { headerShown: false },
    },
]
