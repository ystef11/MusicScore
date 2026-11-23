import type { TPersistentStorage } from '@muse-native/analytics/types/AnalyticsTypes.ts'
import { createStorage } from '@muse-native/mmkv'

const rtStorage = createStorage<Record<string, string>>()

export const createRtStorage = (key: string): TPersistentStorage => {
    return {
        // LogStorage parses this itself and does it outside any catch, so hand it
        // back only what a string can be — anything else means a broken record.
        get: async () => {
            const value = rtStorage.get(key)

            return typeof value === 'string' ? value : null
        },
        set: (value: string) => rtStorage.set(key, value),
        clear: () => rtStorage.clear(),
    }
}
