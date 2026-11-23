import { createExtendedStoreChunk } from '@ug/store'

type TPushNotificationsState = {
    pushToken: string | null
    permissionGranted: boolean | null
}

export const pushNotificationsStoreChunk = createExtendedStoreChunk<TPushNotificationsState>({
    treeKey: 'modules',
    storeKey: 'pushNotifications',
})({
    persist: ['pushToken', 'permissionGranted'],
    initialState: {
        pushToken: null,
        permissionGranted: null,
    },
})
