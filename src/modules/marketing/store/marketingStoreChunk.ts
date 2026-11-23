import { abStoreChunk } from '@mu-native/ab'
import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { marketingConstants } from '../constants/marketingConstants'
import type { TMarketingState } from '../dataConverters/convertMarketingData'
import { TSetPartialFieldsMarketing } from '../dataConverters/convertMarketingData'
import { subscriptionFixUrl } from '../helpers/subscriptionFixUrl'
import { subscriptionHelpers } from '../helpers/subscriptionHelpers.ts'
import {
    type TCurrentSubscription,
    type TSubscription,
    TSubscriptionForRestore,
} from '../types/marketingTypes.ts'

export const marketingStoreChunk = createExtendedStoreChunk<TMarketingState>({
    storeKey: 'marketing',
    treeKey: 'modules',
})({
    persist: [
        'source',
        'isNeedToShowFloatingButton',
        'anniversarySplashInfo',
        'isNeedShowAnniversarySplash',
        'shownCountReturnSplash',
        'launchDateReturnSplash',
        'shownDateReturnSplash',
        'tourUpdateId',
        'buildNumber',
        'isShowSubscriptionRecoverBanner',
        'timerSaleDate',
        'timerSaleStart',
        'flashSaleCount',
        'timerSaleLashShown',
        'isGameClosed',
        'gameStepScratch',
        'lastShownDaysAnniversarySplash',
        'scoreDiscountSplashShownDate',
        'launchCount',
        'uniqueLaunchDays',
        'lastLaunchDate',
        'products',
        'paymentAccountId',
        'paymentAccountDeviceId',
        'dataPaymentAccountCreated',
        'inAppForSale',
        'isHadProAccess',
        'isHadProAccessOffScores',
        'isHadProAccessCourses',
        'rights',
        'currentSubscriptionProInfo',
        'currentSubscriptionOffScoresInfo',
        'currentSubscriptionLearnInfo',
        'currentSubscriptionEbookInfo',
        'subscriptionsForRestore',
        'isShowRestoreBanner',
        'appAccountToken',
        'isPro',
        'isOffScores',
        'isCourses',
        'isEbookRights',
        'isPremiumRights',
        'isAutoGradeRights',
        'timerSaleDateOffScores',
        'timerSaleLashShownOffScores',
        'timerSaleStartOffScores',
        'flashSaleCountOffScores',
    ],
    initialState: {
        rights: [],
        paymentAccountId: 0,
        paymentAccountDeviceId: 0,
        dataPaymentAccountCreated: null,
        featureText: '',
        services: [],
        buildNumber: null,
        startMode: null,
        isNeedToShowFloatingButton: true,
        isShowSubscriptionRecoverBanner: platform.isAndroid,
        timerSaleDate: 0,
        timerSaleStart: 0,
        flashSaleCount: 0,
        timerSaleLashShown: 0,
        source: 'Auto-renewable',
        productId: '',
        checkoutProductId: '',
        launchCount: 0,
        uniqueLaunchDays: 0,
        lastLaunchDate: 0,
        isRestoreProcessing: false,
        tourUpdateId: null,
        closeCallback: null,
        isPaymentInProgress: false,
        isAccessRightsLoaded: false,
        isHandleProductProgress: false,
        didUserPlayClassic: false,
        isPurchasedInTour: false,
        purchasedScoreIds: [],
        isAutoScrollSettingsModalVisible: false,
        isPro: false,
        isLifetime: false,
        isOffScores: false,
        isCourses: false,
        isLearningLite: false,
        isEbookRights: false,
        isAutoGradeRights: false,
        isPremiumRights: false,
        isLearnLiteSubscriptionActive: false,
        isTrialPro: false,
        isTrial: false,
        isHadProAccess: false,
        isHadProAccessOffScores: false,
        isHadProAccessCourses: false,
        isHadProAccessEbook: false,
        currentSubscriptionProductId: '',
        currentSubscriptionProInfo: null,
        currentSubscriptionOffScoresInfo: null,
        currentSubscriptionLearnInfo: null,
        currentSubscriptionEbookInfo: null,
        currentSubscriptionLearnLiteInfo: null,
        isSubscriptionPaymentPending: false,
        accountHoldExpiringDate: 0,
        gameStepScratch: marketingConstants.gameSteps.startGame,
        isGameClosed: false,
        accesses: null,
        shownCountReturnSplash: 0,
        shownDateReturnSplash: 0,
        launchCountReturnSplash: 0,
        launchDateReturnSplash: 0,
        lastShownDaysAnniversarySplash: 0,
        scoreDiscountSplashShownDate: 0,
        anniversarySplashInfo: {
            firstTouchDate: null,
            firstTouchDateSource: '',
            daysFromFirstTouch: null,
        },
        isNeedShowAnniversarySplash: false,
        purchaseTokenAndroidInfo: null,
        subscriptions: [],
        inAppForSale: null,
        products: [],
        timerTour: null,
        contentFields: {
            coursesCount: 277,
            offScoresCount: 44751,
            scoresNew: 199329,
            scoresAll: '3.4', // millions
            ebookAll: 2395,
        },
        creditBalance: 0,
        courseBalance: 0,
        ebookBalance: 0,
        subscriptionsForRestore: [],
        isShowRestoreBanner: false,
        isStudentAge: false,
        appAccountToken: '',
        isActivePremiumSwitcher: true,
        introductoryOfferData: {
            isPro: false,
            isLearn: false,
            isEbook: false,
            isOne: false,
        },
        referralData: null,
        isUsaStore: false,
        timerSaleDateOffScores: 0,
        timerSaleStartOffScores: 0,
        flashSaleCountOffScores: 0,
        timerSaleLashShownOffScores: 0,
    },
    actions: {
        setReferralScoreCustom: (_, state) => ({
            referralData: {
                ...state.referralData,
                score: null,
            },
        }),
        setFlashSaleCountCustom: (_, state) => {
            if (!state?.flashSaleCount) {
                return { flashSaleCount: 1 }
            }
            const flashSaleCount = state.flashSaleCount >= 3 ? 3 : state.flashSaleCount + 1
            return { flashSaleCount }
        },
        setFlashSaleCountOffScoresCustom: (_, state) => {
            if (!state?.flashSaleCountOffScores) {
                return { flashSaleCountOffScores: 1 }
            }
            const flashSaleCountOffScores =
                state.flashSaleCountOffScores >= 3 ? 3 : state.flashSaleCountOffScores + 1
            return { flashSaleCountOffScores }
        },
        setReturnSplashCountShowCustom: (_, state) => {
            const shownCountReturnSplash = state.shownCountReturnSplash + 1
            const launchDateReturnSplash = new Date().getTime()
            const shownDateReturnSplash = launchDateReturnSplash

            return {
                shownCountReturnSplash,
                launchDateReturnSplash,
                shownDateReturnSplash,
            }
        },
        setSplashCountLaunch: (_, state) => ({
            shownCountReturnSplash: state.shownCountReturnSplash + 1,
        }),
        setSplashUpdateLaunchDate: () => ({
            launchDateReturnSplash: new Date().getTime(),
        }),
        setCustomLaunchInfo: (_, state) => {
            const uniqueLaunchDaysIncrease = Date.now() - (state.lastLaunchDate || 0) > 0 ? 1 : 0
            const uniqueLaunchDays = state.uniqueLaunchDays
                ? state.uniqueLaunchDays + uniqueLaunchDaysIncrease
                : 1

            return {
                launchCount: state.launchCount + 1,
                lastLaunchDate: Date.now(),
                uniqueLaunchDays,
            }
        },
        setPartialFieldsCustom: (marketingPartialsFields: TSetPartialFieldsMarketing) => ({
            ...marketingPartialsFields,
        }),
        addSubscriptionForRestoreCustom: (
            { subscriptionForRestore }: { subscriptionForRestore: TSubscriptionForRestore },
            state,
        ) => ({
            subscriptionsForRestore: state.subscriptionsForRestore.find(
                subscription => subscription.productId === subscriptionForRestore.productId,
            )
                ? state.subscriptionsForRestore
                : [...state.subscriptionsForRestore, subscriptionForRestore],
            isShowRestoreBanner: true,
        }),
        updateSubscriptionForRestoreCustom: (
            subscriptionForRestore: TSubscriptionForRestore,
            state,
        ) => ({
            subscriptionsForRestore: state.subscriptionsForRestore.map(subscription =>
                subscription.productId === subscriptionForRestore.productId
                    ? { ...subscription, sourceRestore: subscriptionForRestore.sourceRestore }
                    : subscription,
            ),
        }),
        removeSubscriptionForRestoreCustom: (
            { subscriptionForRestore }: { subscriptionForRestore: TSubscriptionForRestore },
            state,
        ) => {
            const subscriptionsForRestore = state.subscriptionsForRestore.filter(
                subs => subs.productId !== subscriptionForRestore.productId,
            )

            return {
                subscriptionsForRestore,
                isShowRestoreBanner: subscriptionsForRestore.length !== 0,
            }
        },
        onChangePremiumSwitcher: (_: undefined, state) => ({
            isActivePremiumSwitcher: !state.isActivePremiumSwitcher,
        }),
        setPurchasedScoreIdsCustom: (scoreId: string | number, state) => ({
            purchasedScoreIds: state.purchasedScoreIds.includes(String(scoreId))
                ? state.purchasedScoreIds
                : [...state.purchasedScoreIds, String(scoreId)],
        }),
        setTimerSaleLashShownOffScoresCustom: (_: undefined, state) => ({
            timerSaleLashShownOffScores: state.timerSaleLashShownOffScores
                ? state.timerSaleLashShownOffScores
                : Date.now(),
        }),
        setResetMarketingStore: () => ({
            rights: [],
            subscriptionsForRestore: [],
            currentSubscriptionLearnInfo: null,
            currentSubscriptionLearnLiteInfo: null,
            currentSubscriptionProInfo: null,
            currentSubscriptionOffScoresInfo: null,
            currentSubscriptionEbookInfo: null,
            currentSubscriptionProductId: '',
            isPro: false,
            isLifetime: false,
            isOffScores: false,
            isCourses: false,
            isLearningLite: false,
            isEbookRights: false,
            isAutoGradeRights: false,
            isTrial: false,
            isLearnLiteSubscriptionActive: false,
            tourUpdateId: marketingConstants.tourId,
            creditBalance: 0,
            courseBalance: 0,
            ebookBalance: 0,
        }),
    },
})

