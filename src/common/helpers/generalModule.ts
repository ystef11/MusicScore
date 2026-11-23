import { NativeModules } from 'react-native'
import { VolumeManager } from 'react-native-volume-manager'

interface IGeneralModule {
    /**
     * Keeps the device screen awake or allows it to sleep
     * @param isEnable - true to keep screen awake, false to allow sleep
     */
    keepAwake: (isEnable: boolean) => void

    /**
     * Gets Google User ID (Android only)
     * @returns Promise with googleUserId
     */
    getGoogleUserId: () => Promise<{ googleUserId: string | null }>

    /**
     * Opens permission storage settings (Android only)
     */
    openPermisssionStorageSettings: () => void

    /**
     * Opens file manager (Android only)
     * @param url - URL to open
     */
    openFileManager: (url: string) => void

    /**
     * iOS-specific constant indicating if running on Mac
     */
    isiOSAppOnMac?: boolean
}

const nativeModule = NativeModules.GeneralModule as IGeneralModule

if (!nativeModule) {
    console.warn('GeneralModule native module is not available')
}

export const generalModule = {
    /**
     * Keeps the device screen awake or allows it to sleep
     * @param isEnable - true to keep screen awake, false to allow sleep
     */
    keepAwake: (isEnable: boolean): void => {
        nativeModule?.keepAwake(isEnable)
    },

    /**
     * Gets the current device volume
     * @returns Promise with volume level from 0.0 (silent) to 1.0 (maximum)
     */
    getVolume: async (): Promise<number> => {
        const result = await VolumeManager.getVolume()
        return result.volume
    },

    /**
     * Sets the device volume
     * @param volume - Volume level from 0.0 (silent) to 1.0 (maximum). Will be clamped to valid range.
     * @param showUI - Whether to show the system volume UI indicator
     */
    setVolume: (volume: number, showUI = false): void => {
        if (volume < 0 || volume > 1) {
            console.warn(`generalModule.setVolume: volume ${volume} is outside valid range [0, 1]`)
        }
        VolumeManager.setVolume(volume)
        if (showUI) {
            VolumeManager.showNativeVolumeUI({ enabled: true })
        }
    },

    /**
     * Gets Google User ID (Android only)
     * @returns Promise with googleUserId
     */
    getGoogleUserId: (): Promise<{ googleUserId: string | null }> => {
        if (!nativeModule?.getGoogleUserId) {
            return Promise.reject(new Error('getGoogleUserId is not available on this platform'))
        }
        return nativeModule.getGoogleUserId()
    },

    /**
     * Opens permission storage settings (Android only)
     */
    openPermissionStorageSettings: (): void => {
        nativeModule?.openPermisssionStorageSettings()
    },

    /**
     * Opens file manager (Android only)
     * @param url - URL to open
     */
    openFileManager: (url: string): void => {
        nativeModule?.openFileManager(url)
    },

    /**
     * iOS-specific constant indicating if running on Mac
     */
    get isiOSAppOnMac(): boolean {
        return nativeModule?.isiOSAppOnMac ?? false
    },
}
