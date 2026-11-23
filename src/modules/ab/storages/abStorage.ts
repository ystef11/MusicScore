import { createStorage } from '@muse-native/mmkv'

export type TABStorage = {
    bundleSwitched: boolean
    unifiedId: string | null
}

export const abStorage = createStorage<TABStorage>('ab')