export const getIsReturnSplashTimePassed = createSelector(
    marketingStoreChunk.props.getLaunchDateReturnSplash,
    returnSplashLaunchDate => {
        if (!returnSplashLaunchDate) return false

        const currentDate = new Date().getTime()

        // раз в неделю
        const timeToShow = 1000 * 60 * 60 * 24 * 7

        return currentDate - returnSplashLaunchDate >= timeToShow
    },
)

export const getIsNeedShowReturnSplash = createSelector(
    marketingStoreChunk.props.getIsPro,
    getIsReturnSplashTimePassed,
    (isPro, isReturnSplashTimePassed) => !isPro && isReturnSplashTimePassed,
)

export const getIsNeedShowSubscriptionRecoverBanner = createSelector(
    marketingStoreChunk.props.getIsShowSubscriptionRecoverBanner,
    marketingStoreChunk.props.getIsLifetime,
    marketingStoreChunk.props.getIsSubscriptionPaymentPending,
    (isNeedShowSubscriptionRecoverBanner, isLifetime, isSubscriptionPending) => {
        if (!isNeedShowSubscriptionRecoverBanner) return false
        if (isLifetime) return false

        return isSubscriptionPending
    },
)

export const getSubscriptionRecoverBannerData = createSelector(
    getIsNeedShowSubscriptionRecoverBanner,
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getCurrentSubscriptionProductId,
    (isNeedShowSubscriptionRecoverBanner, isPro, currentSubscriptionProductId) => {
        if (!isNeedShowSubscriptionRecoverBanner) return null

        const isGracePeriod = isPro
        const text = isGracePeriod
            ? translate('native.marketing.payment_declined_grace_period')
            : translate('native.marketing.payment_declined_access_lost')
        const buttonText = translate('native.marketing.fix_now').toUpperCase()
        const fixUrl = subscriptionFixUrl({
            isGracePeriod,
            productId: currentSubscriptionProductId,
            isIos: platform.isIos,
        })
        return {
            text,
            buttonText,
            fixUrl,
            isGracePeriod,
        }
    },
)

