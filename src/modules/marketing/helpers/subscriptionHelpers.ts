import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'

import { marketingConstants } from '../constants/marketingConstants'
import {
    getOffScoresFeatures,
    getOneFeatures,
    getProFeatures,
    planNames,
} from '../constants/subsriptionBillingConstants.ts'
import {
    type TCurrentSubscription,
    type TPlanType,
    type TSubscription,
} from '../types/marketingTypes'

const getActiveProductId = ({
    subscriptions,
    customId,
    activePlanIndex,
}: {
    subscriptions: TSubscription[]
    customId?: string
    activePlanIndex?: number
}) => {
    if (!subscriptions?.length) return ''

    if (customId) return customId

    if (subscriptions.length === 2) {
        return subscriptions[0].productId
    }

    if (typeof activePlanIndex === 'number') return subscriptions[activePlanIndex].productId

    if (subscriptions.length === 3) {
        return subscriptions[1].productId
    }

    return subscriptions[0].productId
}

const isPriceAndroidForSpecialDevices = Number(platform.memory.toFixed(0)) >= 8
const dollars20 = 2000
const dollars30 = 3000
const dollars4 = 399
const dollars6 = 599
const dollars8 = 799
const dollars10 = 999

const getInAppIdByPrice = (
    price: number | undefined,
    isSaleScore: boolean,
    planName?: TPlanType,
) => {
    if (planName === 'ebook') {
        if (!price) return marketingConstants.inAppBook55Cost
        if (price <= dollars20) return marketingConstants.inAppBook20Cost
        if (price <= dollars30) return marketingConstants.inAppBook35Cost
        return marketingConstants.inAppBook55Cost
    }

    const androidScore59 = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore79
        : marketingConstants.inAppScore59
    const androidScore79 = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore99
        : marketingConstants.inAppScore79
    const androidScore99 = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore119
        : marketingConstants.inAppScore99
    const androidScore119 = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore139
        : marketingConstants.inAppScore119

    const androidScore59ForSalePremium = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore48
        : marketingConstants.inAppScore36
    const androidScore79ForSalePremium = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore59
        : marketingConstants.inAppScore48
    const androidScore99ForSalePremium = isPriceAndroidForSpecialDevices
        ? marketingConstants.inAppScore719
        : marketingConstants.inAppScore59

    const salePriceScoreAndroid59 = isSaleScore ? androidScore59ForSalePremium : androidScore59
    const salePriceScoreAndroid79 = isSaleScore ? androidScore79ForSalePremium : androidScore79
    const salePriceScoreAndroid99 = isSaleScore ? androidScore99ForSalePremium : androidScore99
    const salePriceScoreAndroid119 = isSaleScore
        ? marketingConstants.inAppScore719
        : androidScore119

    const iOSSaleScore79 = isSaleScore
        ? marketingConstants.inAppScore48
        : marketingConstants.inAppScore79
    const iOSSaleScore99 = isSaleScore
        ? marketingConstants.inAppScore59
        : marketingConstants.inAppScore99
    const iOSSaleScore119 = isSaleScore
        ? marketingConstants.inAppScore719
        : marketingConstants.inAppScore119

    if (!price) return platform.isIos ? iOSSaleScore79 : salePriceScoreAndroid59

    if (price <= dollars4) return platform.isIos ? iOSSaleScore79 : salePriceScoreAndroid59
    if (price <= dollars6) return platform.isIos ? iOSSaleScore99 : salePriceScoreAndroid79
    if (price <= dollars8) return platform.isIos ? iOSSaleScore119 : salePriceScoreAndroid99
    if (price <= dollars10)
        return platform.isIos ? marketingConstants.inAppScore139 : salePriceScoreAndroid119

    return platform.isIos ? iOSSaleScore79 : salePriceScoreAndroid59
}

const checkIsUpgradeMode = ({
    isPro,
    isOffScores,
    subscriptionProInfo,
    subscriptionOffScoresInfo,
}: {
    isPro: boolean
    isOffScores: boolean
    subscriptionProInfo: TCurrentSubscription | null
    subscriptionOffScoresInfo: TCurrentSubscription | null
}) =>
    (isPro &&
        !!subscriptionProInfo?.productId &&
        marketingConstants.plansForUpgrade.includes(subscriptionProInfo?.productId)) ||
    (isOffScores &&
        !!subscriptionOffScoresInfo?.productId &&
        marketingConstants.plansForAutoGradeUpgrade.includes(subscriptionOffScoresInfo?.productId))

