/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

import { ABScreen } from '@mu-native/ab'
import { TNavigatorParams } from '@mu-native/navigation'

import { NavHeader } from '../../../../App/Components/NavHeader/NavHeader.tsx'
import { AboutScreenContainer } from '../../../../App/profileScreens/profileScreen/aboutScreen/AboutScreeContainer'

import { profileScreens } from './profileScreens'

export const profileStack: TNavigatorParams[] = [
    // root screen
    {
        name: profileScreens.myProfileMain,
        component: require('@mu-native/profile-screen').ProfileScreen,
        options: { header: () => <NavHeader isProfile tab />, headerTransparent: true },
    },
    // screens
    {
        name: profileScreens.ab,
        component: ABScreen,
        options: { headerShown: true },
    },
    {
        name: profileScreens.engineerMenu,
        component:
            require('../../../../App/profileScreens/engineerMenuScreen/EngineerMenuScreenContainer')
                .default,
        options: { headerShown: false },
    },
    {
        name: profileScreens.about,
        component: AboutScreenContainer,
        options: { headerShown: false },
    },
    {
        name: profileScreens.follower,
        component:
            require('../../../../App/profileScreens/users/containers/UserFollowerScreenContainer')
                .default,
        options: { headerShown: false },
    },
    {
        name: profileScreens.profileMain,
        component: require('../../../../App/profileScreens/users/UserProfileScreenContainer')
            .default,
        options: { headerShown: false },
    },
]