const noOfferSubscriptions: TSubscription[] = []

// Plans are offered only once fresh rights have arrived, otherwise persisted rights may be stale
export const getOfferSubscriptions = createSelector(
    marketingStoreChunk.props.getSubscriptions,
    marketingStoreChunk.props.getIsAccessRightsLoaded,
    (subscriptions, isAccessRightsLoaded) =>
        isAccessRightsLoaded ? subscriptions : noOfferSubscriptions,
)

export const getSaleSubscriptions = createSelector(getOfferSubscriptions, subscriptions => {
    if (!subscriptions?.length) return []

    const proLiteIntroductory = subscriptions.find(
        subscription => subscription.productId === marketingConstants.proYearIntroductory,
    )

    const monthLite = subscriptions?.find(
        subscription =>
            subscription.productId === marketingConstants.monthLiteSubscriptionInstantId,
    )
    const weekPro = subscriptions?.find(
        subscription => subscription.productId === marketingConstants.weekProSubscriptionId,
    )

    let secondSub = monthLite
    if (platform.isIos) secondSub = weekPro

    if (!secondSub || !proLiteIntroductory) return []
    return [proLiteIntroductory, secondSub]
})

export const getSaleSubscriptionsOffScores = createSelector(
    getOfferSubscriptions,
    subscriptions => {
        if (!subscriptions?.length) return []

        const instantOffScoresIntroductory = subscriptions.find(
            subscription => subscription.productId === marketingConstants.offScoresYearIntroductory,
        )

        const monthLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthOffScoresLiteSubscriptionId,
        )
        const weekOffScores = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
        )
        let secondSub = monthLite

        if (platform.isIos) secondSub = weekOffScores

        if (!secondSub || !instantOffScoresIntroductory) return []

        return [instantOffScoresIntroductory, secondSub]
    },
)

export const getUpgradeBundleCurrentProductId = createSelector(
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getCurrentSubscriptionProInfo,
    marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
    (isOffScores, subscriptionProInfo, subscriptionOffScoresInfo) =>
        (isOffScores ? subscriptionOffScoresInfo?.productId : subscriptionProInfo?.productId) || '',
)

export const getUpgradeBundleSubscriptions = createSelector(
    getOfferSubscriptions,
    getUpgradeBundleCurrentProductId,
    (subscriptions, currentProductId) => {
        if (!subscriptions?.length) return []

        const bundleYear = subscriptions.find(
            subscription =>
                subscription.productId ===
                marketingConstants.yearLearnBundleOffScores179IntroProductId,
        )
        const bundleMonth = subscriptions.find(
            subscription =>
                subscription.productId ===
                marketingConstants.monthLearnBundleOffScores2999ProductId,
        )

        if (!bundleYear || !bundleMonth) return []

        if (!marketingConstants.listIdsMonthlyForUpgradeToBundle.has(currentProductId)) {
            return [bundleYear]
        }

        return [bundleYear, bundleMonth]
    },
)

export const getIsUpgradeBundleAudience = createSelector(
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getIsLifetime,
    getUpgradeBundleCurrentProductId,
    getUpgradeBundleSubscriptions,
    (isPro, isCourses, isLifetime, currentProductId, upgradeBundleSubscriptions) =>
        isPro &&
        !isCourses &&
        !isLifetime &&
        marketingConstants.listIdsForUpgradeToBundleLearnProPlus.has(currentProductId) &&
        !!upgradeBundleSubscriptions.length,
)

