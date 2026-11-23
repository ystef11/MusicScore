import { Platform } from 'react-native'

import { AppsFlyerService } from '@mu-native/api'
import type { DispatchFun, TThunkAction } from '@mu-native/common'
import { fcm, platform } from '@mu-native/common'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import { pushNotificationService } from '../services/pushNotificationsService'
import { pushNotificationsStorage } from '../storage/pushNotificationsStorage'
import { LocalNotificationParams } from '../types/pushNotificationsAppTypes'
import { TNotification } from '../types/pushNotificationsServiceTypes'

import { pushNotificationsStoreChunk } from './pushNotificationsStoreChunk.ts'

const setLocalPushNotifications: TThunkAction<LocalNotificationParams> =
    notification => async () => {
        try {
            if (notification.notificationTime) {
                await pushNotificationService.setLocalPushNotifications(notification)
            } else {
                await pushNotificationService.cancelLocalNotification(String(notification.id))
            }
        } catch (error) {
            console.log('@@setLocalPushNotifications error', error)
        }
    }

const checkAndRegisterNewToken = () => async (dispatch: DispatchFun, getState: () => any) => {
    try {
        const permission = await fcm().hasPermission()
        const storedPermissionGranted =
            pushNotificationsStoreChunk.props.getPermissionGranted(getState())

        const permissionNotDetermined =
            permission === fcm.AuthorizationStatus.NOT_DETERMINED ||
            (storedPermissionGranted === null && permission === fcm.AuthorizationStatus.DENIED)

        // It's OK to send these events at each app launch
        if (permissionNotDetermined) {
            dispatch(pushNotificationsStoreChunk.actions.setPermissionGranted(null))
            reportEvent(MetricaEvents.PUSH_PERMISSION_UNDEFINED)
            return
        }

        if (permission === fcm.AuthorizationStatus.DENIED) {
            dispatch(pushNotificationsStoreChunk.actions.setPermissionGranted(false))
            reportEvent(MetricaEvents.PUSH_PERMISSION_DENIED)
            return
        }

        dispatch(pushNotificationsStoreChunk.actions.setPermissionGranted(true))
        dispatch(onRegister())
    } catch (error) {
        console.log('@@checkAndRegisterNewToken error', error)
    }
}

const onRegister: TThunkAction<void> = () => async () => {
    try {
        // On Android, token might be null initially, so we get it from FCM directly
        const token = platform.isAndroid ? await fcm().getToken() : await fcm().getAPNSToken()
        const localToken = pushNotificationsStorage.get('sentToken')

        reportEvent(MetricaEvents.PUSH_PERMISSION_ACCEPTED, {
            push_token: token ?? undefined,
        })

        if (token && token !== localToken) {
            pushNotificationsStorage.set('sentToken', token)

            await pushNotificationService.sendPushToken(token)
        }
    } catch (error) {
        console.log('@@onRegister error', error)
    }
}

const requestPushPermissionThunk = () => async (dispatch: DispatchFun) => {
    try {
        const hasPushPermission = await pushNotificationService.requestPermission()
        dispatch(pushNotificationsStoreChunk.actions.setPermissionGranted(hasPushPermission))

        const storedNotificationPermissions =
            pushNotificationsStorage.get('notificationPermissions')

        if (hasPushPermission === storedNotificationPermissions) {
            return hasPushPermission
        }

        if (hasPushPermission) {
            dispatch(onRegister())
        } else {
            reportEvent(MetricaEvents.PUSH_PERMISSION_DENIED, {
                push_token: pushNotificationsStorage.get('sentToken'),
            })
        }

        pushNotificationsStorage.set('notificationPermissions', Boolean(hasPushPermission))
        return hasPushPermission
    } catch (error) {
        console.log('@@requestPushPermissionThunk error', error)
        return false
    }
}

const onForegroundNotification: TThunkAction<TNotification> =
    (notification: TNotification) => async () => {
        try {
            pushNotificationService.sendAnalyticEvent(notification, MetricaEvents.PUSH_DELIVERED)
        } catch (error) {
            console.log('@@onForegroundNotification error', error)
        }
        if (Platform.OS === 'android') {
            if (!notification.data.attributes?.campaign_id) {
                return
            }
            // Display the notification as a local notification on Android when in foreground
            await pushNotificationService.displayNotification({
                id: notification.messageId || Date.now(),
                message: notification.data.attributes.message || '',
                title: notification.data.attributes.title,
                userInfo: notification.data,
            })
        }
    }

const onNotificationClick: TThunkAction<TNotification> = notification => async () => {
    try {
        pushNotificationService.sendAnalyticEvent(notification, MetricaEvents.PUSH_CLICKED)
        const url = notification.data?.attributes?.url
        if (url) {
            AppsFlyerService.handleDeeplink(url)
        }
    } catch (error) {
        console.log('@@onNotificationClick error', error)
    }
}

export const pushNotificationsThunks = {
    setLocalPushNotifications,
    requestPushPermissionThunk,
    checkAndRegisterNewToken,
    onRegister,
    onForegroundNotification,
    onNotificationClick,
}
