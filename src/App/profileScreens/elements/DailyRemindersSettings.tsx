import { useState } from 'react'
import { Alert, Linking, Platform, StyleSheet } from 'react-native'
import { uses24HourClock } from 'react-native-localize'

import { appsFlyerEvent } from '@mu-native/analytics'
import { AppText, BrandBaseListCell, BrandSwitcherListCell, colors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { profileStoreChunk, profileThunks } from '@mu-native/profile'
import { pushNotificationsThunks } from '@mu-native/pushNotifications'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import reportEvent from '../../Utils/Analytics'
import formatDate from '../../Utils/Date'

const styles = StyleSheet.create({
    timePicker: {
        alignSelf: 'center',
    },
    timeValue: {
        marginLeft: 8,
    },
})

const showAlertNotificationsForbidden = () => {
    Alert.alert(
        translate('native.push_notifications.forbidden_alert.title'),
        translate('native.push_notifications.forbidden_alert.subtitle'),
        [
            {
                text: translate('native.push_notifications.forbidden_alert.answers.not_now'),
                style: 'cancel',
            },
            {
                text: translate('native.push_notifications.forbidden_alert.answers.settings'),
                onPress: () => {
                    reportEvent(MetricaEvents.DAILY_REMINDERS_PROFILE_GO_TO_APP_SETTINGS)
                    Linking.openSettings()
                },
            },
        ],
    )
}

const DailyRemindersSettings = () => {
    const actions = useActions({
        setDailyReminder: profileThunks.setDailyReminder,
        requestPushPermission: pushNotificationsThunks.requestPushPermissionThunk,
        setFeatureText: marketingStoreChunk.actions.setFeatureText,
        setSource: marketingStoreChunk.actions.setSource,
        setDailyReminderEnabled: profileStoreChunk.actions.setDailyReminderEnabled,
    })

    const [reminderTime, dailyReminderEnabled] = useValues([
        profileStoreChunk.props.getDailyReminderTime,
        profileStoreChunk.props.getDailyReminderEnabled,
    ])
    const [date, setDate] = useState(reminderTime ? new Date(reminderTime) : new Date())

    const onValueChange = async (value: boolean) => {
        if (!value) {
            actions.setDailyReminderEnabled(false)
            actions.setDailyReminder(null)
            appsFlyerEvent('pushUnsubscribe')
            return
        }

        const granted = (await actions.requestPushPermission()) as unknown as boolean

        reportEvent(MetricaEvents.DAILY_REMINDERS, {
            value: 'profile',
            'params.key': ['allowed'],
            'params.str_value': [''],
            'params.value': [granted ? 1 : 0],
        })

        if (granted) {
            appsFlyerEvent('pushSubscribe')
            actions.setDailyReminderEnabled(true)
            actions.setDailyReminder(date)
        } else {
            showAlertNotificationsForbidden()
        }
    }

    const [isTimeDialogVisible, setTimeDialogVisible] = useState(false)

    const onChangeDate = (date: Date) => {
        setDate(date)
        if (dailyReminderEnabled) {
            actions.setDailyReminder(date)
        }
    }

    const onSpinnerChange = (_: DateTimePickerEvent, selected?: Date) => {
        if (selected) {
            onChangeDate(selected)
        }
    }

    const onTimeDialogChange = (event: DateTimePickerEvent, selected?: Date) => {
        setTimeDialogVisible(false)
        if (event.type === 'set' && selected) {
            onChangeDate(selected)
        }
    }

    return (
        <>
            <BrandSwitcherListCell
                title={translate('native.my_profile.daily_reminder_settings_description')}
                switchValue={dailyReminderEnabled}
                onSwitchChange={onValueChange}
            />
            {Platform.OS === 'ios' ? (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="spinner"
                    textColor={colors.text900}
                    themeVariant="light"
                    onChange={onSpinnerChange}
                    style={styles.timePicker}
                />
            ) : (
                <>
                    <BrandBaseListCell
                        title={translate('native.daily_reminders.tour.set_reminder_to')}
                        onPress={() => setTimeDialogVisible(true)}
                        rightComponent={
                            <AppText
                                font="f17w400"
                                brandColor="contentSecondary"
                                rawText={formatDate(date, uses24HourClock() ? 'HH:mm' : 'h:mm A')}
                                style={styles.timeValue}
                            />
                        }
                    />
                    {isTimeDialogVisible && (
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display="default"
                            onChange={onTimeDialogChange}
                        />
                    )}
                </>
            )}
        </>
    )
}

export default DailyRemindersSettings
