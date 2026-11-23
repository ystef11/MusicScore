import { Dimensions } from 'react-native'

import { device, platform } from '@mu-native/common'

export const {
    systemName,
    model: deviceModel,
    id: deviceModelId,
    uniqueId: deviceId,
    appVersion,
    buildNumber: appBuild,
    systemVersion,
    bundleId: appBundle,
} = device

export const { isTablet, isIos: isIOS, isAndroid, isIPAD, isTVOS } = platform

// Small screen iOS
const smallScreenIOSDevicesModels = ['iPhone 5', 'iPhone 5s', 'iPhone 5c']
const smallScreenIOSDevicesIds = [
    'iPhone8,4', // iPhone SE (1st)
]
export const isSmallScreenIos = (): boolean => // TODO: заменить функцию константой
    smallScreenIOSDevicesModels.includes(deviceModel) ||
    smallScreenIOSDevicesIds.includes(deviceModelId)
const { width, height } = Dimensions.get('window')
export const isPhoneX = (isIOS && !isIPAD && !isTVOS && (height >= 812 || width >= 812))
export const appRelease = `${appBundle}@${appVersion}+${appBuild}`
export function uppercaseAndroidText(text: string) {
    if (!text) {
        return ''
    }

    if (isAndroid) {
        return text.toUpperCase()
    }

    return text
}