export const getAllSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccess,
    marketingStoreChunk.props.getIsHadProAccessOffScores,
    marketingStoreChunk.props.getIsHadProAccessCourses,
    abStoreChunk.props.getExperiments,
    (subscriptions, isHadProAccess, isHadOffScoresAccess, isHadProAccessCourses) => {
        if (!subscriptions?.length)
            return {
                pro: [],
                offScores: [],
                learning: [],
                learningLite: [],
                ebook: [],
            }

        const proLiteIntroductory = subscriptions.find(
            subscription => subscription.productId === marketingConstants.proYearIntroductory,
        )

        const yearPro = subscriptions.find(
            subscription => subscription.productId === marketingConstants.pro69SubscriptionId,
        )
        const weeklyPro = subscriptions.find(
            subscription => subscription.productId === marketingConstants.weekProSubscriptionId,
        )

        const instantOffScoresIntroductory = subscriptions.find(
            subscription => subscription.productId === marketingConstants.offScoresYearIntroductory,
        )

        const offScoresYear = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.offScores99SubscriptionIdTrial,
        )

        const weeklyOffScores = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
        )

        const instantLearn = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.instantLearnSubscriptionId,
        )
        const learnYear = subscriptions.find(
            subscription => subscription.productId === marketingConstants.yearLearnSubscriptionId,
        )
        const learnMonth = subscriptions.find(
            subscription => subscription.productId === marketingConstants.monthLearnSubscriptionId,
        )

        const learning =
            learnYear && instantLearn && learnMonth
                ? [...(isHadProAccessCourses ? [] : [learnYear]), instantLearn, learnMonth]
                : []

        const instantLearnLiteExp = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnLiteExpSubscriptionId,
        )
        const learnYearTrialExpLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnLiteTrialExpSubscriptionId,
        )
        const learnMonthExpLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthLearnLiteExpSubscriptionId,
        )

        const learningLite =
            instantLearnLiteExp && learnYearTrialExpLite && learnMonthExpLite
                ? [learnYearTrialExpLite, instantLearnLiteExp, learnMonthExpLite]
                : []

        const pro =
            yearPro && weeklyPro && proLiteIntroductory
                ? [
                      ...(isHadProAccess || isHadOffScoresAccess ? [] : [yearPro]),
                      proLiteIntroductory,
                      weeklyPro,
                  ]
                : []

        const yearLite = subscriptions.find(
            subscription => subscription.productId === marketingConstants.yearLiteSubscriptionId,
        )

        const monthLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthLiteSubscriptionInstantId,
        )
        const offScoresMonthLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthOffScoresLiteSubscriptionId,
        )
        const offScoresYearLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearOffScoresLiteSubscriptionId,
        )

        const offScoresLiteAndroid =
            offScoresMonthLite && offScoresYearLite && instantOffScoresIntroductory
                ? [
                      ...(isHadProAccess || isHadOffScoresAccess ? [] : [offScoresYearLite]),
                      instantOffScoresIntroductory,
                      offScoresMonthLite,
                  ]
                : []

        const proLiteAndroid =
            yearLite && monthLite && proLiteIntroductory
                ? [
                      ...(isHadProAccess || isHadOffScoresAccess ? [] : [yearLite]),
                      proLiteIntroductory,
                      monthLite,
                  ]
                : []

        const offScores =
            offScoresYear && weeklyOffScores && instantOffScoresIntroductory
                ? [
                      ...(isHadOffScoresAccess ? [] : [offScoresYear]),
                      instantOffScoresIntroductory,
                      weeklyOffScores,
                  ]
                : []

        const ebookMonth = subscriptions.find(
            subscription => subscription.productId === marketingConstants.ebookWeekSubscriptionId,
        )
        const ebookYearTrial = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.ebookYearTrialSubscriptionId,
        )
        const ebookYearInstant = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.ebookYearInstantSubscriptionId,
        )

        const ebook =
            ebookYearTrial && ebookYearInstant && ebookMonth
                ? [ebookYearTrial, ebookYearInstant, ebookMonth]
                : []

        return {
            pro: platform.isIos ? pro : proLiteAndroid,
            offScores: platform.isIos ? offScores : offScoresLiteAndroid,
            learning,
            learningLite,
            ebook,
        }
    },
)

export const getTrialSubscriptionOffScores = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccessOffScores,
    (subscriptions, isHadProAccessOffScores) => {
        if (!subscriptions?.length) return []

        const offScoresYearIos = subscriptions.find(
            subscription =>
                subscription.productId ===
                (isHadProAccessOffScores
                    ? marketingConstants.year99OffScoresLiteSubscriptionId
                    : marketingConstants.offScores99SubscriptionIdTrial),
        )
        const offScoresIosArray = offScoresYearIos ? [offScoresYearIos] : []

        const offScoresYearAndroid = subscriptions.find(
            subscription =>
                subscription.productId ===
                (isHadProAccessOffScores
                    ? marketingConstants.offScores69SubscriptionId
                    : marketingConstants.offScoresTrial69LiteSubscriptionId),
        )
        const offScoresYearAndroidArray = offScoresYearAndroid ? [offScoresYearAndroid] : []

        return platform.isIos ? offScoresIosArray : offScoresYearAndroidArray
    },
)

