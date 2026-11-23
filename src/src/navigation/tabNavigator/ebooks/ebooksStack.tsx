import { EbooksMainScreen } from '@mu-native/ebooks-main-screen'
import { type TNavigatorParams } from '@mu-native/navigation'

import { NavHeader } from '../../../../App/Components/NavHeader/NavHeader.tsx'

import { ebooksScreens } from './ebooksScreens'

export const ebooksStack: TNavigatorParams[] = [
    // root screen
    {
        name: ebooksScreens.ebooksMain,
        component: EbooksMainScreen,
        options: {
            header: () => <NavHeader noNotifications={false} tab showProfile />,
            headerTransparent: true,
        },
    },
]
