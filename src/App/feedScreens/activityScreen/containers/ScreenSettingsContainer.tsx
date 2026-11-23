import { JSX, useLayoutEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { profileTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors } from '@mu-native/ds'
import { LocaleKey, translate } from '@mu-native/locale'
import { RouteProp, useNavigation, useRoute } from '@mu-native/navigation'

import { NavHeader } from '../../../Components/NavHeader/NavHeader'
import DailyRemindersSettings from '../../../profileScreens/elements/DailyRemindersSettings'
import HQSettingsElement from '../../../profileScreens/elements/HQSettingsElement.tsx'
import ActivityNotifications from '../elements/ActivityNotifications'

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    container: {
        alignSelf: 'center',
        width: '100%',
        flex: 1,
    },
    description: {
        marginHorizontal: 20,
        marginBottom: 4,
    },
})

const settingsBook: {
    [value: string]: { title: LocaleKey; description?: LocaleKey; component: JSX.Element }
} = {
    activity_notifications: {
        title: 'native.my_profile.notification_settings_title',
        component: <ActivityNotifications />,
    },
    daily_reminder: {
        title: 'native.my_profile.daily_reminder_settings_title',
        component: <DailyRemindersSettings />,
    },
    hq_sound: {
        title: 'native.my_profile.hq_sound_settings_title',
        description: 'native.my_profile.hq_sound_settings_description',
        component: <HQSettingsElement />,
    },
}

export type ParamsT = {
    Settings: {
        mode: string
    }
}

export const ScreenSettingsContainer = () => {
    const navigation = useNavigation()
    const { params } = useRoute<RouteProp<ParamsT, 'Settings'>>()
    const { mode } = params
    const { title, description, component } = settingsBook[mode || 'activity_notifications']

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: (props: any) => (
                <NavHeader
                    {...props}
                    testID={profileTestIds.settingsScreen.back}
                    headerTitle={
                        /* @ts-ignore */
                        (title && translate(title)) || ''
                    }
                    noNotifications
                />
            ),
        })
    }, [])

    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                {!!description && (
                    <AppText
                        font="f17w400"
                        brandColor="contentPrimary"
                        lineHeight={24}
                        style={styles.description}
                        /* @ts-ignore */
                        rawText={translate(description)}
                    />
                )}
                {params ? component : null}
            </View>
        </View>
    )
}
