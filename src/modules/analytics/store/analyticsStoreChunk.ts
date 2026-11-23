/* eslint-disable camelcase */
import type { ScaledSize } from 'react-native'
import { TrackingStatus } from 'react-native-tracking-transparency'

import { createExtendedStoreChunk } from '@ug/store'

import type { TRtSettings } from '../dataConverters/convertRtSettings'
import type { TEvent } from '../types/analyticsTypes'

type TAnalyticsState = {
    profile: {
        isAuthorized: boolean
        userId: number | null
        trackingId: string | null
        email: string | null
    }
    screenData: ScaledSize | null
    settings: {
        isConnected: boolean
        orientation: string | null
        connection: string | null
    }
    navigation: {
        previousScreenName: string | null
        currentScreenName: string | null
    }
    locale: string | null
    marketing: {
        isPro: boolean
        isOffScores: boolean
        isCourses: boolean
        isTrial: boolean
        isLifetime: boolean
        startMode: string | null | undefined
        launchCount: number
        isHubsEnabled: boolean
        isPremium: boolean
        paymentAccountId: number | null
        currentSubscriptionProductId: string
        subscriptionPurchaseType: string
        quizAnswers: string[]
        quizQuestions: string[]
    }
    abBundle: {
        abVariation: Record<string, string | number | boolean> | null
        appAbId: string | null
    }
    ab: {
        sessionId: string | null
        unifiedId: string | null | undefined
    }
    rt: {
        country: string
        timeDifference: number
        settings: TRtSettings
    }
    events: TEvent[]
    trackingTransparencyStatus: TrackingStatus | null
    appsFlyerUID: string | null
    advertisingId: string | null
    conversionData: Record<string, string> | null
}

export const analyticsStoreChunk = createExtendedStoreChunk<TAnalyticsState>({
    treeKey: 'modules',
    storeKey: 'analytics',
})({
    persist: ['conversionData', 'trackingTransparencyStatus'],
    initialState: {
        profile: {
            isAuthorized: false,
            userId: null,
            email: null,
            trackingId: null,
        },
        screenData: null,
        settings: {
            isConnected: false,
            orientation: null,
            connection: null,
        },
        navigation: {
            previousScreenName: null,
            currentScreenName: null,
        },
        locale: null,
        marketing: {
            isPro: false,
            isOffScores: false,
            isCourses: false,
            isTrial: false,
            isLifetime: false,
            startMode: null,
            launchCount: 0,
            isHubsEnabled: false,
            isPremium: false,
            paymentAccountId: null,
            currentSubscriptionProductId: '',
            subscriptionPurchaseType: '',
            quizAnswers: [],
            quizQuestions: [],
        },
        abBundle: {
            abVariation: null,
            appAbId: null,
        },
        ab: {
            sessionId: null,
            unifiedId: null,
        },
        rt: {
            country: 'US',
            timeDifference: 0,
            settings: {
                bufferInterval: 40,
                bufferSize: 20,
                enabled: true,
                flushTriggers: ['App start', 'App end'],
                retryCount: 5,
                retryInterval: 1000,
            },
        },
        events: [],
        trackingTransparencyStatus: null,
        appsFlyerUID: null,
        advertisingId: null,
        conversionData: null,
    },
})
