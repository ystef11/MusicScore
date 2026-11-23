import { getStoreValue, platform } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants'
import { getUsdPriceByProductId } from '../constants/subsriptionBillingConstants.ts'
import { marketingStoreChunk } from '../store/marketingStoreChunk'
import { TProductId, TSources, TSubscription } from '../types/marketingTypes'

export const getSubscriptionPurchaseByProductId = (productId: TProductId | '' | undefined = '') =>
    ({
        [marketingConstants.year75OffScoresLiteSubscriptionId]: 'pro_plus',

        [marketingConstants.yearOffScoresLiteSubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.instantOffScoresLiteSubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.monthOffScoresLiteSubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.year70OffScoresLiteSubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.offScores69SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.offScores59SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.offScores49SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.offScores79SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.weekOffScoresSubscriptionId]: 'pro_plus&learn_lite',

        [marketingConstants.offScoresYearIntroductoryAnniversary]: 'pro_plus&learn_lite',
        [marketingConstants.offScoresYearIntroductory]: 'pro_plus&learn_lite',

        [marketingConstants.offScores1month19SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.offScores1week15SubscriptionId]: 'pro_plus&learn_lite',
        [marketingConstants.proPlusAutoGradeInstantSubscriptionId]: 'pro_plus&autograde',
        [marketingConstants.proPlusAutoGradeWeekSubscriptionId]: 'pro_plus&autograde',
        [marketingConstants.proPlusAutoGradeMonthSubscriptionId]: 'pro_plus&autograde',
        [marketingConstants.offScores55SubscriptionId]: 'pro_plus&autograde',

        [marketingConstants.monthLiteSubscriptionInstantId]: 'pro&learn_lite',
        [marketingConstants.yearLiteSubscriptionId]: 'pro&learn_lite',
        [marketingConstants.instantLiteSubscriptionId]: 'pro&learn_lite',
        [marketingConstants.expansiveInstantLiteSubscriptionId]: 'pro&learn_lite',
        [marketingConstants.instant75OffLiteSubscriptionId]: 'pro&learn_lite',
        [marketingConstants.pro39SubscriptionId]: 'pro&learn_lite',
        [marketingConstants.pro59SubscriptionId]: 'pro&learn_lite',
        [marketingConstants.proIntroductoryAnniversaryYear]: 'pro&learn_lite',
        [marketingConstants.proYearIntroductory]: 'pro&learn_lite',
        [marketingConstants.pro45SubscriptionId]: 'pro&learn_lite',

        [marketingConstants.yearOneSubscriptionId]: 'one',
        [marketingConstants.instantOneSubscriptionId]: 'one',
        [marketingConstants.monthOneSubscriptionId]: 'one',
        [marketingConstants.yearOneTrial199SubscriptionId]: 'one',

        [marketingConstants.monthLearnSubscriptionId]: 'learn',
        [marketingConstants.instantLearnSubscriptionId]: 'learn',
        [marketingConstants.yearLearnSubscriptionId]: 'learn',
        [marketingConstants.flashSaleSubscriptionId]: 'learn',
        [marketingConstants.instantLearn80SaleId]: 'learn',
        [marketingConstants.trialLearn80SaleId]: 'learn',
        [marketingConstants.yearLearn180]: 'learn',
        [marketingConstants.yearLearnTrial2026ProductId]: 'learn',
        [marketingConstants.yearLearn2026ProductId]: 'learn',
        [marketingConstants.monthLearn2026ProductId]: 'learn',

        [marketingConstants.instantLearnLiteSubscriptionId]: 'learn_lite',
        [marketingConstants.monthLearnLiteSubscriptionId]: 'learn_lite',
        [marketingConstants.yearTrialLearnLiteSubscriptionId]: 'learn_lite',

        [marketingConstants.yearLearnLiteExpSubscriptionId]: 'learn_lite',
        [marketingConstants.yearLearnLiteTrialExpSubscriptionId]: 'learn_lite',
        [marketingConstants.monthLearnLiteExpSubscriptionId]: 'learn_lite',

        [marketingConstants.inAppCourse]: 'piece',
        [marketingConstants.inAppScore59]: 'piece',
        [marketingConstants.inAppScore39]: 'piece',
        [marketingConstants.inAppScore79]: 'piece',
        [marketingConstants.inAppScore99]: 'piece',
        [marketingConstants.inAppScore36]: 'piece',
        [marketingConstants.inAppScore719]: 'piece',
        [marketingConstants.inAppScore839]: 'piece',
        [marketingConstants.inAppScore48]: 'piece',
        [marketingConstants.inAppScore119]: 'piece',
        [marketingConstants.inAppScore139]: 'piece',
        [marketingConstants.inAppBook55Cost]: 'piece',
        [marketingConstants.inAppBook35Cost]: 'piece',
        [marketingConstants.inAppBook20Cost]: 'piece',

        [marketingConstants.ebookYearInstantSubscriptionId]: 'ebook',
        [marketingConstants.ebookWeekSubscriptionId]: 'ebook',
        [marketingConstants.ebookYearTrialSubscriptionId]: 'ebook',

        [marketingConstants.premiumYearSubscriptionId]: 'premium',
        [marketingConstants.premiumQuarterlySubscriptionId]: 'premium',

        [marketingConstants.yearLearnBundleOffScoresTrialProductId]: 'learn&pro_plus',
        [marketingConstants.yearLearnBundleOffScoresProductId]: 'learn&pro_plus',
        [marketingConstants.monthLearnBundleOffScoresProductId]: 'learn&pro_plus',
        [marketingConstants.yearLearnBundleOffScores179TrialProductId]: 'learn&pro_plus',
        [marketingConstants.yearLearnBundleOffScores179IntroProductId]: 'learn&pro_plus',
        [marketingConstants.monthLearnBundleOffScores1999ProductId]: 'learn&pro_plus',
        [marketingConstants.monthLearnBundleOffScores2999ProductId]: 'learn&pro_plus',
        [marketingConstants.quarterLearnBundleOffScores59ProductId]: 'learn&pro_plus',
    })[productId] || 'pro&learn_lite'

