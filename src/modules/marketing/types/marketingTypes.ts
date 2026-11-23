import type { Product, SubscriptionOffer } from 'react-native-iap'

import type {
    TAnalyticsTrackerDto,
    TAndroidPurchaseTokenDto,
    TServiceAccessRightDto,
    TStatisticSummaryDto,
    TUserBalanceDto,
} from '@mu-native/api'

import { sources, typeOfStart } from '../constants/marketingConstants'

export type TAccessRight = {
    serviceName: string
    dateAccess: number
    lifetime: 0 | 1
    autoRenew: 0 | 1
    trial: 0 | 1 | 2
    productId: TProductId
    isPaymentPending: boolean
    valid: boolean
}

export const enum TPaymentTypes {
    unpaid = 0,
    credit = 1,
    oneTimePayment = 2,
}

export const enum TourSteps {
    FIRST_TOUR_SCREEN = 0,
    NAME_INPUT_SCREEN = 1,
    GREETINGS_SCREEN = 2,
    QUIZ_STEP = 3,
    PERSONAL_ANIMATION_SCREEN = 4,
    SET_NOTIFICATION_SCREEN = 5,
    PAYMENT_SCREEN = 6,
    UPDATE_QUIZ_STEP = 7,
    LAST_CHANCE_SCREEN = 8,
    AFTER_SELL_SCREEN = 9,
    BENEFITS_SCREEN = 10,
    PURCHASE_SUCCESS_SCREEN = 11,
}

export type TAccessRightsResponse =
    | { service_access: TAccessRightResponse[] }
    | TAccessRightResponse[]
    | null

export type TAccessRightResponse = TServiceAccessRightDto
export type TContentDataResponse = TStatisticSummaryDto
export type TBalanceDataResponse = TUserBalanceDto

export type TStartMode = (typeof typeOfStart)[keyof typeof typeOfStart] | null

export type TScreenName =
    | 'TOUR_INSTALL'
    | 'FLOATING'
    | 'LANDING'
    | 'GAME_SCREEN'
    | 'ANNIVERSARY_SCREEN'
    | 'PROFILE'
    | 'LAST_CHANCE'
    | 'TOUR_UPDATE'
    | 'STUDENTS'
    | 'EXPIRE_SPLASH'
    | 'TOUR_MORE_PLANS'
    | 'LONG_LANDING'

export type TSubscription = {
    introductoryPriceIOS?: string | null
    summary: string
    summaryExp?: string
    id: TProductId
    productId: TProductId
    currency: string
    planName: string
    badgeText: string
    textAboveButton: string
    calculatedPricePerMonth: string
    featureList: { title: string; isDisabled: boolean }[]
    customFeatureList: { title: string; isDisabled: boolean }[]
    subscriptionOfferDetails?: { sku: string; offerToken: string }[]
    calculatedPricePerYear: string
    customPlanName?: string
    price: number
    trialStatus: string
    duration: string
    usdPrice: string
    formattedPrice: string
    isTrialAvailable: boolean
    planNameType?: string
    buttonText: string
    formattedPricePerWeek?: string
    isIntroductory: boolean
    formattedIntroductoryPrice?: string
    creditsCount: number
    subscriptionOffers?: SubscriptionOffer[] | null
    ugPlanLineup?: TUgPlanLineup
}

export type TUgPlanLineup = {
    title: string
    subtitle: string
    badgeText: string
    textAboveButton: string
    pricePerMonth: string
    priceSuffix: string
}

export type TSubscriptionsGroup<PlanType extends string> = Partial<
    Record<PlanType, TSubscription[]>
>

type OldProductIdIOST =
    | 'com.musescore.player.1month.instant' // месячный инстант (6.99)
    | 'com.musescore.player.1year.7day' // годовой триал (49.99)
    | 'com.musescore.player.1year.75' // годовой инстант (29.99)
    | 'com.musescore.player.1year.49.99' // Инстант по цене триала (49.99)
    | 'com.musescore.player.1year.75sale' // Юбилейный сплэш (19.99)
    | 'com.musescore.player.1year.70'
// 70% OFF (24.99)
type ProductIdIOST =
    | 'com.musescore.player.1month.2020' // месячный инстант (6.99)
    | 'com.musescore.player.1year.7day.2020' // годовой триал (49.99)
    | 'com.musescore.player.1year.65off.2020' // годовой инстант (29.99)
    | 'com.musescore.player.1year.49.99.2020' // Инстант по цене триала (49.99)
    | 'com.musescore.player.1year.75off.2020' // Юбилейный сплэш (19.99)
    | 'com.musescore.player.1year.70off.2020'
    | 'com.musescore.player.1month.learn'
    | 'com.musescore.player.1year.offscores.70' // офф скоры (35.99)
