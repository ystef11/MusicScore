import type { TNavigatorParams } from '@mu-native/navigation'

import { NavHeader } from '../../../../App/Components/NavHeader/NavHeader.tsx'

import { coursesScreens } from './coursesScreens'

export const coursesStack: TNavigatorParams[] = [
    {
        name: coursesScreens.coursesMain,
        component: require('@mu-native/new-concept-learn-screen').LearnRootScreen,
        options: {
            header: () => <NavHeader noNotifications={false} tab showProfile />,
            headerTransparent: true,
        },
    },
    {
        name: coursesScreens.learnMyCourses,
        component: require('@mu-native/new-concept-learn-screen').MyCoursesScreen,
        options: { headerShown: false },
    },
    {
        name: coursesScreens.learnSearchCourses,
        component: require('@mu-native/new-concept-learn-screen').SearchCoursesScreen,
        options: { headerShown: false },
    },
]