export const getFlashSaleSubscriptions = createSelector(getOfferSubscriptions, subscriptions => {
    if (!subscriptions?.length)
        return {
            learn: [],
            offScores: [],
        }

    const monthLearn = subscriptions.find(
        subscription => subscription.productId === marketingConstants.monthLearnSubscriptionId,
    )
    const instantLearn = subscriptions.find(
        subscription => subscription.productId === marketingConstants.flashSaleSubscriptionId,
    )

    const weeklyOffScores = subscriptions.find(
        subscription => subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
    )
    const instantOffScores = subscriptions.find(
        subscription =>
            subscription.productId === marketingConstants.instantOffScoresLiteSubscriptionId,
    )

    if (!monthLearn || !instantLearn || !weeklyOffScores || !instantOffScores)
        return {
            learn: [],
            offScores: [],
        }

    return {
        learn: [instantLearn, monthLearn],
        offScores: [instantOffScores, weeklyOffScores],
    }
})
export const getAfterSaleSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsTrial,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsCourses,
    (subscriptions, isTrial, isOffScores, isCourses) => {
        if (!subscriptions?.length) return []

        const trial = subscriptions.find(
            subscription => subscription.productId === marketingConstants.trialLearn80SaleId,
        )
        const instant = subscriptions.find(
            subscription => subscription.productId === marketingConstants.instantLearn80SaleId,
        )
        const iosCourses = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnTrial2025ProductId,
        )

        const instantOffScores = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.offScores59SubscriptionId
                    : marketingConstants.year70OffScoresLiteSubscriptionId),
        )

        if (!trial || !instant || !instantOffScores) return []

        if (!isOffScores && isCourses) return [instantOffScores]

        return platform.isIos ? [...(iosCourses ? [iosCourses] : [])] : [isTrial ? trial : instant]
    },
)
export const get70SaleSubscriptions = createSelector(getOfferSubscriptions, subscriptions => {
    if (!subscriptions?.length) return []

    const instantLite = subscriptions.find(
        subscription =>
            subscription.productId ===
            (platform.isIos
                ? marketingConstants.offScores59SubscriptionId
                : marketingConstants.year70OffScoresLiteSubscriptionId),
    )

    if (!instantLite) return []
    return [instantLite]
})

export const getAnniversarySplashSubscriptions = createSelector(
    getOfferSubscriptions,
    abStoreChunk.props.getExperiments,
    subscriptions => {
        if (!subscriptions?.length) return null

        const month = subscriptions?.find(
            subscription =>
                subscription.productId === marketingConstants.monthLiteSubscriptionInstantId,
        )
        const weekPro = subscriptions?.find(
            subscription => subscription.productId === marketingConstants.weekProSubscriptionId,
        )
        const instantProIntroductory = subscriptions?.find(
            subscription =>
                subscription.productId === marketingConstants.proIntroductoryAnniversaryYear,
        )
        const instantOffscoresIntroductory = subscriptions?.find(
            subscription =>
                subscription.productId === marketingConstants.offScoresYearIntroductoryAnniversary,
        )
        const monthOffscores = subscriptions?.find(
            subscription =>
                subscription.productId === marketingConstants.monthOffScoresLiteSubscriptionId,
        )
        const weekOffscores = subscriptions?.find(
            subscription =>
                subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
        )

        if (
            !month ||
            !monthOffscores ||
            !weekPro ||
            !weekOffscores ||
            !instantProIntroductory ||
            !instantOffscoresIntroductory
        )
            return null

        return {
            pro: [platform.isIos ? weekPro : month, instantProIntroductory],
            offScores: [
                platform.isIos ? weekOffscores : monthOffscores,
                instantOffscoresIntroductory,
            ],
        }
    },
)

// anniversary plans with the regular trial year in front
export const getScoreDiscountSplashSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccess,
    marketingStoreChunk.props.getIsHadProAccessOffScores,
    (subscriptions, isHadProAccess, isHadOffScoresAccess) => {
        if (!subscriptions?.length) return null

        const findById = (productId: string) =>
            subscriptions.find(subscription => subscription.productId === productId)

        const proTrial = findById(
            platform.isIos
                ? marketingConstants.pro69SubscriptionId
                : marketingConstants.yearLiteSubscriptionId,
        )
        const proIntroductory = findById(marketingConstants.proIntroductoryAnniversaryYear)
        const proShort = findById(
            platform.isIos
                ? marketingConstants.weekProSubscriptionId
                : marketingConstants.monthLiteSubscriptionInstantId,
        )
        const offScoresTrial = findById(
            platform.isIos
                ? marketingConstants.offScores99SubscriptionIdTrial
                : marketingConstants.yearOffScoresLiteSubscriptionId,
        )
        const offScoresIntroductory = findById(
            marketingConstants.offScoresYearIntroductoryAnniversary,
        )
        const offScoresShort = findById(
            platform.isIos
                ? marketingConstants.weekOffScoresSubscriptionId
                : marketingConstants.monthOffScoresLiteSubscriptionId,
        )

        if (
            !proTrial ||
            !proIntroductory ||
            !proShort ||
            !offScoresTrial ||
            !offScoresIntroductory ||
            !offScoresShort
        )
            return null

        return {
            pro: [
                ...(isHadProAccess || isHadOffScoresAccess ? [] : [proTrial]),
                proIntroductory,
                proShort,
            ],
            offScores: [
                ...(isHadOffScoresAccess ? [] : [offScoresTrial]),
                offScoresIntroductory,
                offScoresShort,
            ],
        }
    },
)

export const getSaleSubscriptionsLearn = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccessCourses,
    (subscriptions, isHadProAccessCourses) => {
        if (!subscriptions?.length) return []

        const month = subscriptions.find(
            subscription => subscription.productId === marketingConstants.monthLearnSubscriptionId,
        )
        const year = subscriptions.find(
            subscription => subscription.productId === marketingConstants.yearLearnSubscriptionId,
        )
        const instant = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.instantLearnSubscriptionId,
        )
        if (!month || !instant || !year) return []

        return [...(isHadProAccessCourses ? [] : [year]), instant, month]
    },
)

export const getSaleSubscriptionsLearnWithoutTrial = createSelector(
    getOfferSubscriptions,
    subscriptions => {
        if (!subscriptions?.length) return []

        const month = subscriptions.find(
            subscription => subscription.productId === marketingConstants.monthLearnSubscriptionId,
        )
        const instant = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.instantLearnSubscriptionId,
        )

        if (!month || !instant) return []

        return [instant, month]
    },
)

