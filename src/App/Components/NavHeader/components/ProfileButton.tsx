import { memo } from 'react'

import { brandColors, NavigationIconButton } from '@mu-native/ds'
import { user } from '@mu-native/icons/user'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../constants/MetricaEvents.ts'
import reportEvent from '../../../Utils/Analytics.ts'

export const ProfileButton = memo(() => {
    const { push } = useAppNavigation()

    const onOpenProfile = () => {
        reportEvent(MetricaEvents.NAVIGATION_BAR_ELEMENT_CLICK, {
            'params.key': ['tab6'],
            'params.value': [0],
            'params.str_value': ['ProfileTab'],
        })

        push(Screen.myProfileMain)
    }

    return (
        <NavigationIconButton
            testID="Profile icon"
            icon={user}
            color={brandColors.contentPrimary}
            onPress={onOpenProfile}
        />
    )
})
