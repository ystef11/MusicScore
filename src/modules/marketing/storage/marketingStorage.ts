import { device } from '@mu-native/common'
import { createStorage } from '@muse-native/mmkv'
import * as Sentry from '../../../App/Utils/Sentry'

import { TInAppForSale, TSources } from '../types/marketingTypes'

export type TMarketingStorage = {
    autoScrollModalSettingsShown: boolean
    installHandled: boolean
    offScoresBannerShown: boolean
    offScoresFilterComponentShown: boolean
    tourInstallshown: boolean
    tabCoursesShowcased: boolean
    sourceSubscription: TSources
    scoreForSale: TInAppForSale | undefined
    isShowRestoreBanner: boolean
    isShowRestoreSplashOnce: boolean
    tabCourses: boolean
    inAppDetails: {
        price: string
        currency: string
    }
    pendingPurchase:
        | {
              productId: string
              transactionId: string
              isCheckout?: boolean
          }
        | undefined
    isInitFlowSessionExp: boolean
}

const MARKETING_STORAGE_ID = 'marketing_storage_id'

const MIGRATED_KEY = '__migratedFromInstallTimeStorage'

export const marketingStorage = createStorage<TMarketingStorage>(MARKETING_STORAGE_ID)

const migrateFromInstallTimeStorage = () => {
    const { instance } = marketingStorage

    if (instance.contains(MIGRATED_KEY)) return

    try {
        const legacyInstance = createStorage(
            `marketing${device.getFirstInstallTimeSync()}`,
        ).instance

        legacyInstance.getAllKeys().forEach(key => {
            if (instance.contains(key)) return

            const value =
                legacyInstance.getString(key) ??
                legacyInstance.getNumber(key) ??
                legacyInstance.getBoolean(key) ??
                legacyInstance.getBuffer(key)

            if (value !== undefined) instance.set(key, value)
        })

        instance.set(MIGRATED_KEY, true)
    } catch (error) {
        Sentry.captureException(error, { extra: { storageId: MARKETING_STORAGE_ID } })
    }
}

migrateFromInstallTimeStorage()