export const getOneSubscription = createSelector(getOfferSubscriptions, subscriptions => {
    if (!subscriptions?.length) return []
    const oneInstant = subscriptions?.find(
        subscription => subscription.productId === marketingConstants.instantOneSubscriptionId,
    )

    if (!oneInstant) return []
    return [oneInstant]
})

export const getIsNeedShowFlashSaleSplash = createSelector(
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getFlashSaleCount,
    marketingStoreChunk.props.getTimerSaleLashShown,
    marketingStoreChunk.props.getTimerSaleStartOffScores,
    (isCourses, flashSaleCount, saleLastShownMs, timerSaleStartOffScores) => {
        if (isCourses || timerSaleStartOffScores) return false
        const count = flashSaleCount === 0 || !flashSaleCount ? 0 : flashSaleCount
        if (count < 0 || count > 3) return false
        return (
            Date.now() - (saleLastShownMs || 0) >=
            [
                1000 * 60 * 60 * 24, // 1 day
                1000 * 60 * 60 * 24 * 7, // 7 days
                1000 * 60 * 60 * 24 * 14, // 14 days
                1000 * 60 * 60 * 24 * 21, // 21 days
            ][count]
        )
    },
)

export const getCreditsPack = createSelector(marketingStoreChunk.props.getProducts, products => {
    if (!products?.length) return []

    const credit2pack = products.find(
        product => product?.productId === marketingConstants.credit2pack,
    )
    const credit3pack = products.find(
        product => product?.productId === marketingConstants.credit3pack,
    )
    const credit5pack = products.find(
        product => product?.productId === marketingConstants.credit5pack,
    )
    const credit10pack = products.find(
        product => product?.productId === marketingConstants.credit10pack,
    )
    const credit25pack = products.find(
        product => product?.productId === marketingConstants.credit25pack,
    )
    if (!credit2pack || !credit3pack || !credit5pack || !credit10pack || !credit25pack) return []

    return [credit2pack, credit3pack, credit5pack, credit10pack, credit25pack]
})

export const getProfileSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsLearnLiteSubscriptionActive,
    marketingStoreChunk.props.getIsLearningLite,
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getIsEbookRights,
    (
        subscriptions,
        isPro,
        isOffScores,
        isLearnLiteIdSubscription,
        isLearnLiteRights,
        isLearn,
        isEbookRights,
    ) => {
        if (!subscriptions?.length) return []

        const instantLiteOffscores = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.offScores69SubscriptionId
                    : marketingConstants.instantOffScoresLiteSubscriptionId),
        )
        const instantPro = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.expansiveInstantLiteSubscriptionId
                    : marketingConstants.instantLiteSubscriptionId),
        )
        const instantLearn = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.instantLearnSubscriptionId,
        )
        const instantLearnLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnLiteExpSubscriptionId,
        )
        const instantOne = subscriptions.find(
            subscription => subscription.productId === marketingConstants.instantOneSubscriptionId,
        )

        const instantEbook = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.ebookYearInstantSubscriptionId,
        )

        if (
            !instantLiteOffscores ||
            !instantPro ||
            !instantLearn ||
            !instantOne ||
            !instantLearnLite ||
            !instantEbook
        )
            return []

        return [
            ...(isOffScores ? [] : [instantLiteOffscores]),
            ...(isPro ? [] : [instantPro]),
            ...(isLearn ? [] : [instantLearn]),
            ...(isLearnLiteIdSubscription || isLearnLiteRights || isLearn
                ? []
                : [instantLearnLite]),
            ...(isEbookRights ? [] : [instantEbook]),
            ...(isOffScores && isLearn ? [] : [instantOne]),
        ]
    },
)

export const getStudentSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccess,
    marketingStoreChunk.props.getIsHadProAccessOffScores,
    marketingStoreChunk.props.getIsHadProAccessCourses,
    subscriptions => {
        if (!subscriptions?.length)
            return {
                offScoresMonth: [],
                proMonth: [],
            }

        const weeklyPro = subscriptions.find(
            subscription => subscription.productId === marketingConstants.weekProSubscriptionId,
        )

        const weeklyOffScores = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
        )

        const offScoresMonthLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthOffScoresLiteSubscriptionId,
        )

        const month10Pro = subscriptions.find(
            subscription => subscription.productId === marketingConstants.proMonth10SubscriptionId,
        )
        const monthPro = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.monthLiteSubscriptionInstantId,
        )
        const offScores16Month = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.offScoresMonth16SubscriptionId,
        )

        const proMonth =
            month10Pro && monthPro && weeklyPro ? [month10Pro, monthPro, weeklyPro] : []
        const offScoresMonth =
            offScores16Month && offScoresMonthLite && weeklyOffScores
                ? [offScores16Month, offScoresMonthLite, weeklyOffScores]
                : []

        return {
            offScoresMonth,
            proMonth,
        }
    },
)

export const getIsShowPricingPage = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsCourses,
    (subscriptions, isPro, isOffScores, isCourses) => {
        return !!subscriptions?.length && !(isPro && isOffScores && isCourses)
    },
)

