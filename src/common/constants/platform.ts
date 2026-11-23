import { Dimensions, PixelRatio, Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import { generalModule } from '../helpers/generalModule'

const { width, height } = Dimensions.get('window')
const isIos = Platform.OS === 'ios'
const isAndroid = Platform.OS === 'android'
const currentOs = Platform.OS
const isTablet = DeviceInfo.isTablet() || (isIos && generalModule.isiOSAppOnMac)
const isIPAD = Platform.OS === 'ios' && Platform.isPad
const isTVOS = Platform.OS === 'ios' && Platform.isTV
const deviceModel = DeviceInfo.getModel()
const deviceModelId = DeviceInfo.getDeviceId()
const deviceId = DeviceInfo.getUniqueIdSync()
const buildNumber = DeviceInfo.getBuildNumber()
const pixelRatio = PixelRatio.get()

const memory = DeviceInfo.getTotalMemorySync() / 1024 ** 3
const isLowEndDevice = memory <= 1

export const platform = {
    currentOs,
    isIos,
    isIPAD,
    isTVOS,
    isAndroid,
    isTablet,
    isChromebook: !!DeviceInfo.getModel()?.toLowerCase().includes('chromebook'),
    isPhoneX: isIos && !isTablet && (height >= 812 || width >= 812),
    isBigPhone: !isTablet && (height >= 736 || width >= 736),
    deviceModel,
    deviceModelId,
    deviceId,
    pixelRatio,
    select: Platform.select,
    DeviceInfo, // для асинхронных методов
    buildNumber,
    isLowEndDevice,
    memory,
    majorVersionIOS:
        isIos && typeof Platform.Version === 'string' ? parseInt(Platform.Version, 10) : 0,
}