const rtParamsLandings = {
    funnel_type: 'intentional',
    have_quiz: 'no',
}

type TGetRtParams = {
    source: TSources
    isUpgradeMode?: boolean
    isPieceSale?: boolean
    productId?: TProductId
    isLearnPlan?: boolean
}
export const getRtParamsBySource = ({
    source,
    isUpgradeMode = false,
    isPieceSale = false,
    productId,
    isLearnPlan = false,
}: TGetRtParams) =>
    ({
        [marketingConstants.sources.tourInstall]: {
            subscription_type: isLearnPlan ? ['learn'] : ['pro', 'pro_plus'],
            funnel_type: 'unintentional', // unintentional только в туре
            landing_name: 'Tour install',
            funnel_source: marketingConstants.sources.tourInstall,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.tourInstallAndroidGift]: {
            subscription_type: isLearnPlan ? ['learn'] : ['pro', 'pro_plus'],
            funnel_type: 'unintentional', // unintentional только в туре
            landing_name: 'Tour install',
            funnel_source: marketingConstants.sources.tourInstallAndroidGift,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.tourInstallLastChance]: {
            subscription_type: ['pro_plus'],
            funnel_type: 'unintentional', // unintentional только в туре
            landing_name: 'Last chance',
            funnel_source: marketingConstants.sources.tourInstallLastChance,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.splashFloatingButton]: {
            subscription_type: ['pro', 'pro_plus'],
            landing_name: 'Floating Button landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashReturnOfferCourses]: {
            subscription_type: ['one', 'learn'],
            landing_name: 'Return offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashFloatingButtonCourses]: {
            subscription_type: ['learn'],
            landing_name: 'Floating Button landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashFloatingButtonUpgradeBundle]: {
            subscription_type: ['learn&pro_plus'],
            landing_name: 'Floating Button landing upgrade',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashReturnOfferUpgradeBundle]: {
            subscription_type: ['learn&pro_plus'],
            landing_name: 'Return offer upgrade',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.offScoresLanding]: {
            subscription_type: ['pro_plus', ...(isPieceSale ? ['piece'] : [])],
            landing_name: isUpgradeMode
                ? 'Start Free Trial landing upgrade'
                : 'Start Free Trial landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashReturnOffer]: {
            subscription_type: ['pro', 'pro_plus'],
            landing_name: 'Return offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.songbook]: {
            subscription_type: ['pro'],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.keyboard]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.metronome]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.transpose]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.addSongbook]: {
            subscription_type: ['pro'],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.tourUpdate]: {
            subscription_type: ['pro_plus&autograde'],
            landing_name: 'Tour update',
            funnel_source: marketingConstants.sources.tourUpdate,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.autoScroll]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pdf]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pdf_trialRestricted]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.hqSound]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.midi]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.mixer]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.local]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.mp3]: {
            subscription_type: ['pro', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.profileSale]: {
            subscription_type: ['pro_plus'],
            landing_name: isUpgradeMode ? 'Special offer upgrade' : 'Special offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashAnniversaryOffer]: {
            subscription_type: ['pro'],
            landing_name: 'Special offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.coursesLanding]: {
            subscription_type: ['learn'],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashFlashSale]: {
            subscription_type: ['learn'],
            landing_name: 'Special offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashFlashSaleOffScores]: {
            subscription_type: ['pro_plus'],
            landing_name: 'Special offer',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.goPro]: {
            subscription_type: ['pro', 'pro_plus'],
            landing_name: 'Start Free Trial landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.coursesCatalog]: {
            subscription_type: ['learn'],
            landing_name: 'Start Free Trial landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.coursesVideoPopup]: {
            subscription_type: ['learn'],
            landing_name: 'Start Free Trial landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.coursesBottomCTA]: {
            subscription_type: ['learn'],
            landing_name: 'Start Free Trial landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pieceSale]: {
            funnel_source: marketingConstants.sources.pieceSale,
            subscription_type: ['pro', 'piece'],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.courseAddToFavorites]: {
            subscription_type: ['learn', 'piece'],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.courseCatalogAddToFavorites]: {
            subscription_type: ['learn', 'piece'],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.restore]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.silentRestore]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.androidRestore]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.autoRenewable]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.quizUpdateHub]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.quizUpdateProfile]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.coursesRight]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.catalogBannerEditorPicks]: {
            subscription_type: [getSubscriptionPurchaseByProductId(productId)],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.allPage]: {
            subscription_type: [
                'pro_plus&learn_lite',
                'pro_plus',
                'pro',
                'learn_lite',
                'learn',
                'one',
            ],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pieceSaleOrdersBalance]: {
            subscription_type: ['piece'],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pieceSaleProfileBalance]: {
            subscription_type: ['piece'],
            ...rtParamsLandings,
        },
        [marketingConstants.sources.ebooks]: {
            subscription_type: ['ebook', ...(isPieceSale ? ['piece'] : [])],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.ebooksPieceSale]: {
            subscription_type: ['ebook', 'piece'],
            landing_name: 'Feature landing',
            ...rtParamsLandings,
        },
        [marketingConstants.sources.pdfPieceSale]: {
            subscription_type: ['piece'],
            landing_name: 'Pdf Sale Landing',
            source: marketingConstants.sources.pdfPieceSale,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.splashExpired]: {
            subscription_type: ['pro', 'pro_plus'],
            landing_name: 'splash_expired',
            source: marketingConstants.sources.splashExpired,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.appCellCourses]: {
            subscription_type: ['learn'],
            landing_name: 'App Cell Courses landing',
            funnel_type: 'unintentional', // unintentional только в туре
            funnel_source: marketingConstants.sources.appCellCourses,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.appCellPremium]: {
            subscription_type: ['premium'],
            landing_name: 'App Cell Premium landing',
            funnel_type: 'unintentional', // unintentional только в туре
            funnel_source: marketingConstants.sources.appCellPremium,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.appCellOffScores]: {
            subscription_type: ['pro_plus&learn_lite'],
            landing_name: 'App Cell OffScores landing',
            funnel_type: 'unintentional', // unintentional только в туре
            funnel_source: marketingConstants.sources.appCellOffScores,
            have_quiz: 'yes',
        },
        [marketingConstants.sources.autoGrade]: {
            subscription_type: ['pro_plus&autograde'],
            landing_name: 'Autograde landing',
            funnel_source: marketingConstants.sources.autoGrade,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.appleWatchMetronome]: {
            subscription_type: ['pro_plus'],
            landing_name: 'Feature landing',
            funnel_source: marketingConstants.sources.appleWatchMetronome,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.premium]: {
            subscription_type: ['premium'],
            landing_name: 'premium_modal',
            funnel_source: marketingConstants.sources.premium,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.trialToInstant]: {
            subscription_type: platform.isIos ? ['learn'] : ['pro', 'pro_plus'],
            landing_name: 'trial_instant_modal',
            funnel_source: marketingConstants.sources.trialToInstant,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.backgroundPlayback]: {
            subscription_type: ['pro_plus'],
            landing_name: 'Feature landing',
            funnel_source: marketingConstants.sources.backgroundPlayback,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.scan]: {
            subscription_type: ['pro_plus'],
            landing_name: 'long landing',
            funnel_source: marketingConstants.sources.scan,
            ...rtParamsLandings,
        },
        [marketingConstants.sources.firstSession]: {
            subscription_type: ['pro_plus'],
            landing_name: 'long landing',
            funnel_source: marketingConstants.sources.firstSession,
            ...rtParamsLandings,
        },
    })[source] || ''

