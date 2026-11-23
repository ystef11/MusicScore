import { Dimensions } from 'react-native'
import DeviceInfo from 'react-native-device-info'

import { generalModule } from '../helpers/generalModule'

import { platform } from './platform'

/**
 * Largest `iPhone{major},*` major digit among **currently released** iPhones.
 * After each September keynote, set this to the new top major (see Xcode device support or e.g. https://appledb.dev).
 * Example: iPhone 16 line uses iPhone17,*; iPhone 17 line uses iPhone18,* → while both are “current two”, keep this at 18.
 * When iPhone 18 ships as iPhone19,*, bump to 19 so the window becomes majors 18–19 only.
 */
export const IPHONE_HARDWARE_MAJOR_LATEST_SHIPPED = 18

/**
 * Largest `iPad{major},*` major digit among **currently released** iPads (all lines: Pro, Air, mini, base).
 * Bump with new `iPadN,*` generations the same way as {@link IPHONE_HARDWARE_MAJOR_LATEST_SHIPPED}.
 */
export const IPAD_HARDWARE_MAJOR_LATEST_SHIPPED = 17

const IPHONE_DEVICE_ID_MAJOR_RE = /^iPhone(\d+),\d+$/i
const IPAD_DEVICE_ID_MAJOR_RE = /^iPad(\d+),\d+$/i

function parseIOSDeviceHardwareMajor(deviceId: string, pattern: RegExp): number | null {
    const match = pattern.exec(deviceId)
    return match ? parseInt(match[1], 10) : null
}

function isMajorInLastTwoShippedGenerations(major: number | null, latestMajor: number): boolean {
    if (major === null) return false
    return major >= latestMajor - 1 && major <= latestMajor
}

const iosDeviceId = DeviceInfo.getDeviceId()

const isLastTwoShippedIPhoneGenerations =
    platform.isIos &&
    !generalModule.isiOSAppOnMac &&
    !platform.isIPAD &&
    isMajorInLastTwoShippedGenerations(
        parseIOSDeviceHardwareMajor(iosDeviceId, IPHONE_DEVICE_ID_MAJOR_RE),
        IPHONE_HARDWARE_MAJOR_LATEST_SHIPPED,
    )

const isLastTwoShippedIPadGenerations =
    platform.isIos &&
    !generalModule.isiOSAppOnMac &&
    platform.isIPAD &&
    isMajorInLastTwoShippedGenerations(
        parseIOSDeviceHardwareMajor(iosDeviceId, IPAD_DEVICE_ID_MAJOR_RE),
        IPAD_HARDWARE_MAJOR_LATEST_SHIPPED,
    )

const modelDevice = platform.isIos && generalModule.isiOSAppOnMac ? 'Mac' : DeviceInfo.getModel()

const screenData = Dimensions.get('window')

function getIOSAppVersion() {
    const version = DeviceInfo.getVersion()

    const parseDecimalInt = (string: string) => parseInt(string, 10)

    if (version.length === 4) {
        // 1203 -> 1.2.3, 1234 -> 1.2.34
        const major = parseDecimalInt(version[0])
        const minor = parseDecimalInt(version[1])
        const patch = parseDecimalInt(`${version[2]}${version[3]}`)
        return `${major}.${minor}.${patch}`
    }

    if (version.length === 5) {
        // 10203 -> 1.2.3, 12304 -> 1.23.4, 10234 -> 1.2.34, 12345 -> 1.23.45
        const major = parseDecimalInt(version[0])
        const minor = parseDecimalInt(`${version[1]}${version[2]}`)
        const patch = parseDecimalInt(`${version[3]}${version[4]}`)
        return `${major}.${minor}.${patch}`
    }

    if (version.length === 6) {
        const major = parseDecimalInt(`${version[0]}${version[1]}`)
        const minor = parseDecimalInt(`${version[2]}${version[3]}`)
        const patch = parseDecimalInt(`${version[4]}${version[5]}`)
        return `${major}.${minor}.${patch}`
    }

    return version
}

export const device = {
    model: modelDevice,
    id: iosDeviceId,
    uniqueId: DeviceInfo.getUniqueIdSync(),
    systemName: DeviceInfo.getSystemName(),
    systemVersion: DeviceInfo.getSystemVersion(),
    appVersionFormatted: platform.isIos ? getIOSAppVersion() : DeviceInfo.getVersion(),
    appVersion: DeviceInfo.getVersion(),
    buildNumber: DeviceInfo.getBuildNumber(),
    bundleId: DeviceInfo.getBundleId(),
    deviceManufacturer: DeviceInfo.getManufacturerSync(),
    getToken: DeviceInfo.getDeviceToken,
    apiVersion: DeviceInfo.getApiLevelSync(),
    totalMemory: DeviceInfo.getTotalMemorySync(),
    appName: DeviceInfo.getApplicationName(),
    brand: DeviceInfo.getBrand(),
    getFirstInstallTime: DeviceInfo.getFirstInstallTime,
    totalDiskCapacity: DeviceInfo.getTotalDiskCapacitySync(),
    getFreeDiskStorage: DeviceInfo.getFreeDiskStorageSync,
    getBatteryLevel: DeviceInfo.getBatteryLevelSync,
    getIsBatteryCharging: DeviceInfo.isBatteryChargingSync,
    getFirstInstallTimeSync: DeviceInfo.getFirstInstallTimeSync,
    isSimulator: DeviceInfo.isEmulatorSync(),
    screenData: {
        ...screenData,
        orientation: screenData.width > screenData.height ? 'landscape' : 'portrait',
    },
    getIpAddressSync: DeviceInfo.getIpAddressSync,
    isLastTwoShippedIPhoneGenerations,
    isLastTwoShippedIPadGenerations,
}
