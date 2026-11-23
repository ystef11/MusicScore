import ReactNativeHapticFeedback from 'react-native-haptic-feedback'

export type HapticTypes =
    | 'soft'
    | 'selection'
    | 'impactLight'
    | 'notificationSuccess'
    | 'notificationError'

export function haptic(type: HapticTypes = 'impactLight') {
    ReactNativeHapticFeedback.trigger(type, {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: false,
    })
}
