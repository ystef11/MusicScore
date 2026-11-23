import { Alert, PermissionsAndroid, Platform } from 'react-native'

import { translate } from '@mu-native/locale'
import { check, openSettings, PERMISSIONS, request } from '@mu-native/system'
import { xtz } from '@mu-native/xtz'

const presentPermissionRequiredAlert = () => {
    Alert.alert(
        translate('native.autograde.permission_error_title'),
        translate('native.autograde.microphone_permission_message'),
        [
            {
                text: translate('native.screen_omr.open_settings'),
                onPress: () => openSettings(),
            },
        ],
    )
}

const checkMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
        return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
    }
    const permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        default: PERMISSIONS.IOS.MICROPHONE,
    })
    const permissionStatus = await check(permission)
    return permissionStatus === 'granted'
}

const requestMicrophonePermissionOnce = async () => {
    if (Platform.OS === 'android') {
        const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        if (await PermissionsAndroid.check(permission)) return true
        const result = await PermissionsAndroid.request(permission)
        if (result === PermissionsAndroid.RESULTS.GRANTED) return true
        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) presentPermissionRequiredAlert()
        return false
    }
    const permission = Platform.select({
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        default: PERMISSIONS.IOS.MICROPHONE,
    })
    let permissionStatus = await check(permission)

    if (permissionStatus === 'denied') {
        permissionStatus = await request(permission)
    }

    if (permissionStatus !== 'granted') {
        presentPermissionRequiredAlert()
        return false
    }
    return true
}

// Entry and microphone button may request at the same time; keep one system dialog.
let microphoneRequest: Promise<boolean> | null = null
const requestMicrophonePermission = (): Promise<boolean> => {
    if (!microphoneRequest) {
        microphoneRequest = requestMicrophonePermissionOnce().finally(() => { microphoneRequest = null })
    }
    return microphoneRequest
}

const startCalibration = async () => {
    const canCalibrate = await requestMicrophonePermission()

    if (canCalibrate) {
        xtz.calibrateMae()
        return true
    }

    return false
}

export default {
    startCalibration,
    checkMicrophonePermission,
    requestMicrophonePermission,
}
