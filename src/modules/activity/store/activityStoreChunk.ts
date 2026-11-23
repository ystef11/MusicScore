import { createExtendedStoreChunk } from '@ug/store'

import { type TActivityModuleState, TActivitySetting, TFeedItem } from '../types/activityAppTypes'

const defaultSettings = [
    { verb: 31, value: true },
    { verb: 22, value: true },
    { verb: 20, value: true },
    { verb: 21, value: true },
    { verb: 26, value: true },
    { verb: 30, value: true },
    { verb: 51, value: true },
    { verb: 57, value: true },
    { verb: 58, value: true },
]

export const activityModuleStoreChunk = createExtendedStoreChunk<TActivityModuleState>({
    storeKey: 'activity',
    treeKey: 'modules',
})({
    persist: ['lastViewedAt'],
    initialState: {
        userActivity: null,
        settings: defaultSettings,
        hasMorePages: false,
        notificationCount: 0,
        lastViewedAt: null,
        isLoading: true,
    },
    actions: {
        toggleSetting: (verb: TActivitySetting['verb'], state) => {
            const settings = state.settings.map(item => {
                if (item.verb === verb) {
                    return {
                        ...item,
                        value: !item.value,
                    }
                }
                return item
            })
            return { settings }
        },
        concatActivity: (userActivity: TFeedItem[], state) => {
            if (state.userActivity) {
                return {
                    userActivity: [...state.userActivity, ...userActivity],
                }
            }
            return { userActivity }
        },
        clearActivity: () => {
            return { userActivity: null }
        },
    },
})
