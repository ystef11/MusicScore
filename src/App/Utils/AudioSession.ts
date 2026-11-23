import { NativeModules, Platform } from 'react-native'

export type AudioSessionCategory =
    | 'playback'
    | 'record'
    | 'playAndRecord'
    | 'ambient'
    | 'soloAmbient'
    | 'multiRoute'

interface AudioSessionModule {
    setCategory(category: AudioSessionCategory): Promise<string>
}

const { AudioSession: AudioSessionNativeModule } = NativeModules

const AudioSessionTyped = AudioSessionNativeModule as AudioSessionModule | undefined

const setCategory = async (category: AudioSessionCategory) => {
    if (Platform.OS !== 'ios') {
        console.log('AudioSession module is only available on iOS.')
        return
    }

    if (!AudioSessionTyped || typeof AudioSessionTyped.setCategory !== 'function') {
        throw new Error('AudioSession native module is not linked properly.')
    }

    try {
        await AudioSessionTyped.setCategory(category)
    } catch (error: any) {
        throw new Error(error?.message || 'Failed to set audio session category.')
    }
}

export const AudioSession = {
    setCategory,
}