const getRtBillingParams = ({ productId, trialStatus, usdPrice, duration }: TSubscription) => ({
    'params.key': ['product', 'trial', 'price_base_usd', 'period'],
    'params.value': [0, 0, 0, 0],
    'params.str_value': [
        getSubscriptionPurchaseByProductId(productId),
        trialStatus || '0 days',
        usdPrice || getUsdPriceByProductId({ productId }) || '',
        duration || '',
    ],
})

/** In-app products have no USD price table, so their price is sent as the store shows it. */
const getInAppRtPriceParams = (productId: TProductId) => {
    const product = getStoreValue(marketingStoreChunk.props.getProducts).find(
        item => item.productId === productId,
    )
    if (!product) return {}

    return {
        'params.key': ['price', 'currency'],
        'params.value': [0, 0],
        'params.str_value': [product.displayPrice || '', product.currency || ''],
    }
}

const getCheckoutPlanRtParams = (productId: TProductId | '' | undefined) => {
    if (!productId) return {}

    const subscription = getStoreValue(marketingStoreChunk.props.getSubscriptions).find(
        ({ id }) => id === productId,
    )

    return {
        productId,
        ...(subscription ? getRtBillingParams(subscription) : getInAppRtPriceParams(productId)),
    }
}

const getPlanKindRt = ({ duration = '', isTrialAvailable }: TSubscription) => {
    if (duration.includes('week')) return 'week'

    const months = parseInt(duration, 10)
    if (months === 1) return 'month'
    if (months === 3) return 'quarter'

    return isTrialAvailable ? 'trial' : 'instant'
}

