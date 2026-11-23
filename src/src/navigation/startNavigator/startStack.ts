import type { TNavigatorParams } from '@mu-native/navigation'

import { startScreens } from './startScreens'

export const startStack: TNavigatorParams[] = [
    {
        name: startScreens.start,
        component: require('../../../App/Start/StartScreen').StartScreen,
        options: { headerShown: false },
    },
]
