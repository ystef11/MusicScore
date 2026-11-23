import type {
    ProductSubscription,
    ProductSubscriptionAndroid,
    ProductSubscriptionIOS,
} from 'react-native-iap'

import { platform } from '@mu-native/common'
import { translate } from '@mu-native/locale'

import { marketingConstants } from '../constants/marketingConstants.ts'
import {
    getAndroidDurationSubscription,
    getAndroidTrialDurationSubscription,
    getBadgeText,
    getButtonText,
    getCalculatedPricePerMonth,
    getCalculatedPricePerYear,
    getCreditsNumberByProductId,
    getCustomFeatureList,
    getCustomPlanName,
    getDurationSubscription,
    getFeatureList,
    getFirstYearThenPerYear,
    getMonthsAtPricePerMonth,
    getPlanName,
    getPlanNameTypeByProductId,
    getPriceForShowingDiscount,
    getSummary,
    getSummaryWeeklyPlan,
    getTrialPeriods,
    getUgPlanLineup,
    getPricePerMonth,
    getPricePerWeek,
    getPricePerYear,
    getUsdPriceByProductId,
    getWeeksAtPricePerWeek,
    textAboveButton,
} from '../constants/subsriptionBillingConstants'
import { TIntroductoryOfferData, TProductId, TSubscription } from '../types/marketingTypes'

import { getPriceWithCurrency, getPriceWithoutCurrency } from './price'

const intradactoryOrTrialCount = 2
const priceCount = 1
const lengthMicros = 6
const checkPriceRegex = /^(\d*([.,](?=\d{3}))?\d+)+((?!\2)[.,]\d\d)?$/

const checkIntroductoryGroup = (
    productId: TProductId,
    introductoryOfferData: {
        isPro: boolean
        isLearn: boolean
    },
    introPrice: string,
) => {
    if (
        marketingConstants.learnIntroductorySubscriptions.includes(productId) &&
        introductoryOfferData.isLearn
    ) {
        return introPrice
    }

    if (
        marketingConstants.proIntroductorySubscriptions.includes(productId) &&
        introductoryOfferData.isPro
    ) {
        return introPrice
    }

    return ''
}

export const convertPrice = (priceString?: string) => {
    if (!priceString) return 0
    if (platform.isAndroid && checkPriceRegex.test(priceString)) {
        return priceString
            ? Number(
                  parseFloat(
                      `${priceString.substring(
                          0,
                          priceString.length - lengthMicros,
                      )}.${priceString.substring(
                          priceString.length - lengthMicros,
                          priceString.length,
                      )}`,
                  ),
              )
            : 0
    }
    const stringWithoutSpaces = (+priceString.replace(/[^,.\d]/g, '')).toFixed(2)
    const priceArray = stringWithoutSpaces.match(/(\d+(?:[,.]\d{3,})*)(?:[,.](\d{2}))?/)
    if (!priceArray) return 0
    const parsedString = Number(
        `${priceArray[1].replace(/[^0-9-]+/g, '')}${priceArray[2] ? `.${priceArray[2]}` : ''}`,
    )
    return Number(parsedString.toFixed(2))
}

type TSubscriptionMap = {
    subscription: ProductSubscription
    isAgeExp: boolean
    planOfferName: string
    planOfferNameNew: string
    isShowTourBadge?: boolean
    planNameSpecialOffer: string
    introductoryOfferData: TIntroductoryOfferData
}

const checkTrialPermission = ({
    productId,
    introductoryPricePaymentModeIOS,
    introductoryOfferData,
}: {
    productId: string
    introductoryPricePaymentModeIOS?: string
    introductoryOfferData: TIntroductoryOfferData
}) => {
    if (marketingConstants.proTrialSubscriptions.includes(productId)) {
        return introductoryOfferData.isPro && introductoryPricePaymentModeIOS === 'free-trial'
    }
    if (marketingConstants.learnIntroductorySubscriptions.includes(productId)) {
        return introductoryOfferData.isLearn && introductoryPricePaymentModeIOS === 'free-trial'
    }
    if (marketingConstants.ebookIntroductorySubscriptions.includes(productId)) {
        return introductoryOfferData.isEbook && introductoryPricePaymentModeIOS === 'free-trial'
    }
    if (marketingConstants.oneIntroductorySubscriptions.includes(productId)) {
        return introductoryOfferData.isOne && introductoryPricePaymentModeIOS === 'free-trial'
    }

    return introductoryPricePaymentModeIOS === 'free-trial'
}