/**
 * Appends the kinds of plans shown on the paywall (trial, instant, month, week) to subscription_type.
 * The upgrade bundle replaces the base type with learn&pro_plus, like getSubscriptionType on the landings.
 */
const getPaywallSubscriptionType = (
    subscriptionType: string[] | undefined,
    plans: (TSubscription | undefined)[] | undefined,
    isUpgradeBundle?: boolean,
) => {
    const planKinds = (plans || [])
        .filter(
            (plan): plan is TSubscription =>
                !!plan?.productId && !marketingConstants.listInApps.includes(plan.productId),
        )
        .map(getPlanKindRt)

    const baseType = isUpgradeBundle ? ['learn&pro_plus'] : subscriptionType

    return [...(baseType || []), ...planKinds]
}

const withPaywallPlansRt = <T extends { subscription_type?: string[] }>(
    params: T | '',
    plans: (TSubscription | undefined)[] | undefined,
) => ({
    ...(params || ({} as T)),
    subscription_type: getPaywallSubscriptionType(params ? params.subscription_type : [], plans),
})

/** The switcher is "on" when it shows Pro+ plans and "off" when it shows Pro plans. */
const getProSwitcherRtParams = (isProPlus: boolean) => ({
    value: isProPlus ? 'on' : 'off',
    subscription_type: [isProPlus ? 'pro_plus' : 'pro'],
})

export const subscriptionsRtHelpers = {
    getSubscriptionPurchaseByProductId,
    getRtParamsBySource,
    getRtBillingParams,
    getCheckoutPlanRtParams,
    getPaywallSubscriptionType,
    withPaywallPlansRt,
    getProSwitcherRtParams,
}
