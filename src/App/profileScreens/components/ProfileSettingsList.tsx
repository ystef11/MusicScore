import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { profileTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { colors, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants, TourSteps } from '@mu-native/marketing'
import { mainAppScreens, Screen, useAppNavigation } from '@mu-native/navigation'
import { profileStoreChunk } from '@mu-native/profile'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import reportEvent from '../../Utils/Analytics'
import { ActivityNotificationSettingsItem } from '../elements/ActivityNotificationSettingsItem'
import { AwakeStatusSettingsItem } from '../elements/AwakeStatusSettingsItem'
import { DailyRemindersSettingsItem } from '../elements/DailyRemindersSettingsItem'
import { ProfileUserPedalListItem } from '../elements/ProfileUserPedal'
import { ProfileUserPreferencesSettingsListItem } from '../elements/ProfileUserPreferencesSettingsListItem'

import { AppUpdateSettingsItem } from '../elements/AppUpdateSettingsItem'
import SFGeneralSettingsProfileComponent from './SFGeneralSettingsProfileComponent'

const styles = StyleSheet.create({
    block: {
        alignSelf: 'center',
        width: '100%',
    },
    newContainer: {
        marginVertical: layout.marginSm,
    },
    newContainerTitle: {
        color: colors.text900,
        marginBottom: 8,
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
    },
})

export const ProfileSettingsList = memo(({ testID }: { testID?: string }) => {
    const navigation = useAppNavigation()

    const [isAuthorized, screenShouldBeAwake] = useValues([
        getIsAuthorized,
        profileStoreChunk.props.getScreenShouldStayAwake,
    ])
    const actions = useActions({
        presentAuthModal: authStoreChunk.actions.presentAuthModal,
        toggleScreenShouldStayAwake: profileStoreChunk.actions.toggleScreenShouldStayAwake,
    })

    const openNotificationSettings = () => {
        if (!isAuthorized) {
            actions.presentAuthModal(() => {
                reportEvent(MetricaEvents.NOTIFICATIONS_SETTINGS_EXPAND)

                navigation.push(Screen.userSetting, { mode: 'activity_notifications' })
            })
        } else {
            reportEvent(MetricaEvents.NOTIFICATIONS_SETTINGS_EXPAND)
            navigation.push(Screen.userSetting, { mode: 'activity_notifications' })
        }
    }

    const onOpenPreferencesUpdate = () => {
        navigation.navigate(Screen.tourInstall, {
            screen: Screen.tourInstall,
            params: {
                step: TourSteps.UPDATE_QUIZ_STEP,
                routeName: 'ProfileTab',
                source: marketingConstants.sources.quizUpdateProfile,
            },
        })
    }

    const onOpenPedalInterface = () => {
        navigation.navigate(mainAppScreens.pedalSettings)
    }

    const changeAwakeStatus = () => {
        actions.toggleScreenShouldStayAwake('')
    }

    return (
        <View style={styles.block} testID={testID}>
            <Text
                style={styles.newContainerTitle}
                testID={profileTestIds.profileSettings.profileSettingsTitle}
            >
                {translate('native.my_profile.settings_section')}
            </Text>
            <View style={styles.newContainer}>
                <AppUpdateSettingsItem />
                <AwakeStatusSettingsItem
                    screenShouldBeAwake={screenShouldBeAwake}
                    changeAwakeStatus={changeAwakeStatus}
                />
                <ActivityNotificationSettingsItem
                    testID={testID ? `${testID} notifications` : undefined}
                    onPress={openNotificationSettings}
                />
                <ProfileUserPreferencesSettingsListItem
                    testID={profileTestIds.profileSettings.preferencesItem}
                    onPress={onOpenPreferencesUpdate}
                />
                <DailyRemindersSettingsItem />
                <ProfileUserPedalListItem
                    testID={profileTestIds.profileSettings.pedalItem}
                    onPress={onOpenPedalInterface}
                />
                <SFGeneralSettingsProfileComponent
                    testID={profileTestIds.profileSettings.hqSoundItem}
                />
            </View>
        </View>
    )
})