export const getTourSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsHadProAccess,
    marketingStoreChunk.props.getIsHadProAccessOffScores,
    marketingStoreChunk.props.getIsHadProAccessCourses,
    abStoreChunk.props.getExperiments,
    (subscriptions, isHadProAccess, isHadOffScoresAccess, isHadProAccessCourses, experiments) => {
        if (!subscriptions?.length)
            return {
                pro: [],
                offScores: [],
                learning: [],
                offScoresDoubt: [],
                proDoubt: [],
            }

        const instantLearn2025 = subscriptions.find(
            subscription => subscription.productId === marketingConstants.yearLearn2025ProductId,
        )
        const trialLearn2025 = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnTrial2025ProductId,
        )
        const monthLearn2025 = subscriptions.find(
            subscription => subscription.productId === marketingConstants.monthLearn2025ProductId,
        )

        const newLearnIosPlans =
            trialLearn2025 && instantLearn2025 && monthLearn2025
                ? [
                      ...(isHadProAccessCourses || !trialLearn2025.isTrialAvailable
                          ? []
                          : [trialLearn2025]),
                      instantLearn2025,
                      monthLearn2025,
                  ]
                : []

        const proLiteIntroductory = subscriptions.find(
            subscription => subscription.productId === marketingConstants.proYearIntroductory,
        )

        const proLite45 = subscriptions.find(
            subscription => subscription.productId === marketingConstants.pro45SubscriptionId,
        )

        const offScores55Subscription = subscriptions.find(
            subscription => subscription.productId === marketingConstants.offScores55SubscriptionId,
        )

        const offScores2025Month = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.offScores2025MonthProductId,
        )

        const offScores2025YearTrial = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.offScores2025YearTrialProductId,
        )

        const offScoresDoubtBase =
            offScores2025Month && offScores55Subscription && offScores2025YearTrial
                ? [
                      ...(isHadProAccess ? [] : [offScores2025YearTrial]),
                      offScores55Subscription,
                      offScores2025Month,
                  ]
                : []

        const pro2025YearTrial = subscriptions.find(
            subscription => subscription.productId === marketingConstants.pro2025YearTrialProductId,
        )
        const pro2025Month = subscriptions.find(
            subscription => subscription.productId === marketingConstants.pro2025MonthProductId,
        )

        const proDoubtBase =
            pro2025YearTrial && pro2025Month && proLite45
                ? [...(isHadProAccess ? [] : [pro2025YearTrial]), proLite45, pro2025Month]
                : []

        const instantOffScoresIntroductory = subscriptions.find(
            subscription => subscription.productId === marketingConstants.offScoresYearIntroductory,
        )

        const offScoresYear = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.offScores99SubscriptionIdTrial,
        )

        const weeklyOffScores = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.weekOffScoresSubscriptionId,
        )

        const offScoresIOS =
            offScoresYear && weeklyOffScores && instantOffScoresIntroductory
                ? [
                      ...(isHadOffScoresAccess ? [] : [offScoresYear]),
                      instantOffScoresIntroductory,
                      weeklyOffScores,
                  ]
                : []

        const yearProTrial = subscriptions.find(
            subscription => subscription.productId === marketingConstants.pro69SubscriptionId,
        )
        const weekly = subscriptions.find(
            subscription => subscription.productId === marketingConstants.weekProSubscriptionId,
        )
        const proIOS =
            yearProTrial && weekly && proLiteIntroductory
                ? [...(isHadProAccess ? [] : [yearProTrial]), proLiteIntroductory, weekly]
                : []

        const pro2025YearInstantIntroductory = subscriptions.find(
            subscription =>
                subscription.productId ===
                marketingConstants.pro2025YearInstantIntroductoryProductId,
        )

        const offScores2025YearInstantIntroductory = subscriptions.find(
            subscription =>
                subscription.productId ===
                marketingConstants.offScores2025YearInstantIntroductoryProductId,
        )

        const newProLiteAndroid =
            pro2025YearTrial && pro2025Month && pro2025YearInstantIntroductory
                ? [
                      ...(isHadProAccess ? [] : [pro2025YearTrial]),
                      pro2025YearInstantIntroductory,
                      pro2025Month,
                  ]
                : []

        const newOffScoresAndroid =
            offScores2025YearTrial && offScores2025Month && offScores2025YearInstantIntroductory
                ? [
                      ...(isHadProAccess ? [] : [offScores2025YearTrial]),
                      offScores2025YearInstantIntroductory,
                      offScores2025Month,
                  ]
                : []

        return {
            pro: platform.isIos ? proIOS : newProLiteAndroid,
            offScores: platform.isIos ? offScoresIOS : newOffScoresAndroid,
            learning: newLearnIosPlans,
            offScoresDoubt: platform.isIos ? [] : offScoresDoubtBase,
            proDoubt: platform.isIos ? [] : proDoubtBase,
        }
    },
)

export const getAutoGradeSubscriptions = createSelector(getOfferSubscriptions, subscriptions => {
    if (!subscriptions?.length)
        return {
            offScoresAutoGrade: [],
        }
    const instantAutoGrade = subscriptions.find(
        subscription =>
            subscription.productId === marketingConstants.proPlusAutoGradeInstantSubscriptionId,
    )
    const monthAutoGrade = subscriptions.find(
        subscription =>
            subscription.productId === marketingConstants.proPlusAutoGradeMonthSubscriptionId,
    )
    const weekAutoGrade = subscriptions.find(
        subscription =>
            subscription.productId === marketingConstants.proPlusAutoGradeWeekSubscriptionId,
    )

    const autoGradeGroupIos =
        instantAutoGrade && weekAutoGrade ? [instantAutoGrade, weekAutoGrade] : []
    const autoGradeGroupAndroid =
        instantAutoGrade && monthAutoGrade ? [instantAutoGrade, monthAutoGrade] : []

    return {
        offScoresAutoGrade: platform.isIos ? autoGradeGroupIos : autoGradeGroupAndroid,
    }
})

export const getIsUserHasSubscription = createSelector(
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getIsEbookRights,
    (isPro, isOffScores, isCourses, isEbooksRights) =>
        isPro || isOffScores || isCourses || isEbooksRights,
)