// 70% OFF (24.99)
type ProductIdAndroidT =
    | 'com.musescore.playerlite.1month.instant' // месячный инстант (6.99)
    | 'com.musescore.playerlite.1year' // годовой триал (49.99)
    | 'com.musescore.playerlite.1year.75' // годовой инстант (29.99)
    | 'com.musescore.playerlite.1year.49.99' // Инстант по цене триала (49.99)
    | 'com.musescore.playerlite.1year.75sale' // Юбилейный сплэш (19.99)
    | 'com.musescore.playerlite.1year.70'
    | 'com.musescore.player.1year.offsc.70' // офф скоры (35.99)
    | 'com.musescore.playerlite.year1.learn.80' // learn 80% sale

type TInnAppId =
    | 'com.musescore.playerlite.lifetime.score.5.9'
    | 'com.musescore.player.scorefeatures.5.9'

export type TCreditsPlanIds =
    | 'com.musescore.player.scorefeatures.25.credit'
    | 'com.musescore.player.scorefeatures.2.credit'
    | 'com.musescore.player.scorefeatures.3.credit'
    | 'com.musescore.player.scorefeatures.10.credit'
    | 'com.musescore.player.scorefeatures.5.credit'
    | 'com.musescore.player.course.15.9'
    | 'com.musescore.playerlite.course.15.9'
    | 'com.musescore.playerlite.lifetime.scorefeatures.2.credit'
    | 'com.musescore.playerlite.lifetime.scorefeatures.3.credit'
    | 'com.musescore.playerlite.lifetime.scorefeatures.5.credit'
    | 'com.musescore.playerlite.lifetime.scorefeatures.10.credit'
    | 'com.musescore.playerlite.lifetime.scorefeatures.25.credit'

export type TProductId =
    | ProductIdIOST
    | OldProductIdIOST
    | ProductIdAndroidT
    | TInnAppId
    | TCreditsPlanIds
    | string

type TAccess = {
    dateFinish: string
    lifetime: string
    subscriptionType: string
    trial: string
}

export type TAccesses = Record<string, TAccess>

export type TPlanType = 'pro' | 'offScores' | 'learning' | 'learningLite' | 'ebook'
export type TPlanTypeSplash = 'pro' | 'offScores' | 'learning' | 'one' | 'learningBundle'

export type TStockLandingPlanType =
    | 'pro'
    | 'offScores'
    | 'learning'
    | 'offScoresDoubt'
    | 'proDoubt'
    | 'ebook'
    | 'learningLite'
    | 'premium'
    | 'one'
    | 'learningBundle'

export type PlanType = 'pro' | 'offScores' | 'learning'

export type TPlanTypeTourInstall = 'pro' | 'offScores' | 'learning' | 'offScoresDoubt' | 'proDoubt'

export type TPurchaseTokenInfo = TAndroidPurchaseTokenDto
export type TPaymentAccountInfo = TAnalyticsTrackerDto

export type TKeySources = keyof typeof sources
export type TSources = (typeof sources)[TKeySources]
export type TQuestionLabel = 'level' | 'genre_new' | 'instrument_new' | 'name'
export type TProductInApp = Product & TSubscription
export type TPlanIds =
    | 'year65off'
    | 'month'
    | 'month2022'
    | 'year7dayTrial'
    | 'year70off'
    | 'year75off'
    | 'year49usd'
    | 'offScoresYear70'
    | 'offScoresYear'
    | 'offScoresMonth'
    | 'offScoresMonth2022'
    | 'offScoresYearInstant'
    | 'oneInstant'
    | 'oneYear'
    | 'oneInstant80'
    | 'monthLearn'
    | 'yearLearn80Instant'
    | 'yearLearnFlashSaleInstant'
    | 'yearLearnInstant'
    | 'yearLearn'

export type TScoreId = number | null
export type TInAppForSale = {
    id: string | number
    title?: string
    price?: number
    isPurchased?: boolean
    scoreId?: number
    imageInAppUri?: string
} | null

export type TInAppForShow = {
    price: string
    title: string
    id?: string
    scoreId?: string | number
    summary: string
}

export type TFeatureLandingName = 'pro' | 'learning' | 'offScores' | 'learningLite' | 'ebook'
export type TCurrentSubscription = {
    dateEndAccess?: number
    autoRenew: undefined | number
    productId: TProductId
    featureList: { title: string; isDisabled: boolean }[]
    planName: string
    isActive: boolean
}
export type TSubscriptionForRestore = {
    productId: TProductId
    dateEndAccess: number
    sourceRestore?: string
    planName: 'pro' | 'offScores' | 'learning' | 'learningLite' | 'ebook'
}

export { type Product }
export type TProduct = Product & { productId: string; summary: string; priceWithCurrency: string }
export type TScoreSale = {
    id: string
    title: string
    price: number
    largePreviewUrl: string
    previewImageUrl?: string
}

export type TIntroductoryOfferData = {
    isPro: boolean
    isLearn: boolean
    isEbook: boolean
    isOne: boolean
}

export const enum TContentTypes {
    creditInApp = 6,
    scoreInApp = 5,
    courseInApp = 8,
    ebookInApp = 9,
}
