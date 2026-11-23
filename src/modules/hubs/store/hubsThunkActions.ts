import { Alert, Linking } from 'react-native'

import { DispatchFun, GetStateFun } from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { pushNotificationsThunks } from '@mu-native/pushNotifications'

import { hubsStoreChunk } from './hubsStoreChunk'

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
                    Linking.openSettings()
                },
            },
        ],
    )
}

const toggleWeeklyReminder = () => async (dispatch: DispatchFun, getState: GetStateFun) => {
    const enableWeeklyReminder = hubsStoreChunk.props.getWeeklyReminderEnabled(getState())

    if (enableWeeklyReminder) {
        dispatch(hubsStoreChunk.actions.setWeeklyReminderEnabled(false))
        return
    }

    const notificationsEnabled = await dispatch(
        pushNotificationsThunks.requestPushPermissionThunk(),
    )
    if (!notificationsEnabled) {
        showAlertNotificationsForbidden()
        return
    }

    dispatch(hubsStoreChunk.actions.setWeeklyReminderEnabled(true))
}

export const hubsThunks = {
    toggleWeeklyReminder,
}