const checkBundleSubscription = ({
    currentSubscriptionProInfo,
    currentSubscriptionOffScoresInfo,
    currentSubscriptionEbookInfo,
    currentSubscriptionLearnInfo,
    currentSubscriptionLearnLiteInfo,
}: Record<string, TCurrentSubscription | null>) => {
    if (
        currentSubscriptionOffScoresInfo?.productId === currentSubscriptionLearnInfo?.productId &&
        currentSubscriptionOffScoresInfo?.dateEndAccess ===
            currentSubscriptionLearnInfo?.dateEndAccess &&
        currentSubscriptionEbookInfo?.productId === currentSubscriptionLearnInfo?.productId
    ) {
        return [
            {
                ...currentSubscriptionOffScoresInfo,
                featureList: getOneFeatures(),
                planName: planNames.one,
            },
            currentSubscriptionLearnLiteInfo,
        ]
    }

    if (
        !!currentSubscriptionOffScoresInfo?.productId &&
        currentSubscriptionOffScoresInfo.productId === currentSubscriptionLearnInfo?.productId &&
        currentSubscriptionOffScoresInfo.dateEndAccess ===
            currentSubscriptionLearnInfo.dateEndAccess
    ) {
        return [
            {
                ...currentSubscriptionOffScoresInfo,
                featureList: getOneFeatures(),
                planName: planNames.learnOffScoresBundle,
            },
            currentSubscriptionEbookInfo,
            currentSubscriptionLearnLiteInfo,
        ]
    }

    if (
        !!currentSubscriptionOffScoresInfo?.productId &&
        currentSubscriptionOffScoresInfo.productId ===
            currentSubscriptionLearnLiteInfo?.productId &&
        currentSubscriptionOffScoresInfo.dateEndAccess ===
            currentSubscriptionLearnLiteInfo.dateEndAccess
    ) {
        return [
            {
                ...currentSubscriptionOffScoresInfo,
                featureList: getOffScoresFeatures(),
                planName: planNames.offScoresBundle,
            },
            currentSubscriptionEbookInfo,
            currentSubscriptionLearnInfo,
        ]
    }

    if (
        !!currentSubscriptionProInfo?.productId &&
        currentSubscriptionProInfo.productId === currentSubscriptionLearnLiteInfo?.productId &&
        currentSubscriptionProInfo.dateEndAccess === currentSubscriptionLearnLiteInfo?.dateEndAccess
    ) {
        return [
            {
                ...currentSubscriptionOffScoresInfo,
                featureList: getProFeatures(),
                planName: planNames.proBundle,
            },
            currentSubscriptionOffScoresInfo,
            currentSubscriptionEbookInfo,
            currentSubscriptionLearnInfo,
        ]
    }

    return [
        currentSubscriptionProInfo,
        currentSubscriptionOffScoresInfo,
        currentSubscriptionEbookInfo,
        currentSubscriptionLearnInfo,
        currentSubscriptionLearnLiteInfo,
    ]
}

const getSubscriptionBenefitsForRestore = ({
    planName = 'offScores',
    isLearnLite,
}: {
    planName: 'offScores' | 'learningLite' | 'pro' | 'learning' | 'ebook' | undefined
    isLearnLite: boolean
}) =>
    ({
        offScores: [
            translate('native.filter_screen.scores_title'),
            translate('native.marketing.export_pdf_midi_mp3_title'),
            translate('native.screen_sft.carousel.keyboard_title'),
            translate('native.screen_sft.carousel.transpose_title'),
            translate('native.marketing.personal_songbook_title'),
            translate('native.screen_sft.carousel.mixer_title'),
            translate('native.screen_sft.carousel.auto_scroll_title'),
            ...(isLearnLite ? [translate('native.marketing.editors_picks_title')] : []),
        ],
        pro: [
            translate('native.marketing.export_pdf_midi_mp3_title'),
            translate('native.screen_sft.carousel.keyboard_title'),
            translate('native.screen_sft.carousel.transpose_title'),
            translate('native.marketing.personal_songbook_title'),
            translate('native.screen_sft.carousel.mixer_title'),
            translate('native.screen_sft.carousel.auto_scroll_title'),
            ...(isLearnLite ? [translate('native.marketing.editors_picks_title')] : []),
        ],
        learning: [
            translate('native.marketing.number_courses_title', { courses: '200' }),
            translate('native.marketing.learning_title'),
        ],
        learningLite: [
            translate('native.marketing.editors_picks_title'),
            translate('native.marketing.learning_title'),
        ],
        ebook: [translate('native.marketing.access_songbook_title')],
    })[planName]

export const subscriptionHelpers = {
    getActiveProductId,
    getInAppIdByPrice,
    checkIsUpgradeMode,
    checkBundleSubscription,
    getSubscriptionBenefitsForRestore,
}
