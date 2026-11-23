import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { activityModuleStoreChunk, activityThunkActions } from '@mu-native/activity'
import { authStoreChunk } from '@mu-native/auth'
import { AppText, BadgeWrapper, CommonTouchable, layout, SvgAsset } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import UserAvatar from '../../../../App/Score/Comments/ScreenComments/UserAvatar.tsx'

const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
    if (hour < 5) return 'night'
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    if (hour < 22) return 'evening'
    return 'night'
}

const GREETING_KEY = {
    morning: 'native.new_concept.home.greeting.morning',
    afternoon: 'native.new_concept.home.greeting.afternoon',
    evening: 'native.new_concept.home.greeting.evening',
    night: 'native.new_concept.home.greeting.night',
} as const

const getGreetingText = (firstName?: string | null) => {
    const timeOfDay = getTimeOfDay(new Date().getHours())
    const greetingPrefix = translate(GREETING_KEY[timeOfDay])
    const name = firstName?.trim()
    return name ? `${greetingPrefix}, ${name}` : greetingPrefix
}

export const GreetingsHeader = () => {
    const navigation = useAppNavigation()
    const [user, userProfile, notificationCount] = useValues([
        authStoreChunk.props.getUser,
        authStoreChunk.props.getUserProfile,
        activityModuleStoreChunk.props.getNotificationCount,
    ])
    const actions = useActions({
        fetchActivityNotificationCount: activityThunkActions.fetchActivityNotificationCount,
    })

    // Keep the avatar badge in sync with unread notifications, matching the
    // notification bell on the legacy Explore header.
    useEffect(() => {
        actions.fetchActivityNotificationCount()
        return navigation.addListener('focus', actions.fetchActivityNotificationCount)
    }, [actions, navigation])

    const onProfilePress = () => {
        navigation.push(Screen.myProfileMain)
    }

    const userAvatar = user?.avatar
    // Prefer the real first name from the profile; fall back to the username.
    const firstName = userProfile?.firstName || user?.name?.split(' ')[0]

    return (
        <View style={styles.container}>
            <AppText
                font="f24w600"
                numberOfLines={2}
                rawText={getGreetingText(firstName)}
                style={styles.title}
            />
            <CommonTouchable onPress={onProfilePress} style={styles.profileButton} isHapticEnabled>
                <BadgeWrapper isShow={!!notificationCount} translateX={-1} translateY={1}>
                    {userAvatar ? (
                        <UserAvatar source={{ uri: userAvatar }} />
                    ) : (
                        <SvgAsset type="ic_user_avatar" width={AVATAR_SIZE} height={AVATAR_SIZE} />
                    )}
                </BadgeWrapper>
            </CommonTouchable>
        </View>
    )
}

const AVATAR_BUTTON_SIZE = 40
const AVATAR_SIZE = 44

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingVertical: layout.marginSm,
        gap: layout.marginXm,
    },
    title: {
        flex: 1,
    },
    profileButton: {
        width: AVATAR_BUTTON_SIZE,
        height: AVATAR_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: AVATAR_BUTTON_SIZE / 2,
    },
})
