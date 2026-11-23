import { createExtendedStoreChunk } from '@ug/store'

type TProfileState = {
    // Profile state type
    dailyReminderTime: Date | null
    dailyReminderEnabled: boolean
    screenShouldStayAwake: boolean
}

export const profileStoreChunk = createExtendedStoreChunk<TProfileState>({
    treeKey: 'modules',
    storeKey: 'profile',
})({
    persist: ['dailyReminderTime', 'dailyReminderEnabled'],
    initialState: {
        dailyReminderTime: null,
        dailyReminderEnabled: false,
        screenShouldStayAwake: true,
    },
    actions: {
        toggleScreenShouldStayAwake: (_, state) => {
            return {
                screenShouldStayAwake: !state.screenShouldStayAwake,
            }
        },
    },
})
