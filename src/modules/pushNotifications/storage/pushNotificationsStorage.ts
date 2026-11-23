import { createStorage } from '@muse-native/mmkv'

type TPushNotificationsStorageStorage = {
    generatedToken: string
    sentToken: string
    notificationPermissions: boolean
}

export const pushNotificationsStorage =
    createStorage<TPushNotificationsStorageStorage>('pushNotifications')
