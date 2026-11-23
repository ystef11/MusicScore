import { Event as NotifeeEvent } from '@notifee/react-native'
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging'

import { TNotification } from '../types/pushNotificationsServiceTypes'

export function convertNotification(message: FirebaseMessagingTypes.RemoteMessage): TNotification {
    const notification: TNotification = {
        ...message,
        data: message.data || {},
    }
    if (typeof message.data?.attributes === 'string') {
        try {
            notification.data.attributes = JSON.parse(message.data.attributes)
        } catch (e) {
            console.warn('@convertNotification error: ', e)
        }
    }
    return notification
}

/**
 * Converts a Notifee event/notification to our TNotification format.
 * Used for local notifications created by Notifee.
 */
export function convertNotifeeNotification(
    notifeeNotification: NotifeeEvent['detail']['notification'],
): TNotification | null {
    if (!notifeeNotification) {
        return null
    }

    const data = (notifeeNotification.data as Record<string, any>) || {}

    // Parse attributes if it's a string (same logic as remote notifications)
    if (typeof data.attributes === 'string') {
        try {
            data.attributes = JSON.parse(data.attributes)
        } catch (e) {
            console.warn('@convertNotifeeNotification error: ', e)
        }
    }

    // Create a notification object that matches TNotification structure
    // We cast to TNotification since local notifications don't have all Firebase-specific fields
    // but contain the essential data/notification payload we need
    const notification = {
        messageId: notifeeNotification.id || '',
        data,
        notification: {
            title: notifeeNotification.title,
            body: notifeeNotification.body,
        },
    } as TNotification

    return notification
}
