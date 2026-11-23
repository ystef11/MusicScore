import { memo, useCallback, useEffect } from 'react'

import { activityModuleStoreChunk, activityThunkActions } from '@mu-native/activity'
import { brandColors, NavigationIconButton } from '@mu-native/ds'
import { bell } from '@mu-native/icons/bell'
import { NavigationService, Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

export const NotificationButton = memo(() => {
    const [count] = useValues([activityModuleStoreChunk.props.getNotificationCount])
    const navigation = useAppNavigation()
    const actions = useActions({
        fetchActivityNotificationCount: activityThunkActions.fetchActivityNotificationCount,
    })

    const handlePress = useCallback(() => {
        NavigationService.navigate(Screen.activity)
    }, [])

    useEffect(() => {
        actions.fetchActivityNotificationCount()
        return navigation.addListener('focus', actions.fetchActivityNotificationCount)
    }, [actions, navigation])

    return (
        <NavigationIconButton
            testID="Notification bell"
            icon={bell}
            color={brandColors.contentPrimary}
            onPress={handlePress}
            showBadge={!!count}
        />
    )
})
