import { platform, device } from '@mu-native/common'

const CLIENT_NAME = platform.isAndroid ? 'MS_ANDROID' : 'MS_IOS'
const OS_VERSION = device.systemVersion
const VERSION = device.appVersion
const BUILD_NUMBER = device.buildNumber
const SYSTEM_NAME = device.systemName
const DEVICE_MODEL = device.model
const USER_AGENT_HEADER_VALUE = `${CLIENT_NAME}/${VERSION}.${BUILD_NUMBER} (${DEVICE_MODEL}; ${SYSTEM_NAME} ${OS_VERSION})`
const API_VERSION_HEADER_VALUE = '1'
const PLATFORM_HEADER_VALUE = platform.isTablet ? '3' : '2'

export const headerValues = {
    userAgent: USER_AGENT_HEADER_VALUE,
    apiVersion: API_VERSION_HEADER_VALUE,
    platform: PLATFORM_HEADER_VALUE,
}
