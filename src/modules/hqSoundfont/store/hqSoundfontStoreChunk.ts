import { Platform } from 'react-native'

import { createExtendedStoreChunk } from '@ug/store'

type THqSoundfontModuleState = {
    isEnabled: boolean
}

export const hqSoundfontStoreChunk = createExtendedStoreChunk<THqSoundfontModuleState>({
    treeKey: 'modules',
    // Earlier Android builds saved a switch that did not affect playback.
    storeKey: Platform.OS === 'android' ? 'scorePlaybackQuality' : 'hqSoundfont',
})({
    persist: ['isEnabled'],
    initialState: {
        isEnabled: Platform.OS === 'android',
    },
})
