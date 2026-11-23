import { abStorage, abStoreChunk } from '@mu-native/ab'
import { authStoreChunk } from '@mu-native/auth'
import { device, getStoreValue, platform, store } from '@mu-native/common'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { getAvailableLocale, getCurrentLocale } from '@mu-native/locale'
import { marketingStoreChunk, convertUserRights, getTimerLeft } from '@mu-native/marketing'
import { scoreStoreChunk } from '@mu-native/score'
import { searchStoreChunk } from '@mu-native/search'
import { systemStoreChunk } from '@mu-native/system'

import APP_VERSION from '../../../App/appVersion'
import formatDate from '../../../App/Utils/Date'
import { rtAnalyticsService } from '../services/rtAnalyticsService'

import { formatRights } from './formatRights.ts'
import { getExperimentParams } from './getExperimentParams.ts'

const { buildNumber } = device

const twoSymbolString = (value: number) => `${value}`.padStart(2, '0')

export function getDateParams() {
    const current = new Date()
    const date = formatDate(current, 'YYYY-MM-DD')

    const year = current.getFullYear()
    const month = twoSymbolString(current.getUTCMonth() + 1)
    const day = twoSymbolString(current.getUTCDate())
    const hours = current.getUTCHours()
    const min = twoSymbolString(current.getUTCMinutes())
    const sec = twoSymbolString(current.getUTCSeconds())

    const datetime = `${year}-${month}-${day} ${hours}:${min}:${sec}`
    const datetime_client = formatDate(current, 'YYYY-MM-DD HH:mm:ss')
    const datetime_client_offset = current.getTimezoneOffset() * 60
    const datetime_device = formatDate(current, 'YYYY-MM-DD HH:mm:ss')

    return {
        date,
        datetime,
        datetime_client,
        datetime_client_offset,
        datetime_device,
    }
}

export function getDeviceParams() {
    const platforms = platform.isTablet ? 3 : 2
    const { screenData } = device
    const orientation = getStoreValue(systemStoreChunk.props.getOrientation)
    const currentOrientation = orientation?.toLowerCase() || screenData.orientation
    return {
        locale: getCurrentLocale(),
        lang: getCurrentLocale(),
        version: +(platform.isAndroid ? buildNumber.replace(/\d{3}$/, '000') : buildNumber),
        device_id: device.uniqueId,
        app_version: device.appVersion,
        build_number: device.buildNumber,
        uniq_id: device.uniqueId,
        os_version: device.systemVersion,
        os: platform.isIos ? 'iOS' : 'Android',
        device_manufacturer: device.deviceManufacturer,
        device_model: device.model,
        source: `MS_${platform.isIos ? 'IOS' : 'ANDROID'}`,
        platform: platforms || 2,
        'device_data.parameter': [
            'font scale',
            'height',
            'orientation',
            'scale',
            'width',
            'ram',
            'storage',
            'free storage',
            'charge percentage',
            'charge action',
        ],
        'device_data.value': [
            screenData.fontScale.toString(),
            screenData.height.toFixed(2),
            currentOrientation,
            screenData.scale.toString(),
            screenData.width.toFixed(2),
            platform.memory.toFixed(2),
            (device.totalDiskCapacity / 1024 ** 3).toFixed(2),
            (device.getFreeDiskStorage() / 1024 ** 3).toFixed(2),
            __DEV__ ? '100' : ((device.getBatteryLevel() || 0) * 100).toFixed(0),
            __DEV__ ? 'true' : device.getIsBatteryCharging().toString(),
        ],
    }
}

export const getParameters = () => {
    const state = store.getState()
    const unifiedId = abStorage.get('unifiedId') as string
    const trackingId = authStoreChunk.props.getTrackingId(state)
    const { screenData } = device
    const currentScore = scoreStoreChunk.props.getCurrentScore(state)
    const { idAnalytics: scoreId } = currentScore || {}
    const { isConnected = false, type } = systemStoreChunk.props.getNetwork(state) || {}
    const userId = authStoreChunk.props.getUser(state)?.id as number
    const experiments = abStoreChunk.props.getExperiments(state)
    const userDateCreated = authStoreChunk.props.getUserProfile(state)?.dateCreated
    const courseInfo = courseBrowseStoreChunk.props.getAnalyticsOnlyVisibleCourseInfo(state)
    const browseSearchSessionId = searchStoreChunk.props.getSearchSession(state)?.id
    const timerTourLeft = getTimerLeft()
    const timeDiff = rtAnalyticsService.getTimeDiff()
    const orientation = getStoreValue(systemStoreChunk.props.getOrientation)
    const isLandscape = orientation?.toUpperCase().includes('LANDSCAPE') ?? false

    return {
        auth:
            authStoreChunk.props.getAuthMethod(state) === 'no_auth'
                ? 'none'
                : authStoreChunk.props.getAuthMethod(state),
        start_mode: marketingStoreChunk.props.getStartMode(state),
        launch: marketingStoreChunk.props.getLaunchCount(state),
        pro: marketingStoreChunk.props.getIsPro(state),
        hubs: true,
        premium_access: false,
        rights: +formatRights(marketingStoreChunk.props.getRights(state)),
        landscape: isLandscape ? 1 : 0,
        payment_account_id: marketingStoreChunk.props.getPaymentAccountId(state) || 0,
        payment_account_device_id: marketingStoreChunk.props.getPaymentAccountDeviceId(state) || 0,
        interaction_time: 0,
        play_time: 0,
        country: rtAnalyticsService.getIPCountry(),
        connection: type,
        is_offline: isConnected ? 'online' : 'offline',
        ...(scoreId ? { item: 'score' } : {}),
        ...(currentScore && scoreId ? { score_id: scoreId } : {}),
        ...(currentScore ? { score_type: currentScore.isOfficial ? 'official' : 'regular' } : {}),
        ...getDateParams(),
        ...getDeviceParams(),
        ...convertUserRights(marketingStoreChunk.props.getRights(state), currentScore, courseInfo),
        ...getExperimentParams(experiments),
        ab: experiments.reduce((acc, item) => ({ ...acc, [item.id]: item.variation }), {}),
        user_id: userId,
        unified_id: unifiedId,
        user_registered: userDateCreated || null,
        session_id: abStoreChunk.props.getSession(state).id,
        ...(trackingId ? { tracking_id: trackingId } : {}),
        ...(browseSearchSessionId ? { search_session_id: browseSearchSessionId } : {}),
        ...(timerTourLeft ? { datetime_timer: timerTourLeft } : {}),
        date: Math.trunc(Date.now() / 1000),
        datetime: Math.round((Date.now() + timeDiff) / 1000),
        datetime_client: Math.round((Date.now() + timeDiff) / 1000),
        datetime_device: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
        datetime_client_offset: new Date().getTimezoneOffset() * 60,
        build_number: device.buildNumber,
        uniq_id: device.uniqueId,
        device_id: device.uniqueId,
        os_version: device.systemVersion,
        os: platform.isIos ? 'iOS' : 'Android',
        device_manufacturer: device.deviceManufacturer,
        device_model: device.model,
        source: `MS_${platform.isIos ? 'IOS' : 'ANDROID'}`,
        platform: platform.isTablet ? 3 : 2,
        app_version: APP_VERSION,
        lang: getAvailableLocale(),
    }
}
