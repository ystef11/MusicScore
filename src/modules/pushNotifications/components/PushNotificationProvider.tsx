import { memo, useEffect } from 'react'

import { appsFlyerEvent } from '@mu-native/analytics'
import { useActions } from '@ug/store'
import messaging from '@react-native-firebase/messaging'
import notifee, { EventType } from '@notifee/react-native'

import { pushNotificationsThunks } from '../store/pushNotificationsThunks'
import { convertNotification, convertNotifeeNotification } from '../utils/convertNotification'
import { pushNotificationService } from '../services/pushNotificationsService'

export const PushNotificationProvider = memo(() => {

    const actions = useActions({
        onForegroundNotification: pushNotificationsThunks.onForegroundNotification,
        onNotificationClick: pushNotificationsThunks.onNotificationClick,
        checkAndRegisterNewToken: pushNotificationsThunks.checkAndRegisterNewToken,
        onRegister: pushNotificationsThunks.onRegister,
    })

    useEffect(() => {
        // Create notification channels for Android
        pushNotificationService.createChannels()

        // Handle foreground messages (remote notifications)
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            const notification = convertNotification(remoteMessage)
            actions.onForegroundNotification(notification)
        })

        // Handle remote notification opened when app is in background
        const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
            remoteMessage => {
                const notification = convertNotification(remoteMessage)
                actions.onNotificationClick(notification)
                appsFlyerEvent('openedFromPush')
            },
        )

        // Handle notification tap events via Notifee (both local and remote on iOS)
        const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                const notification = convertNotifeeNotification(detail.notification)
                if (notification) {
                    actions.onNotificationClick(notification)
                    appsFlyerEvent('openedFromPush')
                }
            }
        })

        // Check for initial notification (app opened from quit state via notification)
        // Check both Firebase and Notifee for initial notifications
        const checkInitialNotifications = async () => {
            // Check Firebase initial notification (remote)
            const firebaseInitial = await messaging().getInitialNotification()
            if (firebaseInitial) {
                actions.onNotificationClick(convertNotification(firebaseInitial))
                appsFlyerEvent('openedFromPush')
                return // Don't check Notifee if Firebase had an initial notification
            }

            // Check Notifee initial notification (local)
            const notifeeInitial = await notifee.getInitialNotification()
            if (notifeeInitial) {
                const notification = convertNotifeeNotification(notifeeInitial.notification)
                if (notification) {
                    actions.onNotificationClick(notification)
                    appsFlyerEvent('openedFromPush')
                }
            }
        }

        checkInitialNotifications()

        // Register token
        actions.checkAndRegisterNewToken()

        // Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(() => {
            actions.onRegister()
        })

        return () => {
            unsubscribeOnMessage()
            unsubscribeOnNotificationOpened()
            unsubscribeNotifeeForeground()
            unsubscribeTokenRefresh()
        }
    }, [])

    return null
})