export const subscriptionMapIos = ({
    subscription,
    isAgeExp,
    planOfferName,
    planOfferNameNew,
    isShowTourBadge = false,
    planNameSpecialOffer,
    introductoryOfferData,
}: TSubscriptionMap): TSubscription => {
    const rawSubscription = subscription as unknown as ProductSubscriptionIOS

    const {
        currency,
        id: productId,
        introductoryPriceNumberOfPeriodsIOS,
        introductoryPriceSubscriptionPeriodIOS = 'DAY',
        subscriptionPeriodUnitIOS,
        subscriptionPeriodNumberIOS,
    } = rawSubscription
    const price = parseFloat((rawSubscription.price || '').toString())

    const intrPrice = rawSubscription.introductoryPriceAsAmountIOS
        ? checkIntroductoryGroup(
              productId,
              introductoryOfferData,
              rawSubscription.introductoryPriceAsAmountIOS,
          )
        : ''

    const isTrialAvailable = checkTrialPermission({
        productId,
        introductoryPricePaymentModeIOS: rawSubscription?.introductoryPricePaymentModeIOS,
        introductoryOfferData,
    })

    const introductoryPrice = convertPrice(intrPrice)

    const formattedPrice = getPriceWithCurrency({
        price,
        currency,
    })

    const formattedPricePerWeek = getPriceWithCurrency({
        price: price / 52,
        currency,
    })

    const formattedIntroductoryPrice = getPriceWithCurrency({
        price: introductoryPrice,
        currency,
    })

    const priceForWeekWithoutCurrency = getPriceWithoutCurrency({
        price: price / 52,
    })

    const priceSplashyear = getPricePerYear(formattedPrice)

    const pricePerYear = getCalculatedPricePerYear({
        price,
        productId,
        formattedPrice,
        formattedIntroductoryPrice,
        currency,
    })

    const priceSplashYearForMonthPlan = getPricePerYear(pricePerYear)
    const priceSplashmonth = getPricePerMonth(formattedPrice)
    const yearPlanPricePerMonth = getPriceWithCurrency({
        price: Number((price / 12).toFixed(2)),
        currency,
    })

    const monthPlanWeekPrice = getPriceWithCurrency({
        price: Number(((price / 30) * 7).toFixed(2)),
        currency,
    })

    const yearPlanintroductoryPricePerMonth = getPriceWithCurrency({
        price: introductoryPrice / 12,
        currency,
    })

    const yearPlanIntroductoryPriceSplashMonth = getMonthsAtPricePerMonth(
        12,
        yearPlanintroductoryPricePerMonth,
    )

    const yearPlanPriceSplashmonth = getMonthsAtPricePerMonth(12, yearPlanPricePerMonth)

    const firstYearThenPerYear = getFirstYearThenPerYear({
        introPrice: formattedIntroductoryPrice,
        price: formattedPrice,
    })

    const introductorySummary = introductoryPrice
        ? `${yearPlanIntroductoryPriceSplashMonth}. ${firstYearThenPerYear}`
        : `${yearPlanPriceSplashmonth}. [sb]${priceSplashyear}[/sb]`

    const yearPlanPricePerWeekIntro = getPriceWithCurrency({
        price: Number((introductoryPrice / 52).toFixed(2)),
        currency,
    })

    const introductoryWeeklySummary = introductoryPrice
        ? `${getWeeksAtPricePerWeek(52, yearPlanPricePerWeekIntro)}. ${firstYearThenPerYear}`
        : `${yearPlanPriceSplashmonth}. [sb]${priceSplashyear}[/sb]`

    const monthWeeklyPlanPerYear = getPriceWithCurrency({
        price: Number((price * 52).toFixed(2)),
        currency,
    })

    const currentPriceForShowingDiscount =
        currency === 'USD'
            ? getPriceForShowingDiscount({
                  productId,
                  priceForWeekWithoutCurrency,
                  currency,
                  price,
              }) || ''
            : ''

    const summaryWeeklyPlan = getSummaryWeeklyPlan({
        productId,
        currentPriceForShowingDiscount,
        priceSplashyear,
        price,
        currency,
    })

    const summary = getSummary({
        priceSplashyear,
        productId,
        priceSplashmonth,
        priceSplashYearForMonthPlan,
        yearPlanPriceSplashmonth,
        introductorySummary,
        monthPlanWeekPrice,
        monthWeeklyPlanPerYear,
        formattedPrice,
        price,
        isAgeExp,
        currentPriceForShowingDiscount,
        currency,
        isTrialAvailable,
        introductoryWeeklySummary,
    })

    const resolvedSummary = summaryWeeklyPlan || summary

    const monthsAtLabel = [yearPlanIntroductoryPriceSplashMonth, yearPlanPriceSplashmonth].find(
        label => resolvedSummary.includes(label),
    )
    const summaryExp = monthsAtLabel
        ? resolvedSummary.replace(monthsAtLabel, translate('native.marketing.billed_annually'))
        : ''

    const duration =
        subscriptionPeriodUnitIOS && subscriptionPeriodNumberIOS
            ? getDurationSubscription({
                  subscriptionPeriodUnitIOS,
                  subscriptionPeriodNumberIOS,
              })
            : ''

    return {
        ...rawSubscription,
        calculatedPricePerYear: pricePerYear,
        calculatedPricePerMonth: getCalculatedPricePerMonth({
            currency,
            price,
            formattedPrice,
            productId,
        }),
        summary: resolvedSummary,
        summaryExp,
        productId,
        id: productId,
        currency,
        planName: getPlanName({
            formattedPrice,
            productId,
            isTrialAvailable,
            isAgeExp,
            planOfferName,
            planOfferNameNew,
            planNameSpecialOffer,
        }),
        badgeText: getBadgeText({
            productId,
            isAgeExp,
            isTrialAvailable,
            isShowTourBadge,
        }),
        textAboveButton: textAboveButton({
            productId,
            isTrialAvailable,
            formattedPrice,
        }),
        featureList: getFeatureList(productId),
        customPlanName: getCustomPlanName({ productId }),
        customFeatureList: getCustomFeatureList(productId),
        price: introductoryPrice || +(rawSubscription.price || 0),
        trialStatus:
            isTrialAvailable && introductoryPriceSubscriptionPeriodIOS !== null
                ? `${introductoryPriceNumberOfPeriodsIOS} ${getTrialPeriods(
                      introductoryPriceSubscriptionPeriodIOS,
                  )}`
                : '',
        duration,
        ugPlanLineup: getUgPlanLineup({
            productId,
            duration,
            isIntroductory: !!introductoryPrice,
            isTrialAvailable,
            planOfferName,
            formattedPrice,
            formattedIntroductoryPrice,
            price: introductoryPrice || price,
            currency,
        }),
        usdPrice: getUsdPriceByProductId({ productId }),
        formattedPrice,
        formattedIntroductoryPrice,
        isTrialAvailable,
        planNameType: getPlanNameTypeByProductId({ productId }),
        buttonText: getButtonText({
            isTrialAvailable,
            productId,
        }),
        formattedPricePerWeek: formattedPricePerWeek ? getPricePerWeek(formattedPricePerWeek) : '',
        isIntroductory: !!intrPrice,
        creditsCount: getCreditsNumberByProductId({ productId }),
    }
}

