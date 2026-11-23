import Rate, { IConfig } from 'react-native-rate'

import { TAnalyticsParams } from '@mu-native/rt-analytics'

import reportEvent from '../Utils/Analytics'

export const RequestReviewAppSources = {
    TOUR_UPDATE: 'tour_update',
    RATE_SCORE: 'rate_score',
    HUB_SUBSCRIBE: 'hub_subscribe',
    SCORE_SCROLL: 'score_scroll',
    OPEN_SCORE: 'open_score',
} as const

export const requestReviewApp = (
    source: TAnalyticsParams['source'],
    callback: (...args: Array<any>) => any,
    fallback?: (...args: Array<any>) => any,
    options: Partial<IConfig> = {},
) => {
    reportEvent('Rate: click button', { source })
    const rateOptions = {
        AppleAppID: '835731296',
        GooglePackageName: 'com.musescore.playerlite',
        preferInApp: true,
        openAppStoreIfInAppFails: true,
        ...options,
    }
    Rate.rate(rateOptions, success => {
        if (success && callback) callback()
        if (!success && fallback) fallback()
    })
}
