import { platform, TThunkAction } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants'
import {
    getLearnFeatures,
    getOffScoresFeatures,
    getOneFeatures,
    getProFeatures,
    planNames,
} from '../constants/subsriptionBillingConstants.ts'
import type { TCurrentSubscription, TProductId } from '../types/marketingTypes'

import { marketingStoreChunk } from './marketingStoreChunk'

export type TDevSubscriptionPlan = 'pro' | 'offScores' | 'learn' | 'learnOffScores'

const yearInSeconds = 365 * 24 * 60 * 60

const devSubscriptionPlans: Record<
    TDevSubscriptionPlan,
    {
        productId: TProductId
        getFeatureList: () => TCurrentSubscription['featureList']
        planName: string
    }
> = {
    pro: {
        productId: marketingConstants.instantLiteSubscriptionId,
        getFeatureList: getProFeatures,
        planName: planNames.pro,
    },
    offScores: {
        productId: platform.isIos
            ? marketingConstants.offScores69SubscriptionId
            : marketingConstants.instantOffScoresLiteSubscriptionId,
        getFeatureList: getOffScoresFeatures,
        planName: planNames.offScores,
    },
    learn: {
        productId: marketingConstants.instantLearnSubscriptionId,
        getFeatureList: getLearnFeatures,
        planName: planNames.learn,
    },
    learnOffScores: {
        productId: marketingConstants.yearLearnBundleOffScoresProductId,
        getFeatureList: getOneFeatures,
        planName: planNames.learnOffScoresBundle,
    },
}

/**
 * Инженерное меню: выдаёт подписку только в сторе — без чека, бэка и IAP.
 * Заполняются те же поля, что ставит saveAllAccessRightsToStoreThunk по ответу
 * /access-rights, чтобы экраны не отличали дев-выдачу от настоящей покупки.
 * Права накапливаются: выдача Learn не снимает ранее выданный Pro+.
 */
const grantDevSubscriptionThunk: TThunkAction<{ plan: TDevSubscriptionPlan }> =
    ({ plan }) =>
    dispatch => {
        const { productId, getFeatureList, planName } = devSubscriptionPlans[plan]

        const subscriptionInfo: TCurrentSubscription = {
            autoRenew: 1,
            dateEndAccess: Math.floor(Date.now() / 1000) + yearInSeconds,
            productId,
            featureList: getFeatureList(),
            planName,
            isActive: true,
        }

        dispatch(
            marketingStoreChunk.actions.setPartialFieldsCustom({
                productId,
                isTrial: false,
                ...(plan === 'pro' && {
                    isPro: true,
                    isHadProAccess: true,
                    currentSubscriptionProductId: productId,
                    currentSubscriptionProInfo: subscriptionInfo,
                }),
                ...(plan === 'offScores' && {
                    isPro: true,
                    isOffScores: true,
                    isHadProAccess: true,
                    isHadProAccessOffScores: true,
                    currentSubscriptionOffScoresInfo: subscriptionInfo,
                }),
                ...(plan === 'learn' && {
                    isCourses: true,
                    isHadProAccessCourses: true,
                    currentSubscriptionLearnInfo: subscriptionInfo,
                }),
                // Бандл — одна покупка, поэтому один и тот же productId и одна дата
                // ложатся и в права на офф-скоры, и в права на курсы: по этому
                // совпадению бандл и опознаётся.
                ...(plan === 'learnOffScores' && {
                    isPro: true,
                    isOffScores: true,
                    isCourses: true,
                    isHadProAccess: true,
                    isHadProAccessOffScores: true,
                    isHadProAccessCourses: true,
                    currentSubscriptionOffScoresInfo: subscriptionInfo,
                    currentSubscriptionLearnInfo: subscriptionInfo,
                }),
            }),
        )
    }

/** Инженерное меню: снимает все выданные права, тоже только в сторе. */
const resetDevSubscriptionsThunk: TThunkAction = () => dispatch => {
    dispatch(
        marketingStoreChunk.actions.setPartialFieldsCustom({
            productId: '',
            isPro: false,
            isOffScores: false,
            isCourses: false,
            isLearningLite: false,
            isEbookRights: false,
            isTrial: false,
            isLifetime: false,
            currentSubscriptionProductId: '',
            currentSubscriptionProInfo: null,
            currentSubscriptionOffScoresInfo: null,
            currentSubscriptionLearnInfo: null,
            currentSubscriptionLearnLiteInfo: null,
            currentSubscriptionEbookInfo: null,
        }),
    )
}

export const devSubscriptionThunks = {
    grantDevSubscriptionThunk,
    resetDevSubscriptionsThunk,
}