export const getIsUserHasProOrOffScores = createSelector(
    marketingStoreChunk.props.getIsHadProAccess,
    marketingStoreChunk.props.getIsHadProAccessCourses,
    (isPro, isOffScores) => isPro || isOffScores,
)

export const getIsUserHasActiveSubscription = createSelector(
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getIsEbookRights,
    marketingStoreChunk.props.getSubscriptionsForRestore,
    (isPro, isOffScores, isCourses, isEbooksRights, subscriptionsForRestore) =>
        (isPro && !subscriptionsForRestore.find(item => item.planName === 'pro')) ||
        (isOffScores && !subscriptionsForRestore.find(item => item.planName === 'offScores')) ||
        (isCourses && !subscriptionsForRestore.find(item => item.planName === 'learning')) ||
        (isEbooksRights && !subscriptionsForRestore.find(item => item.planName === 'ebook')),
)

export const getTourSecondBlockSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsPro,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsLearnLiteSubscriptionActive,
    marketingStoreChunk.props.getIsLearningLite,
    marketingStoreChunk.props.getIsCourses,
    abStoreChunk.props.getExperiments,
    (
        subscriptions,
        isPro,
        isOffScores,
        isLearnLiteIdSubscription,
        isLearnLiteRights,
        isLearn,
        experiments,
    ) => {
        if (!subscriptions?.length) return []

        const instantLiteOffscores = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.offScores99SubscriptionIdTrial
                    : marketingConstants.yearOffScoresLiteSubscriptionId),
        )
        const instantPro = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.pro69SubscriptionId
                    : marketingConstants.yearLiteSubscriptionId),
        )

        const instantLearnLite = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.yearLearnLiteTrialExpSubscriptionId,
        )
        const instantOne = subscriptions.find(
            subscription => subscription.productId === marketingConstants.yearOneSubscriptionId,
        )
        const skipTourSubscription = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.proPlusAutoGradeInstantSubscriptionId,
        )

        if (
            !skipTourSubscription ||
            !instantLiteOffscores ||
            !instantPro ||
            !instantOne ||
            !instantLearnLite
        )
            return []

        return [
            ...(isOffScores ? [] : [instantLiteOffscores]),
            ...(isPro ? [] : [instantPro]),
            ...(isLearnLiteIdSubscription || isLearnLiteRights || isLearn
                ? []
                : [instantLearnLite]),
            ...(isOffScores && isLearn ? [] : [instantOne]),
            ...(isPro ? [skipTourSubscription] : []),
        ]
    },
)

export const getActiveSubscriptionsUser = createSelector(
    marketingStoreChunk.props.getCurrentSubscriptionProInfo,
    marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
    marketingStoreChunk.props.getCurrentSubscriptionEbookInfo,
    marketingStoreChunk.props.getCurrentSubscriptionLearnInfo,
    marketingStoreChunk.props.getCurrentSubscriptionLearnLiteInfo,
    (
        currentSubscriptionProInfo,
        currentSubscriptionOffScoresInfo,
        currentSubscriptionEbookInfo,
        currentSubscriptionLearnInfo,
        currentSubscriptionLearnLiteInfo,
    ) =>
        subscriptionHelpers
            .checkBundleSubscription({
                currentSubscriptionProInfo,
                currentSubscriptionOffScoresInfo,
                currentSubscriptionEbookInfo,
                currentSubscriptionLearnInfo,
                currentSubscriptionLearnLiteInfo,
            })
            .filter(product => !!product?.productId) as TCurrentSubscription[],
)

export const getTabSubscriptions = createSelector(
    getOfferSubscriptions,
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getIsCourses,
    marketingStoreChunk.props.getIsEbookRights,
    (subscriptions, isOffScores, isLearnRights, isEbookRights) => {
        if (!subscriptions?.length) return []

        const instantLiteOffScores = subscriptions.find(
            subscription =>
                subscription.productId ===
                (platform.isIos
                    ? marketingConstants.offScores69SubscriptionId
                    : marketingConstants.instantOffScoresLiteSubscriptionId),
        )

        const instantLearn = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.instantLearnSubscriptionId,
        )

        const instantEbook = subscriptions.find(
            subscription =>
                subscription.productId === marketingConstants.ebookYearInstantSubscriptionId,
        )

        if (!instantLiteOffScores || !instantLearn || !instantEbook) return []

        return [
            ...(isOffScores ? [] : [instantLiteOffScores]),
            ...(isLearnRights ? [] : [instantLearn]),
            ...(isEbookRights ? [] : [instantEbook]),
        ]
    },
)

export const getIsNeedShowFlashSaleSplashOffScores = createSelector(
    marketingStoreChunk.props.getIsOffScores,
    marketingStoreChunk.props.getFlashSaleCountOffScores,
    marketingStoreChunk.props.getTimerSaleLashShownOffScores,
    (isOffScores, flashSaleCount, timerSaleLashShownOffScores) => {
        if (isOffScores || platform.isAndroid) return false
        const count = flashSaleCount === 0 || !flashSaleCount ? 0 : flashSaleCount
        if (count < 0 || count > 3) return false

        return (
            Date.now() - timerSaleLashShownOffScores >=
            [
                1000 * 60 * 60 * 24, // 1 day (apple anti reject)
                1000 * 60 * 60 * 24 * 7, // 7 days
                1000 * 60 * 60 * 24 * 14, // 14 days
                1000 * 60 * 60 * 24 * 21, // 21 days
            ][count]
        )
    },
)

export default marketingStoreChunk
