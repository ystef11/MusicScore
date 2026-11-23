import { createExtendedStoreChunk } from '@ug/store'

type THubsModuleState = {
    weeklyReminderEnabled: boolean
}

export const hubsStoreChunk = createExtendedStoreChunk<THubsModuleState>({
    treeKey: 'modules',
    storeKey: 'hubs',
})({
    persist: ['weeklyReminderEnabled'],
    initialState: {
        weeklyReminderEnabled: false,
    },
})
