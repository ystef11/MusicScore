import { Platform } from 'react-native'
import { checkNotifications, RESULTS } from 'react-native-permissions'

import { apiRequest, notificationContracts } from '@mu-native/api'
import { device } from '@mu-native/common'
import { rtAnalyticsService } from '@mu-native/rt-analytics'
import notifee, {
    AndroidImportance,
    AuthorizationStatus,
    RepeatFrequency,
    TimestampTrigger,
    TriggerType,
} from '@notifee/react-native'
import messaging from '@react-native-firebase/messaging'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { pushNotificationChannel } from '../constants/channels'
import { LocalNotificationParams } from '../types/pushNotificationsAppTypes'
import { TNotification } from '../types/pushNotificationsServiceTypes'
import { convertNotification } from '../utils/convertNotification'
import { getAnalyticParams } from '../utils/getAnalyticParams'

export const getScheduledLocalNotifications = async () => {
    return notifee.getTriggerNotifications()
}

export const sendPushToken = (pushToken: string) => {
    return apiRequest(notificationContracts.pushToken, { payload: { push_token: pushToken } })
}

export const createChannels = async () => {
    await notifee.createChannel({
        id: pushNotificationChannel.channelId,
        name: pushNotificationChannel.channelName,
    })

    await notifee.createChannel({
        id: 'Bloomreach',
        name: 'Bloomreach',
    })
}

export const checkPermission = async () => {
    if (Platform.OS === 'android') {
        const settings = await notifee.getNotificationSettings()
        return {
            alert: settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED,
        }
    }
    const authStatus = await messaging().hasPermission()
    return {
        alert:
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL,
    }
}

export const requestPermission = async () => {
    if (Platform.OS === 'android') {
        /**
         * Starting Android 13 (API 33) it is required to request the notification permission in runtime
         * same as on iOS. Prior versions allow notifications by default.
         */
        if (device.apiVersion < 33) {
            const { alert } = await checkPermission()
            return !!alert
        }

        const result = await checkNotifications()
        return result.status === RESULTS.GRANTED
    }
    const authStatus = await messaging().requestPermission()
    return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
    )
}

export const cancelLocalNotification = async (id: string) => {
    await notifee.cancelTriggerNotification(id)
}

const getRepeatFrequency = (
    repeatType?: 'day' | 'week' | 'hour' | 'minute' | 'time',
): RepeatFrequency | undefined => {
    switch (repeatType) {
        case 'day':
            return RepeatFrequency.DAILY
        case 'week':
            return RepeatFrequency.WEEKLY
        case 'hour':
            return RepeatFrequency.HOURLY
        default:
            return undefined
    }
}

export const setLocalPushNotifications = async ({
    id,
    notificationTime,
    message,
    title,
    repeatType,
    userInfo = {},
}: LocalNotificationParams) => {
    // Ensure channel exists
    await createChannels()

    const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationTime?.getTime() ?? Date.now(),
        repeatFrequency: getRepeatFrequency(repeatType),
    }

    return notifee.createTriggerNotification(
        {
            id: String(id),
            title,
            body: message,
            data: {
                id: String(id),
                ...userInfo,
            },
            android: {
                channelId: pushNotificationChannel.channelId,
                pressAction: {
                    id: 'default',
                },
                importance: AndroidImportance.HIGH,
            },
            ios: {
                sound: 'default',
            },
        },
        trigger,
    )
}

export const displayNotification = async ({
    id,
    message,
    title,
    userInfo = {},
}: Omit<LocalNotificationParams, 'notificationTime' | 'repeatType'>) => {
    // Ensure channel exists
    await createChannels()

    return notifee.displayNotification({
        id: String(id),
        title,
        body: message,
        data: {
            id: String(id),
            ...userInfo,
        },
        android: {
            channelId: pushNotificationChannel.channelId,
            pressAction: {
                id: 'default',
            },
            importance: AndroidImportance.HIGH,
        },
        ios: {
            sound: 'default',
        },
    })
}

const sendAnalyticEvent = async (notification: TNotification, event: string) => {
    if (!notification.data.attributes?.campaign_id) {
        return
    }

    rtAnalyticsService.sendEventImmediately(
        { ...getAnalyticParams(notification), event },
        'mu_push_event',
    )
}

const handleAndroidBackgroundMessage = async (notification: TNotification) => {
    try {
        sendAnalyticEvent(notification, MetricaEvents.PUSH_DELIVERED)
    } catch (error) {
        console.log('@@handleAndroidBackgroundMessage error', error)
    }
}

async function setupBackgroundPushDelivery() {
    if (Platform.OS === 'android') {
        // Set background message handler for Firebase Messaging
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            pushNotificationService.handleAndroidBackgroundMessage(
                convertNotification(remoteMessage),
            )
        })
    }
}

export const pushNotificationService = {
    getScheduledLocalNotifications,
    sendPushToken,
    createChannels,
    checkPermission,
    requestPermission,
    cancelLocalNotification,
    setLocalPushNotifications,
    displayNotification,
    handleAndroidBackgroundMessage,
    setupBackgroundPushDelivery,
    sendAnalyticEvent,
}
