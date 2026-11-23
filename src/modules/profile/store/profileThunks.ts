/* eslint-disable import/no-relative-packages */
import { handleError } from '@mu-native/api'
import { DispatchFun, TThunkAction } from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { NotificationIds, pushNotificationsThunks } from '@mu-native/pushNotifications'
import { checkConnection } from '@mu-native/system'
import { mmkvStorageEngine } from '@muse-native/persist-engines'
import { resetStoreState } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import { profileServices } from '../services/profileServices'

import { profileStoreChunk } from './profileStoreChunk.ts'

const remove: TThunkAction = () => async dispatch => {
    try {
        checkConnection()

        await profileServices.deleteProfile()

        reportEvent(MetricaEvents.PROFILE_DELETE_ACCOUNT_SUCCESS)

        mmkvStorageEngine?.clearStorage?.()

        dispatch(resetStoreState())
    } catch (error) {
        handleError(error)
    }
}

const setDailyReminder = (dailyReminderTime: Date | null) => {
    return async (dispatch: DispatchFun) => {
        if (dailyReminderTime) {
            const needToNotifyToday = dailyReminderTime > new Date()
            const firstNotificationDate = needToNotifyToday
                ? dailyReminderTime
                : new Date(dailyReminderTime.getTime() + 24 * 60 * 60 * 1000)
            // in 24 hour
            dispatch(
                pushNotificationsThunks.setLocalPushNotifications({
                    id: NotificationIds.DailyReminder,
                    notificationTime: firstNotificationDate,
                    title: translate('native.daily_reminders.title'),
                    message: translate('native.daily_reminders.message'),
                    repeatType: 'day',
                }),
            )
        } else {
            dispatch(
                pushNotificationsThunks.setLocalPushNotifications({
                    id: NotificationIds.DailyReminder,
                    notificationTime: dailyReminderTime ?? undefined,
                    title: translate('native.daily_reminders.title'),
                    message: translate('native.daily_reminders.message'),
                    repeatType: 'day',
                }),
            )
        }

        dispatch(profileStoreChunk.actions.setDailyReminderTime(dailyReminderTime))
    }
}

export const profileThunks = { remove, setDailyReminder }