export const subscriptionMapAndroid = ({
    subscription,
    isAgeExp,
    planOfferName,
    planOfferNameNew,
    isShowTourBadge = false,
    planNameSpecialOffer,
}: TSubscriptionMap): TSubscription => {
    const rawSubscription = subscription as unknown as ProductSubscriptionAndroid

    const priceObject =
        rawSubscription?.subscriptionOfferDetailsAndroid?.[0]?.pricingPhases?.pricingPhaseList.find(
            item => item?.recurrenceMode === priceCount,
        )

    const { id: productId } = rawSubscription

    const price = convertPrice(priceObject?.priceAmountMicros)

    const currency = priceObject?.priceCurrencyCode || ''
    const intradactoryObject =
        rawSubscription?.subscriptionOfferDetailsAndroid?.[0]?.pricingPhases?.pricingPhaseList.find(
            item => item?.recurrenceMode === intradactoryOrTrialCount,
        )

    const introductoryPrice = convertPrice(intradactoryObject?.priceAmountMicros)

    const isTrialAvailable = !!intradactoryObject && !introductoryPrice

    const formattedPrice =
        getPriceWithCurrency({
            price,
            currency,
        }) ||
        priceObject?.formattedPrice ||
        ''

    const formattedPricePerWeek = getPriceWithCurrency({
        price: price / 52,
        currency,
    })

    const formattedIntroductoryPrice = getPriceWithCurrency({
        price: introductoryPrice,
        currency,
    })

    const pricePerYear = getCalculatedPricePerYear({
        price,
        productId,
        formattedPrice,
        formattedIntroductoryPrice,
        currency,
    })

    const priceSplashyear = getPricePerYear(formattedPrice)

    const priceSplashYearForMonthPlan = getPricePerYear(pricePerYear)
    const priceSplashmonth = getPricePerMonth(formattedPrice)
    const yearPlanPricePerMonth = getPriceWithCurrency({
        price: Number((price / 12).toFixed(2)),
        currency,
    })

    const yearPlanintroductoryPricePerMonth = getPriceWithCurrency({
        price: introductoryPrice / 12,
        currency,
    })

    const yearPlanIntroductoryPriceSplashMonth = getMonthsAtPricePerMonth(
        12,
        yearPlanintroductoryPricePerMonth,
    )

    const yearPlanPriceSplashmonth = getMonthsAtPricePerMonth(12, yearPlanPricePerMonth)
    const monthPlanWeekPrice = getPriceWithCurrency({
        price: Number(((price / 30) * 7).toFixed(2)),
        currency,
    })

    const introductorySummary = intradactoryObject
        ? `${yearPlanIntroductoryPriceSplashMonth}. ${getFirstYearThenPerYear({
              introPrice: formattedIntroductoryPrice,
              price: formattedPrice,
              isPriceBold: true,
          })}`
        : `${yearPlanPriceSplashmonth}. [sb]${priceSplashyear}[/sb]`
    const monthWeeklyPlanPerYear = getPriceWithCurrency({
        price: Number((price * 52).toFixed(2)),
        currency,
    })
    const priceForWeekWithoutCurrency = getPriceWithoutCurrency({
        price: price / 52,
    })
    const currentPriceForShowingDiscount =
        currency === 'USD'
            ? getPriceForShowingDiscount({
                  price,
                  priceForWeekWithoutCurrency,
                  productId,
                  currency,
              })
            : ''
    const summary = getSummary({
        priceSplashyear,
        productId,
        priceSplashmonth,
        priceSplashYearForMonthPlan,
        yearPlanPriceSplashmonth,
        introductorySummary,
        monthPlanWeekPrice,
        monthWeeklyPlanPerYear,
        formattedPrice,
        price,
        isAgeExp,
        currentPriceForShowingDiscount,
        currency,
        isTrialAvailable,
    })

    const subscriptionOffer =
        rawSubscription?.subscriptionOfferDetailsAndroid?.map(item => ({
            sku: productId,
            offerToken: item.offerToken,
        })) || []
    const subscriptionOfferDetails = intradactoryObject
        ? subscriptionOffer?.slice(0, 1)
        : subscriptionOffer

    const priceForBackend = introductoryPrice || price

    const duration = getAndroidDurationSubscription({ billingPeriod: priceObject?.billingPeriod })

    return {
        ...rawSubscription,
        calculatedPricePerYear: pricePerYear,
        calculatedPricePerMonth: getCalculatedPricePerMonth({
            currency,
            price,
            formattedPrice,
            productId,
        }),
        summary,
        productId,
        id: productId,
        currency,
        planName: getPlanName({
            formattedPrice,
            productId,
            isTrialAvailable,
            isAgeExp,
            planOfferName,
            planOfferNameNew,
            planNameSpecialOffer,
        }),
        badgeText: getBadgeText({
            productId,
            isAgeExp,
            isTrialAvailable,
            isShowTourBadge,
        }),
        textAboveButton: textAboveButton({
            productId,
            formattedPrice,
            isTrialAvailable,
        }),
        featureList: getFeatureList(productId),
        subscriptionOfferDetails: subscriptionOfferDetails || [],
        customPlanName: getCustomPlanName({ productId }),
        customFeatureList: getCustomFeatureList(productId),
        price: priceForBackend,
        usdPrice: getUsdPriceByProductId({ productId }),
        duration,
        ugPlanLineup: getUgPlanLineup({
            productId,
            duration,
            isIntroductory: !!introductoryPrice,
            isTrialAvailable,
            planOfferName,
            formattedPrice,
            formattedIntroductoryPrice,
            price: priceForBackend,
            currency,
        }),
        trialStatus: isTrialAvailable
            ? getAndroidTrialDurationSubscription({
                  billingPeriod: intradactoryObject?.billingPeriod,
              })
            : '',
        formattedPrice,
        formattedIntroductoryPrice,
        isTrialAvailable,
        planNameType: getPlanNameTypeByProductId({ productId }),
        buttonText: getButtonText({
            isTrialAvailable,
            productId,
        }),
        formattedPricePerWeek: formattedPricePerWeek ? getPricePerWeek(formattedPricePerWeek) : '',
        isIntroductory: !!introductoryPrice,
        creditsCount: getCreditsNumberByProductId({ productId }),
    }
}

export const subscriptionMap = platform.isAndroid ? subscriptionMapAndroid : subscriptionMapIos
