import { Linking as RNLinking } from 'react-native'

import { AppsFlyerService, isMonetizationLink } from '@mu-native/api'
import { LinkingOptions } from '@react-navigation/native'

import { Screen, NavigatorName } from '../constants/screens'

const appPrefixes = ['musescoreapp://', 'musescore://', 'muse-mu://']
const onelinkRoutes = [
    'https://mu.onelink.me',
    'https://mu.deeplink.com',
    'https://deeplink.musescore.com',
]
const prefixes = [
    ...onelinkRoutes,
    ...appPrefixes,
    'https://www.musescore.com',
    'https://musescore.com',
]

export const Linking: LinkingOptions<any> = {
    prefixes,
    async getInitialURL() {
        const url = await RNLinking.getInitialURL()

        return url
    },
    subscribe: listener => {
        return AppsFlyerService.subscribe(
            (link: string) => !isMonetizationLink(link),
            listener,
        )
    },
    config: {
        screens: {
            [NavigatorName.AppNavigator]: {
                screens: {
                    [Screen.tabNavigator]: {
                        screens: {
                            [Screen.browse]: 'scores',
                            [Screen.learn]: 'courses',
                            [Screen.library]: 'library',
                            [Screen.feed]: 'feed',
                            [Screen.profile]: 'profile',
                        },
                    },
                    [Screen.activity]: 'activity',
                    [Screen.adventCalendar]: 'adventCalendar',
                    [Screen.addSet]: 'addSet',
                    [Screen.allHubs]: 'hubs',
                    [Screen.anniversarySplash]: 'anniversarySplash',
                    [Screen.artist]: 'artist',
                    [Screen.createEditSet]: 'createEditSet',
                    [Screen.comments]: 'comments',
                    [Screen.courseCommentThread]: 'courseCommentThread',
                    [Screen.courseMain]: 'course_id/:courseId',
                    [Screen.flashSplash]: 'flashSplash',
                    [Screen.floatingButtonLanding]: 'floatingButtonLanding',
                    [Screen.followers]: 'followers',
                    [Screen.game]: 'game',
                    [Screen.myProfileFavorites]: 'favorites',
                    [Screen.mySheetmusic]: 'my_scores',
                    [Screen.hubMain]: 'hub_section/:hubId',
                    [Screen.noLanding]: 'noLanding',
                    [Screen.profileMain]: 'user/:userId',
                    [Screen.profileSet]: 'my_sets/:userName',
                    [Screen.orders]: 'orders',
                    [Screen.ordersCourses]: 'coursesOrders',
                    [Screen.profileSheetMusic]: 'profileSheetMusic',
                    [Screen.returnSplash]: 'pro_offer',
                    [Screen.searchCourses]: 'coursesSearch',
                    [Screen.score]: 'score/:score',
                    [Screen.loadScore]: 'loadScore/:scoreId',
                    [Screen.songBook]: 'librarySongbook',
                    [Screen.songBookOrders]: 'librarySongbookOrders',
                    [Screen.songSheetmusic]: 'songSheetmusic',
                    [Screen.featuresLandingScreen]: 'featuresLandingScreenId',
                    [Screen.creditsLandingScreen]: 'creditsLandingScreenId',
                    [Screen.userSetting]: 'screenSettingsId',
                    [Screen.debug]: 'debug',
                    [Screen.debugAnalytics]: 'debugAnalytics',
                    [Screen.debugEvent]: 'debugEvent',
                    [Screen.debugApi]: 'debugApi',
                    [Screen.debugRequest]: 'debugRequest',
                    [Screen.inviteFriends]: 'inviteFriends/:userId',
                },
            },
            [NavigatorName.TourInstallNavigator]: {
                screens: {
                    [Screen.tourInstall]: 'tourInstall',
                    [Screen.notifications]: 'notifications',
                },
            },
            [NavigatorName.TourUpdateNavigator]: {
                path: 'update',
            },
        },
    },
}
