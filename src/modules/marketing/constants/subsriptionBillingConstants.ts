import type { SubscriptionPeriodIOS } from 'react-native-iap'

import { getStoreValue, platform } from '@mu-native/common'
import { localizeMillions, translate } from '@mu-native/locale'

import { getCurrencyWithPrice, getPriceWithCurrency } from '../helpers/price'
import marketingStoreChunk from '../store/marketingStoreChunk.ts'
import type { TProductId, TUgPlanLineup } from '../types/marketingTypes'

import { marketingConstants } from './marketingConstants'

const {
    monthLearnSubscriptionId,
    yearLearnSubscriptionId,
    instantLearnSubscriptionId,
    instantOneSubscriptionId,
    premiumYearSubscriptionId,
    premiumQuarterlySubscriptionId,
    flashSaleSubscriptionId,
    yearTrialLearnLiteSubscriptionId,
    instantLearnLiteSubscriptionId,
    monthLearnLiteSubscriptionId,
    monthLiteSubscriptionInstantId,
    instant75OffLiteSubscriptionId,
    yearLiteSubscriptionId,
    instantLiteSubscriptionId,
    expansiveInstantLiteSubscriptionId,
    instantOffScoresLiteSubscriptionId,
    monthOffScoresLiteSubscriptionId,
    yearOffScoresLiteSubscriptionId,
    year70OffScoresLiteSubscriptionId,
    year75OffScoresLiteSubscriptionId,
    museScoreProPlusTitle,
    weekProSubscriptionId,
    weekOffScoresSubscriptionId,
    offScores99SubscriptionIdTrial,
    offScores69SubscriptionId,
    offScores59SubscriptionId,
    pro69SubscriptionId,
    yearLearnLiteTrialExpSubscriptionId,
    yearLearnLiteExpSubscriptionId,
    monthLearnLiteExpSubscriptionId,
    proMonth10SubscriptionId,
    offScoresMonth16SubscriptionId,
    year99OffScoresLiteSubscriptionId,
    offScoresTrial69LiteSubscriptionId,
    ebookYearTrialSubscriptionId,
    ebookWeekSubscriptionId,
    ebookYearInstantSubscriptionId,
    pro39SubscriptionId,
    pro59SubscriptionId,
    offScores49SubscriptionId,
    offScores79SubscriptionId,
    offScores1month19SubscriptionId,
    offScores1week15SubscriptionId,
    proPlusAutoGradeInstantSubscriptionId,
    proPlusAutoGradeWeekSubscriptionId,
    proPlusAutoGradeMonthSubscriptionId,
    trialLearn80SaleId,
    instantLearn80SaleId,
    monthOneSubscriptionId,
    yearOneSubscriptionId,
    proYearIntroductory,
    proIntroductoryAnniversaryYear,
    offScoresYearIntroductoryAnniversary,
    offScoresYearIntroductory,
    yearOneTrial199SubscriptionId,
    yearLearn180,
    offScores55SubscriptionId,
    pro45SubscriptionId,
    yearLearnTrial2025ProductId,
    yearLearn2025ProductId,
    yearLearnTrial2026ProductId,
    yearLearn2026ProductId,
    monthLearn2026ProductId,
    monthLearn2025ProductId,
    offScores2025YearTrialProductId,
    offScores2025YearInstantIntroductoryProductId,
    offScores2025MonthProductId,
    pro2025YearInstantIntroductoryProductId,
    pro2025YearTrialProductId,
    pro2025MonthProductId,
    offScoresYearWithCreditsProductId,
    offScores149YearTrialProductId,
    offScores99YearIntroProductId,
    yearLearnBundleOffScoresTrialProductId,
    yearLearnBundleOffScoresProductId,
    monthLearnBundleOffScoresProductId,
    yearLearnBundleOffScores179TrialProductId,
    yearLearnBundleOffScores179IntroProductId,
    monthLearnBundleOffScores1999ProductId,
    monthLearnBundleOffScores2999ProductId,
    quarterLearnBundleOffScores59ProductId,
} = marketingConstants

const getWeeklyTitle = () => translate('native.marketing.weekly_access')
const getCancelAnytime = () => translate('native.marketing.cancelAnytime')

const getPricePerYear = (price: string) =>
    translate('native.marketing.price_line.per_year', { price })
const getPricePerMonth = (price: string) =>
    translate('native.marketing.price_line.per_month', { price })
const getPricePerWeek = (price: string) =>
    translate('native.marketing.price_line.per_week', { price })
const getPricePerMonths = (price: string, count: number) =>
    translate('native.marketing.price_line.per_months', { price, count })

const getMonthsAtPricePerMonth = (count: number, price: string) =>
    translate('native.marketing.price_line.months_at_per_month', { count, price })

/** `oldPrice` is the struck-out price shown before the actual one; empty when there is none. */
const getWeeksAtPricePerWeek = (count: number, price: string, oldPrice = '') =>
    oldPrice
        ? translate('native.marketing.price_line.weeks_at_old_price_per_week', {
              count,
              price,
              oldPrice,
          })
        : translate('native.marketing.price_line.weeks_at_per_week', { count, price })

const getDaysAtPricePerWeek = (count: number, price: string, oldPrice = '') =>
    oldPrice
        ? translate('native.marketing.price_line.days_at_old_price_per_week', {
              count,
              price,
              oldPrice,
          })
        : translate('native.marketing.price_line.days_at_per_week', { count, price })

const getFirstYearThenPerYear = ({
    introPrice,
    price,
    isPriceBold = false,
}: {
    introPrice: string
    price: string
    isPriceBold?: boolean
}) =>
    isPriceBold
        ? translate('native.marketing.price_line.first_year_then_per_year_bold', {
              introPrice,
              price,
          })
        : translate('native.marketing.price_line.first_year_then_per_year', { introPrice, price })

const getSavePercentLabel = (percent: number | string) =>
    translate('native.marketing.badge.save_percent', { percent: String(percent) })

const getPlanNameSpecial = () => translate('native.marketing.special_limited_offer')
const getWelcomeOffer = ({ planOfferName = '', planOfferNameNew = '', discount = '65' }) => {
    const percent = discount.replace('%', '')

    return planOfferNameNew
        ? planOfferNameNew.replace('saveText', getSavePercentLabel(percent))
        : translate('native.marketing.offer.name_save_percent', {
              offerName: planOfferName,
              percent,
          })
}

const getPersonalOfferTitle = (discountValue: string) =>
    translate('native.marketing.personal_offer_save', { discount: discountValue })

const getPersonalOfferDiscount = (productId: TProductId): string | undefined =>
    (
        ({
            [proIntroductoryAnniversaryYear]: marketingConstants.anniversaryDiscount,
            [offScoresYearIntroductoryAnniversary]: marketingConstants.anniversaryDiscount,
            [instant75OffLiteSubscriptionId]: platform.isIos ? '90%' : '77%',
            [year75OffScoresLiteSubscriptionId]: platform.isIos ? '90%' : '77%',
        }) as Partial<Record<TProductId, string>>
    )[productId]

const getNamedPersonalOfferTitle = (productId: TProductId, username: string) => {
    const discountValue = getPersonalOfferDiscount(productId)
    return discountValue
        ? translate('native.marketing.personal_offer_save_named', {
              username,
              discount: discountValue,
          })
        : undefined
}

const discount = {
    pro: platform.isIos ? '77' : '66.6',
    one: platform.isIos ? '58' : '58.3',
    learn: '50',
    learnExp: '53',
    learnBundle: '67',
    offScoresFlash: '87',
}

type TFeature = { title: string; isDisabled: boolean }

const getFeaturesList = (
    isAccessOffScoresDisabled: boolean,
    isExportDisabled: boolean,
    isToolsDisabled: boolean,
    isCoursesDisabled: boolean,
    isOneCourseDisabled: boolean,
    isSongBooksDisabled: boolean,
) => [
    {
        title: translate('native.marketing.feature.access_offscores'),
        isDisabled: isAccessOffScoresDisabled,
    },
    {
        title: translate('native.marketing.download_community_scores_title'),
        isDisabled: isExportDisabled,
    },
    {
        title: translate('native.marketing.mixer_metronome_hq_title'),
        isDisabled: isToolsDisabled,
    },
    {
        title: translate('native.marketing.unlimited_access_courses_title'),
        isDisabled: isCoursesDisabled,
    },
    {
        title: translate('native.marketing.editors_picks_title'),
        isDisabled: isOneCourseDisabled,
    },
    {
        title: translate('native.marketing.access_songbook_title'),
        isDisabled: isSongBooksDisabled,
    },
]

export const getProFeatures = () => getFeaturesList(true, false, false, true, true, true)
export const getLearnFeatures = () => getFeaturesList(true, true, true, false, true, true)
export const getOffScoresFeatures = () => getFeaturesList(false, false, false, true, false, true)
export const getLearnLiteFeatures = () => getFeaturesList(true, true, true, true, false, true)
export const getEbooksFeatures = () => getFeaturesList(true, true, true, true, true, false)
export const getOneFeatures = () => getFeaturesList(false, false, false, false, true, false)

const customFeatureListByProductId: Partial<Record<TProductId, () => TFeature[]>> = {
    [offScores69SubscriptionId]: getOffScoresFeatures,
    [instantOffScoresLiteSubscriptionId]: getOffScoresFeatures,
    [expansiveInstantLiteSubscriptionId]: getProFeatures,
    [instantLiteSubscriptionId]: getProFeatures,
    [instantLearnSubscriptionId]: getLearnFeatures,
    [instantLearnLiteSubscriptionId]: getLearnLiteFeatures,
    [yearLearnLiteExpSubscriptionId]: getLearnLiteFeatures,
    [instantOneSubscriptionId]: getOneFeatures,
    [pro69SubscriptionId]: getProFeatures,
    [yearLiteSubscriptionId]: getProFeatures,
    [yearOneSubscriptionId]: getOneFeatures,
    [yearOneTrial199SubscriptionId]: getOneFeatures,
    [yearLearnLiteTrialExpSubscriptionId]: getLearnLiteFeatures,
    [offScores99SubscriptionIdTrial]: getOffScoresFeatures,
    [offScores149YearTrialProductId]: getOffScoresFeatures,
    [yearOffScoresLiteSubscriptionId]: getOffScoresFeatures,
    [ebookYearInstantSubscriptionId]: getEbooksFeatures,
    [proPlusAutoGradeInstantSubscriptionId]: () =>
        getOneFeatures().map(item => ({ ...item, isDisabled: true })),
    [yearLearnBundleOffScores179IntroProductId]: getOneFeatures,
    [yearLearnBundleOffScoresProductId]: getOneFeatures,
}

const featureListByProductId: Partial<Record<TProductId, () => TFeature[]>> = {
    [instantOneSubscriptionId]: () => [
        {
            title: translate('native.marketing.feature.scores_millions_ad_free', {
                scoresMillions: localizeMillions(
                    getStoreValue(marketingStoreChunk.props.getContentFields).scoresAll,
                ),
            }),
            isDisabled: false,
        },
        {
            title: translate('native.screen_tour.score_list_feature'),
            isDisabled: false,
        },
        {
            title: translate('native.screen_tour.score_official_feature'),
            isDisabled: false,
        },
        {
            title: translate('native.marketing.feature.courses_count_experts', {
                count: marketingConstants.coursesCount,
            }),
            isDisabled: false,
        },
    ],
}

const getCustomFeatureList = (productId: TProductId): TFeature[] =>
    customFeatureListByProductId[productId]?.() || []

const getFeatureList = (productId: TProductId): TFeature[] =>
    featureListByProductId[productId]?.() || []

const getCalculatedPricePerYear = ({
    currency,
    price,
    formattedPrice,
    formattedIntroductoryPrice,
    productId,
}: {
    currency: string
    price: number
    formattedPrice: string
    formattedIntroductoryPrice: string
    productId: string | number
}) =>
    ({
        [monthLearnSubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthOneSubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [yearLearnSubscriptionId]: formattedPrice,
        [instantLearnSubscriptionId]: formattedIntroductoryPrice,
        [instantOneSubscriptionId]: formattedPrice,
        [flashSaleSubscriptionId]: formattedPrice,
        [monthLiteSubscriptionInstantId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthOffScoresLiteSubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearnLiteSubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearnLiteExpSubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearn2025ProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearn2026ProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [offScores2025MonthProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [pro2025MonthProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [offScores1month19SubscriptionId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearnBundleOffScores1999ProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearnBundleOffScores2999ProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
        [monthLearnBundleOffScoresProductId]: getPriceWithCurrency({
            price: price * 12,
            currency,
        }),
    })[productId] || ''

const getCalculatedPricePerMonth = ({
    currency,
    price,
    formattedPrice,
    productId,
}: {
    currency: string
    price: number
    formattedPrice: string
    productId: string | number
}) =>
    ({
        [monthLearnSubscriptionId]: formattedPrice,
        [yearLearnSubscriptionId]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [instantOneSubscriptionId]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [flashSaleSubscriptionId]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [instant75OffLiteSubscriptionId]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [instant75OffLiteSubscriptionId]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [offScoresYearIntroductoryAnniversary]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
        [proIntroductoryAnniversaryYear]: getPriceWithCurrency({
            price: Number((price / 12).toFixed(2)),
            currency,
        }),
    })[productId] || ''

const getBadgeTitle = () =>
    platform.isIos
        ? translate('native.marketing.most_popular')
        : translate('native.marketing.best_value')

const getBadgeText = ({
    productId,
    isAgeExp = false,
    isTrialAvailable,
    isShowTourBadge,
}: {
    productId: TProductId
    isAgeExp: boolean
    isTrialAvailable: boolean
    isShowTourBadge: boolean
}) => {
    const trialBadgeTitle = isTrialAvailable
        ? translate('native.marketing.free_trial')
        : getSavePercentLabel(40)
    const trialTourTitle = isShowTourBadge ? trialBadgeTitle : ''

    return (
        {
            [offScoresYearIntroductory]: getBadgeTitle(),
            [proYearIntroductory]: getBadgeTitle(),
            [proPlusAutoGradeInstantSubscriptionId]: getBadgeTitle(),
            [year70OffScoresLiteSubscriptionId]: museScoreProPlusTitle,
            [instantLiteSubscriptionId]: getBadgeTitle(),
            [offScores59SubscriptionId]: museScoreProPlusTitle,
            [offScores59SubscriptionId]: museScoreProPlusTitle,
            [expansiveInstantLiteSubscriptionId]: getBadgeTitle(),
            [instantLearnSubscriptionId]: getBadgeTitle(),
            [instantLearnLiteSubscriptionId]: getBadgeTitle(),
            [yearLearnLiteExpSubscriptionId]: getBadgeTitle(),
            [instantOneSubscriptionId]: getBadgeTitle(),
            [instantOffScoresLiteSubscriptionId]: getBadgeTitle(),
            [flashSaleSubscriptionId]: getSavePercentLabel(70),
            [offScores69SubscriptionId]: platform.isIos ? getBadgeTitle() : getSavePercentLabel(40),
            [monthLiteSubscriptionInstantId]: isAgeExp ? getBadgeTitle() : '',
            [monthOffScoresLiteSubscriptionId]: isAgeExp ? getBadgeTitle() : '',
            [yearOffScoresLiteSubscriptionId]: trialTourTitle,
            [year99OffScoresLiteSubscriptionId]: getSavePercentLabel(87),
            [offScoresTrial69LiteSubscriptionId]: trialBadgeTitle,
            [offScores99SubscriptionIdTrial]: trialTourTitle,
            [ebookYearInstantSubscriptionId]: getBadgeTitle(),
            [pro39SubscriptionId]: getBadgeTitle(),
            [offScores49SubscriptionId]: getBadgeTitle(),
            [proIntroductoryAnniversaryYear]: '',
            [offScoresYearIntroductoryAnniversary]: '',
            [yearLearn180]: getBadgeTitle(),
            [pro45SubscriptionId]: getBadgeTitle(),
            [offScores55SubscriptionId]: getBadgeTitle(),
            [offScores2025YearInstantIntroductoryProductId]: getBadgeTitle(),
            [yearLearn2025ProductId]: getBadgeTitle(),
            [yearLearn2026ProductId]: getBadgeTitle(),
            [pro2025YearInstantIntroductoryProductId]: getBadgeTitle(),
            [offScores99YearIntroProductId]: getBadgeTitle(),
            [yearLearnBundleOffScores179IntroProductId]: getBadgeTitle(),
            [yearLearnBundleOffScoresProductId]: getBadgeTitle(),
        }[productId] || ''
    )
}

const getLearnLiteBundleName = (plan: string) =>
    translate('native.marketing.plan_with_learn_lite_bundle', { plan })
const getOffScoresBundleName = () => getLearnLiteBundleName('MuseScore Pro+')

const getCustomPlanName = ({ productId }: { productId: TProductId }) =>
    ({
        [marketingConstants.instantOffScoresLiteSubscriptionId]: getOffScoresBundleName(),
        [offScores69SubscriptionId]: getOffScoresBundleName(),
        [marketingConstants.instantLearnSubscriptionId]: 'MuseScore Learn',
        [marketingConstants.instantLearnLiteSubscriptionId]: 'MuseScore Learn Lite',
        [marketingConstants.yearLearnLiteExpSubscriptionId]: 'MuseScore Learn Lite',
        [marketingConstants.instantOneSubscriptionId]: 'MuseScore One',
        [expansiveInstantLiteSubscriptionId]: 'MuseScore Pro',
        [marketingConstants.pro69SubscriptionId]: 'MuseScore Pro',
        [marketingConstants.yearLiteSubscriptionId]: 'MuseScore Pro',
        [marketingConstants.yearOneSubscriptionId]: 'MuseScore One',
        [marketingConstants.yearOneTrial199SubscriptionId]: 'MuseScore One',
        [marketingConstants.yearLearnLiteTrialExpSubscriptionId]: 'MuseScore Learn Lite',
        [marketingConstants.offScores99SubscriptionIdTrial]: getOffScoresBundleName(),
        [marketingConstants.yearOffScoresLiteSubscriptionId]: getOffScoresBundleName(),
        [platform.isIos
            ? marketingConstants.weekProSubscriptionId
            : marketingConstants.monthLiteSubscriptionInstantId]: translate(
            'native.marketing.regular_price',
        ),
        [platform.isIos
            ? marketingConstants.weekOffScoresSubscriptionId
            : marketingConstants.monthOffScoresLiteSubscriptionId]: translate(
            'native.marketing.regular_price',
        ),
        [proPlusAutoGradeInstantSubscriptionId]: translate('native.marketing.stay_free'),
        [ebookYearInstantSubscriptionId]: 'MuseScore Digital Books',
        [yearLearnBundleOffScoresProductId]: 'MuseScore Learn & Pro+',
        [yearLearnBundleOffScores179IntroProductId]: 'MuseScore Learn & Pro+',
    })[productId]

const getPlanName = ({
    isTrialAvailable,
    formattedPrice,
    productId,
    isAgeExp,
    planOfferName,
    planOfferNameNew,
    planNameSpecialOffer,
}: {
    isTrialAvailable: boolean
    formattedPrice: string
    productId: string | number
    isAgeExp: boolean
    planOfferName: string
    planOfferNameNew: string
    planNameSpecialOffer: string
}) => {
    const trialTitle = isTrialAvailable
        ? translate('native.marketing.price_line.trial_then_per_year', { price: formattedPrice })
        : translate('native.marketing.price_line.annual_access_per_year', {
              price: formattedPrice,
          })
    const monthTrialTitle = isTrialAvailable
        ? translate('native.marketing.price_line.trial_then_per_month', { price: formattedPrice })
        : translate('native.marketing.price_line.annual_access_then_per_month', {
              price: formattedPrice,
          })

    const monthTitle = translate('native.screen_tour.monthly_access')
    const quarterlyTitle = translate('native.marketing.quarterly_access')

    return {
        [proYearIntroductory]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [offScoresYearIntroductory]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [proIntroductoryAnniversaryYear]: getPersonalOfferTitle(
            getPersonalOfferDiscount(proIntroductoryAnniversaryYear)!,
        ),
        [offScoresYearIntroductoryAnniversary]: getPersonalOfferTitle(
            getPersonalOfferDiscount(offScoresYearIntroductoryAnniversary)!,
        ),
        [proPlusAutoGradeInstantSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [proPlusAutoGradeWeekSubscriptionId]: getWeeklyTitle(),
        [proPlusAutoGradeMonthSubscriptionId]: monthTitle,
        [monthOneSubscriptionId]: monthTitle,
        [ebookYearTrialSubscriptionId]: trialTitle,
        [yearOneSubscriptionId]: trialTitle,
        [yearOneTrial199SubscriptionId]: trialTitle,
        [ebookWeekSubscriptionId]: getWeeklyTitle(),
        [ebookYearInstantSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: '90',
        }),
        [offScoresTrial69LiteSubscriptionId]: trialTitle,
        [year99OffScoresLiteSubscriptionId]: translate('native.marketing.yearly_plan'),
        [offScoresMonth16SubscriptionId]: monthTrialTitle,
        [proMonth10SubscriptionId]: monthTrialTitle,
        [offScores59SubscriptionId]: getWelcomeOffer({
            planOfferName: planNameSpecialOffer || getPlanNameSpecial(),
            discount: '80',
        }),
        [offScores69SubscriptionId]: platform.isAndroid
            ? translate('native.marketing.yearly_access')
            : getWelcomeOffer({ planOfferName, planOfferNameNew, discount: discount.pro }),
        [instantOneSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.one,
        }),
        [monthLearnSubscriptionId]: monthTitle,
        [yearLearnSubscriptionId]: trialTitle,
        [instantLearnSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learn,
        }),
        [flashSaleSubscriptionId]: translate('native.screen_tour.annual_access'),
        [instant75OffLiteSubscriptionId]: getPersonalOfferTitle(
            getPersonalOfferDiscount(instant75OffLiteSubscriptionId)!,
        ),
        [yearLearnSubscriptionId]: trialTitle,
        [monthOffScoresLiteSubscriptionId]: isAgeExp
            ? getWelcomeOffer({
                  planOfferName,
                  planOfferNameNew,
                  discount: '60%',
              })
            : monthTitle,
        [instantOffScoresLiteSubscriptionId]: getWelcomeOffer({
            planOfferName: translate('native.marketing.flash_sale.title'),
            discount: discount.offScoresFlash,
        }),
        [yearOffScoresLiteSubscriptionId]: trialTitle,
        [year70OffScoresLiteSubscriptionId]: getWelcomeOffer({
            planOfferName: planNameSpecialOffer || getPlanNameSpecial(),
            discount: '70',
        }),
        [year75OffScoresLiteSubscriptionId]: getPersonalOfferTitle(
            getPersonalOfferDiscount(year75OffScoresLiteSubscriptionId)!,
        ),
        [instantLiteSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [monthLiteSubscriptionInstantId]: isAgeExp
            ? getWelcomeOffer({
                  planOfferName,
                  planOfferNameNew,
                  discount: '60',
              })
            : monthTitle,
        [yearLiteSubscriptionId]: trialTitle,
        [expansiveInstantLiteSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: platform.isIos ? discount.pro : '40',
        }),
        [yearLearnLiteTrialExpSubscriptionId]: trialTitle,
        [yearLearnLiteExpSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learn,
        }),
        [monthLearnLiteExpSubscriptionId]: monthTitle,
        [yearTrialLearnLiteSubscriptionId]: trialTitle,
        [instantLearnLiteSubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learn,
        }),
        [monthLearnLiteSubscriptionId]: monthTitle,
        [yearOffScoresLiteSubscriptionId]: trialTitle,
        [offScores99SubscriptionIdTrial]: trialTitle,
        [pro69SubscriptionId]: trialTitle,
        [weekProSubscriptionId]: getWeeklyTitle(),
        [weekOffScoresSubscriptionId]: getWeeklyTitle(),
        [pro59SubscriptionId]: trialTitle,
        [offScores79SubscriptionId]: trialTitle,
        [offScores1week15SubscriptionId]: getWeeklyTitle(),
        [pro45SubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: platform.isIos ? '72' : '55',
        }),
        [offScores55SubscriptionId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: platform.isIos ? '72' : '55',
        }),

        [offScores2025YearTrialProductId]: trialTitle,
        [offScores2025YearInstantIntroductoryProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [offScores2025MonthProductId]: monthTitle,
        [pro2025YearTrialProductId]: trialTitle,
        [pro2025MonthProductId]: monthTitle,
        [pro2025YearInstantIntroductoryProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.pro,
        }),
        [monthLearn2025ProductId]: monthTitle,
        [monthLearn2026ProductId]: monthTitle,
        [yearLearnTrial2025ProductId]: trialTitle,
        [yearLearnTrial2026ProductId]: trialTitle,
        [yearLearn2026ProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learnExp,
        }),
        [yearLearn2025ProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learn,
        }),
        [offScores149YearTrialProductId]: trialTitle,
        [offScores1month19SubscriptionId]: monthTitle,
        [monthLearnBundleOffScoresProductId]: monthTitle,
        [yearLearnBundleOffScoresTrialProductId]: trialTitle,
        [yearLearnBundleOffScoresProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learnExp,
        }),
        [monthLearnBundleOffScores1999ProductId]: monthTitle,
        [monthLearnBundleOffScores2999ProductId]: monthTitle,
        [quarterLearnBundleOffScores59ProductId]: quarterlyTitle,
        [yearLearnBundleOffScores179TrialProductId]: trialTitle,
        [yearLearnBundleOffScores179IntroProductId]: getWelcomeOffer({
            planOfferName,
            planOfferNameNew,
            discount: discount.learnBundle,
        }),
    }[productId]
}

const getSummary = ({
    yearPlanPriceSplashmonth,
    productId,
    priceSplashyear,
    priceSplashmonth,
    priceSplashYearForMonthPlan,
    introductorySummary,
    monthPlanWeekPrice,
    formattedPrice,
    monthWeeklyPlanPerYear,
    isAgeExp,
    price,
    currentPriceForShowingDiscount,
    currency,
}: {
    yearPlanPriceSplashmonth: string
    productId: TProductId
    priceSplashyear: string
    priceSplashmonth: string
    priceSplashYearForMonthPlan: string
    introductorySummary: string
    monthPlanWeekPrice: string
    formattedPrice: string
    monthWeeklyPlanPerYear: string
    isAgeExp: boolean
    price: number
    currentPriceForShowingDiscount: string
    currency: string
    isTrialAvailable: boolean
    introductoryWeeklySummary?: string
}) => {
    const yearPlanPricePerWeek = getPriceWithCurrency({
        price: Number((price / 52).toFixed(2)),
        currency,
    })
    const instantWeeksSummary = `${getWeeksAtPricePerWeek(52, yearPlanPricePerWeek, currentPriceForShowingDiscount)}. [sb]${priceSplashyear}[/sb]`
    const yearPlanPriceSplashWeeks = getWeeksAtPricePerWeek(52, yearPlanPricePerWeek)
    const trialTitle = `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`
    const monthDaysAtSummary = `${getCancelAnytime()}. ${getDaysAtPricePerWeek(30, monthPlanWeekPrice)}`
    const weeklySummary = `[sb]${getPricePerWeek(formattedPrice)}[/sb]. ${
        isAgeExp
            ? getPricePerMonth(((price / 7) * 30).toFixed(2))
            : getPricePerYear(monthWeeklyPlanPerYear)
    }`

    const monthSummary = isAgeExp
        ? `${getDaysAtPricePerWeek(30, monthPlanWeekPrice, currentPriceForShowingDiscount)}. [sb]${priceSplashmonth}[/sb].`
        : `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`

    const instantSummary = `${yearPlanPriceSplashmonth}. [sb]${priceSplashyear}[/sb]`
    const cancelAnyTimeSplashMonthSummary = `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`

    const quarterlyPlanPricePerMonth = getPriceWithCurrency({
        price: Number((price / 3).toFixed(2)),
        currency,
    })
    const quarterlyPlanPriceSplashMonth = getMonthsAtPricePerMonth(3, quarterlyPlanPricePerMonth)
    const priceSplash3Months = getPricePerMonths(formattedPrice, 3)
    const quarterlySummary = `${quarterlyPlanPriceSplashMonth}. [sb]${priceSplash3Months}[/sb]`

    return (
        {
            [proPlusAutoGradeInstantSubscriptionId]: platform.isIos
                ? instantWeeksSummary
                : instantSummary,
            [proPlusAutoGradeWeekSubscriptionId]: `[sb]${getPricePerWeek(formattedPrice)}[/sb]. ${getPricePerYear(monthWeeklyPlanPerYear)}`,
            [proPlusAutoGradeMonthSubscriptionId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [offScoresTrial69LiteSubscriptionId]: instantSummary,
            [monthLearnSubscriptionId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [yearLearnSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`,
            [instantLearnSubscriptionId]: introductorySummary,
            [flashSaleSubscriptionId]: instantSummary,
            [instantOneSubscriptionId]: `${translate(
                'native.marketing.price_line.one_instant_discount',
                { percent: discount.one },
            )}. ${instantSummary}`,
            [yearOneSubscriptionId]: instantSummary,
            [yearOneTrial199SubscriptionId]: trialTitle,
            [monthOneSubscriptionId]: monthSummary,
            [instantOffScoresLiteSubscriptionId]: instantSummary,
            [monthOffScoresLiteSubscriptionId]: monthSummary,
            [yearOffScoresLiteSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`,
            [year70OffScoresLiteSubscriptionId]: instantSummary,
            [year75OffScoresLiteSubscriptionId]: instantSummary,
            [instantLiteSubscriptionId]: instantSummary,
            [monthLiteSubscriptionInstantId]: monthSummary,
            [yearLiteSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`,
            [instant75OffLiteSubscriptionId]: instantSummary,
            [expansiveInstantLiteSubscriptionId]: instantSummary,
            [offScores69SubscriptionId]: instantSummary,
            [yearTrialLearnLiteSubscriptionId]: trialTitle,
            [instantLearnLiteSubscriptionId]: introductorySummary,
            [monthLearnLiteSubscriptionId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [weekProSubscriptionId]: weeklySummary,
            [weekOffScoresSubscriptionId]: weeklySummary,
            [yearLearnLiteTrialExpSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashmonth}`,
            [yearLearnLiteExpSubscriptionId]: introductorySummary,
            [monthLearnLiteExpSubscriptionId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [offScoresMonth16SubscriptionId]: monthDaysAtSummary,
            [proMonth10SubscriptionId]: monthDaysAtSummary,
            [ebookWeekSubscriptionId]: `[sb]${getPricePerWeek(formattedPrice)}[/sb]. ${getPricePerYear(monthWeeklyPlanPerYear)}`,
            [ebookYearTrialSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashWeeks}`,
            [ebookYearInstantSubscriptionId]: instantWeeksSummary,
            [pro59SubscriptionId]: cancelAnyTimeSplashMonthSummary,
            [pro39SubscriptionId]: instantSummary,
            [offScores79SubscriptionId]: cancelAnyTimeSplashMonthSummary,
            [offScores49SubscriptionId]: instantSummary,

            [proIntroductoryAnniversaryYear]: introductorySummary,
            [proYearIntroductory]: introductorySummary,
            [offScoresYearIntroductory]: introductorySummary,
            [offScoresYearIntroductoryAnniversary]: introductorySummary,
            [pro69SubscriptionId]: trialTitle,
            [yearLiteSubscriptionId]: trialTitle,
            [offScores99SubscriptionIdTrial]: trialTitle,
            [yearOffScoresLiteSubscriptionId]: trialTitle,
            [yearLearnLiteTrialExpSubscriptionId]: trialTitle,
            [yearLearn180]: instantSummary,
            [pro45SubscriptionId]: instantSummary,
            [offScores55SubscriptionId]: instantSummary,
            [premiumYearSubscriptionId]: instantSummary,
            [premiumQuarterlySubscriptionId]: quarterlySummary,

            [offScores2025YearTrialProductId]: trialTitle,
            [offScores2025YearInstantIntroductoryProductId]: introductorySummary,
            [offScores2025MonthProductId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [pro2025YearTrialProductId]: trialTitle,
            [pro2025MonthProductId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [pro2025YearInstantIntroductoryProductId]: introductorySummary,
            [monthLearn2025ProductId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [monthLearn2026ProductId]: `[sb]${priceSplashmonth}[/sb]. ${priceSplashYearForMonthPlan}`,
            [yearLearnTrial2025ProductId]: trialTitle,
            [yearLearnTrial2026ProductId]: trialTitle,
            [yearLearn2026ProductId]: introductorySummary,
            [yearLearn2025ProductId]: introductorySummary,
            [offScoresYearWithCreditsProductId]: introductorySummary,
            [offScores99YearIntroProductId]: introductorySummary,
            [offScores149YearTrialProductId]: trialTitle,
            [offScores1month19SubscriptionId]: monthSummary,

            [yearLearnBundleOffScoresTrialProductId]: trialTitle,
            [yearLearnBundleOffScoresProductId]: introductorySummary,
            [monthLearnBundleOffScoresProductId]: monthSummary,
            [yearLearnBundleOffScores179TrialProductId]: trialTitle,
            [yearLearnBundleOffScores179IntroProductId]: introductorySummary,
            [monthLearnBundleOffScores1999ProductId]: monthSummary,
            [monthLearnBundleOffScores2999ProductId]: monthSummary,
            [quarterLearnBundleOffScores59ProductId]: quarterlySummary,
        }[productId] || ''
    )
}

const textAboveButton = ({
    productId,
    isTrialAvailable,
    formattedPrice,
}: {
    productId: string | number
    isTrialAvailable: boolean
    formattedPrice: string
}) => {
    const trialText = isTrialAvailable
        ? translate('native.marketing.price_line.trial_per_year_cancel_anytime', {
              price: formattedPrice,
          })
        : formattedPrice
    return (
        {
            [yearLearnTrial2025ProductId]: trialText,
            [yearLearnTrial2026ProductId]: trialText,
            [pro69SubscriptionId]: trialText,
            [yearLearnSubscriptionId]: trialText,
            [yearTrialLearnLiteSubscriptionId]: trialText,
            [yearLiteSubscriptionId]: trialText,
            [yearOffScoresLiteSubscriptionId]: trialText,
            [offScoresTrial69LiteSubscriptionId]: trialText,
            [yearOneSubscriptionId]: trialText,
            [yearOneTrial199SubscriptionId]: trialText,
            [yearLearnLiteTrialExpSubscriptionId]: trialText,

            [offScores99SubscriptionIdTrial]: trialText,
            [year99OffScoresLiteSubscriptionId]: '',
            [offScores1month19SubscriptionId]: '',
            [offScores1week15SubscriptionId]: '',
            [offScores149YearTrialProductId]: trialText,
            [yearLearnBundleOffScoresTrialProductId]: trialText,
            [yearLearnBundleOffScores179TrialProductId]: trialText,
            [ebookYearTrialSubscriptionId]: trialText,
        }[productId] || ''
    )
}

const getSummaryWeeklyPlan = ({
    productId,
    currentPriceForShowingDiscount,
    priceSplashyear,
    price,
    currency,
}: {
    productId: TProductId
    currentPriceForShowingDiscount: string
    priceSplashyear: string
    price: number
    currency: string
}) => {
    const yearPlanPricePerWeek = getPriceWithCurrency({
        price: Number((price / 52).toFixed(2)),
        currency,
    })
    const instantWeeksSummary = `${getWeeksAtPricePerWeek(52, yearPlanPricePerWeek, currentPriceForShowingDiscount)}. [sb]${priceSplashyear}[/sb]`
    const yearPlanPriceSplashWeeks = getWeeksAtPricePerWeek(52, yearPlanPricePerWeek)

    return (
        {
            [expansiveInstantLiteSubscriptionId]: instantWeeksSummary,
            [instantLiteSubscriptionId]: instantWeeksSummary,
            [yearLiteSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashWeeks}`,
            [instantOffScoresLiteSubscriptionId]: instantWeeksSummary,
            [year70OffScoresLiteSubscriptionId]: instantWeeksSummary,
            [offScores59SubscriptionId]: instantWeeksSummary,
            [offScores69SubscriptionId]: instantWeeksSummary,
            [yearOffScoresLiteSubscriptionId]: `${getCancelAnytime()}. ${yearPlanPriceSplashWeeks}`,
            [pro69SubscriptionId]: '',
            [offScores99SubscriptionIdTrial]: ``,
            [year99OffScoresLiteSubscriptionId]: instantWeeksSummary,
        }[productId] || ''
    )
}

const getPriceForShowingDiscount = ({
    productId,
    priceForWeekWithoutCurrency,
    currency,
    price,
}: {
    productId: string
    priceForWeekWithoutCurrency: number
    price: number
    currency: string
}) =>
    ({
        [instantOffScoresLiteSubscriptionId]: getCurrencyWithPrice({
            price: priceForWeekWithoutCurrency * 7.78,
            currency,
        }),
        [expansiveInstantLiteSubscriptionId]: getCurrencyWithPrice({
            price: priceForWeekWithoutCurrency * 4.156,
            currency,
        }),
        [instantLiteSubscriptionId]: getCurrencyWithPrice({
            price: priceForWeekWithoutCurrency * 10.327,
            currency,
        }),
        [offScores69SubscriptionId]: getCurrencyWithPrice({
            price: priceForWeekWithoutCurrency * 4.44,
            currency,
        }),
        [monthOffScoresLiteSubscriptionId]: getCurrencyWithPrice({
            price: price * 0.6,
            currency,
        }),
        [monthLiteSubscriptionInstantId]: getCurrencyWithPrice({
            price: price * 0.6,
            currency,
        }),
        [year99OffScoresLiteSubscriptionId]: '',
        [offScoresTrial69LiteSubscriptionId]: '',
        [ebookYearInstantSubscriptionId]: getCurrencyWithPrice({
            price: price * 0.1999,
            currency,
        }),
        [offScores99SubscriptionIdTrial]: '',
        [offScores69SubscriptionId]: getCurrencyWithPrice({
            price: price * 0.0856,
            currency,
        }),
        [offScores49SubscriptionId]: getCurrencyWithPrice({
            price: price * 0.1998,
            currency,
        }),
        [pro39SubscriptionId]: getCurrencyWithPrice({
            price: price * 0.1747,
            currency,
        }),
    })[productId]

const getTrialPeriods = (period: SubscriptionPeriodIOS | 'DAY') =>
    ({
        DAY: 'days',
        WEEK: 'weeks',
        MONTH: 'month',
        YEAR: 'year',
        '': '',
    })[period.toUpperCase()] || 'days'
const getDurationSubscription = ({
    subscriptionPeriodUnitIOS,
    subscriptionPeriodNumberIOS,
}: {
    subscriptionPeriodUnitIOS: SubscriptionPeriodIOS
    subscriptionPeriodNumberIOS: string
}) =>
    ({
        DAY: `${subscriptionPeriodNumberIOS} days`,
        WEEK: `${subscriptionPeriodNumberIOS} weeks`,
        MONTH: `${subscriptionPeriodNumberIOS} month`,
        YEAR: `${12 * Number(subscriptionPeriodNumberIOS)} month`,
        '': '',
    })[subscriptionPeriodUnitIOS.toUpperCase()] || ''

const getAndroidDurationSubscription = ({ billingPeriod = '' }: { billingPeriod?: string }) =>
    ({
        P1Y: '12 month',
        P3M: '3 month',
        P1M: '1 month',
        P1W: '1 week',
    })[billingPeriod.toUpperCase()] || ''

const getAndroidTrialDurationSubscription = ({ billingPeriod = '' }: { billingPeriod?: string }) =>
    ({
        P1D: '7 days',
        P1W: '7 days',
    })[billingPeriod.toUpperCase()] || '7 days'

const getUsdPriceByProductId = ({ productId }: { productId: TProductId }) =>
    ({
        [monthLearnSubscriptionId]: '$19.99',
        [yearLearnSubscriptionId]: '$179.99',
        [instantLearnSubscriptionId]: '$119.99',
        [instantOneSubscriptionId]: '$149.99',
        [flashSaleSubscriptionId]: '$69.99',
        [yearTrialLearnLiteSubscriptionId]: '$179.99',
        [instantLearnLiteSubscriptionId]: '$105.99',
        [monthLearnLiteSubscriptionId]: '$17.99',
        [monthLiteSubscriptionInstantId]: '$6.99',
        [instant75OffLiteSubscriptionId]: '$19.99',
        [yearLiteSubscriptionId]: '$49.99',
        [instantLiteSubscriptionId]: '$29.99',
        [expansiveInstantLiteSubscriptionId]: '$49.99',
        [instantOffScoresLiteSubscriptionId]: '$39.99',
        [monthOffScoresLiteSubscriptionId]: '$9.99',
        [yearOffScoresLiteSubscriptionId]: '$69.99',
        [year70OffScoresLiteSubscriptionId]: '$35.99',
        [year75OffScoresLiteSubscriptionId]: '$29.99',
        [weekProSubscriptionId]: '$3.99',
        [weekOffScoresSubscriptionId]: '$5.99',
        [offScores99SubscriptionIdTrial]: '$99.99',
        [offScores69SubscriptionId]: '$69.99',
        [offScores59SubscriptionId]: '$59.99',
        [pro69SubscriptionId]: '$69.99',
        [yearLearnLiteTrialExpSubscriptionId]: '$29.99',
        [yearLearnLiteExpSubscriptionId]: '$19.99',
        [monthLearnLiteExpSubscriptionId]: '$3.39',
        [proMonth10SubscriptionId]: '$9.99',
        [offScoresMonth16SubscriptionId]: '$15.99',
        [year99OffScoresLiteSubscriptionId]: '$99.99',
        [offScoresTrial69LiteSubscriptionId]: '$69.99',
        [ebookYearTrialSubscriptionId]: '$149.99',
        [ebookWeekSubscriptionId]: '$19.99',
        [ebookYearInstantSubscriptionId]: '$99.99',
        [pro39SubscriptionId]: '$39.99',
        [pro59SubscriptionId]: '$59.99',
        [offScores49SubscriptionId]: '$49.99',
        [offScores79SubscriptionId]: '$79.99',
        [offScores1month19SubscriptionId]: '$19.99',
        [offScores1week15SubscriptionId]: '$14.99',
        [proPlusAutoGradeInstantSubscriptionId]: platform.isIos ? '$79.99' : '$49.99',
        [proPlusAutoGradeWeekSubscriptionId]: '$9.99',
        [proPlusAutoGradeMonthSubscriptionId]: '$12.49',
        [trialLearn80SaleId]: '$39.99',
        [instantLearn80SaleId]: '$39.99',
        [monthOneSubscriptionId]: '$29.99',
        [yearOneTrial199SubscriptionId]: '$199.99',
        [marketingConstants.offScoresYearWithCreditsProductId]: '$84.99',

        [proIntroductoryAnniversaryYear]: '$19.99',
        [proYearIntroductory]: '$49.99',
        [offScoresYearIntroductoryAnniversary]: '$29.99',
        [offScoresYearIntroductory]: '$69.99',
        [yearLearn180]: '$179.99',
        [offScores55SubscriptionId]: platform.isIos ? '$84.99' : '$54.99',
        [pro45SubscriptionId]: platform.isIos ? '$64.99' : '$44.99',
        [premiumYearSubscriptionId]: '$39.99',
        [premiumQuarterlySubscriptionId]: '$39.99',

        [yearLearnTrial2026ProductId]: '$189.99',
        [yearLearn2026ProductId]: '$189.99',
        [monthLearn2026ProductId]: '$24.99',

        [offScores149YearTrialProductId]: '$149.99',
        [offScores99YearIntroProductId]: '$99.99',

        [yearLearnBundleOffScoresTrialProductId]: '$189.99',
        [yearLearnBundleOffScoresProductId]: '$139.99',
        [monthLearnBundleOffScoresProductId]: '$24.99',
        [yearLearnBundleOffScores179TrialProductId]: '$179.99',
        [yearLearnBundleOffScores179IntroProductId]: '$119.99',
        [monthLearnBundleOffScores1999ProductId]: '$19.99',
        [monthLearnBundleOffScores2999ProductId]: '$29.99',
        [quarterLearnBundleOffScores59ProductId]: '$59.99',
        [yearLearn2025ProductId]: '$119.99',
    })[productId] || ''

const planNames = {
    pro: 'MuseScore Pro',
    offScores: 'MuseScore Pro+',
    learn: 'MuseScore Learn',
    learnLite: 'MuseScore Learn Lite',
    ebooks: 'MuseScore Digital Books',
    one: 'MuseScore One',
    get offScoresBundle() {
        return getOffScoresBundleName()
    },
    get proBundle() {
        return getLearnLiteBundleName('MuseScore Pro')
    },
    learnOffScoresBundle: 'MuseScore Learn & PRO+',
}

const getPlanNameTypeByProductId = ({ productId }: { productId: TProductId }) =>
    ({
        [offScores69SubscriptionId]: 'offScores',
        [instantOffScoresLiteSubscriptionId]: 'offScores',
        [instantLearnSubscriptionId]: 'learning',
        [ebookYearInstantSubscriptionId]: 'ebook',
    })[productId] || ''

const getButtonText = ({
    isTrialAvailable,
    productId,
}: {
    isTrialAvailable: boolean
    productId: TProductId
}) => {
    return (
        {
            [yearOffScoresLiteSubscriptionId]: isTrialAvailable
                ? translate('native.screen_tour.start_trial_text')
                : translate('native.screen_tour.start_now_text'),
            [yearLiteSubscriptionId]: isTrialAvailable
                ? translate('native.screen_tour.start_trial_text')
                : translate('native.screen_tour.start_now_text'),
        }[productId] || translate('native.screen_tour.start_now_text')
    )
}

const getCreditsNumberByProductId = ({ productId }: { productId: TProductId }) =>
    ({
        [offScoresYearWithCreditsProductId]: 2,
    })[productId] || 0

const MONTHLY_PLAN_DURATION = '1 month'
const QUARTERLY_PLAN_DURATION = '3 month'

const getUgYearlyPlanTitle = () => translate('native.marketing.ug_lineup.yearly_plan')
const getUgMonthlyPlanTitle = () => translate('native.screen_tour.monthly')
const getUgQuarterlyPlanTitle = () => translate('native.marketing.ug_lineup.quarterly')
const getUgWeeklyPlanTitle = () => translate('native.marketing.ug_lineup.weekly')
const getUgIntroTitleFallback = () => translate('native.marketing.ug_lineup.welcome_offer')
const ugInstantSavePercent = 50
const ugBundleInstantSavePercent = 67
const ugBundle189InstantSavePercent = 61

const getUgInstantSavePercent = (productId: TProductId) =>
    ({
        [yearLearnBundleOffScores179IntroProductId]: ugBundleInstantSavePercent,
        [yearLearnBundleOffScoresProductId]: ugBundle189InstantSavePercent,
    })[productId] ?? ugInstantSavePercent

const getUgSaveBadgeText = (percent: number) => getSavePercentLabel(percent)
const getUgSlashMoLabel = () => translate('native.marketing.slash_mo')

const getUgPlanLineup = ({
    productId,
    duration,
    isIntroductory,
    isTrialAvailable,
    planOfferName,
    formattedPrice,
    formattedIntroductoryPrice,
    price,
    currency,
}: {
    productId: TProductId
    duration: string
    isIntroductory: boolean
    isTrialAvailable: boolean
    planOfferName: string
    formattedPrice: string
    formattedIntroductoryPrice: string
    price: number
    currency: string
}): TUgPlanLineup => {
    if (duration.includes('week') || duration === '7 days') {
        return {
            title: getUgWeeklyPlanTitle(),
            subtitle: translate('native.marketing.ug_lineup.weeks_price', {
                count: 1,
                price: formattedPrice,
            }),
            badgeText: '',
            textAboveButton: '',
            pricePerMonth: getPriceWithCurrency({
                price: Number((price * 4).toFixed(2)),
                currency,
            }),
            priceSuffix: getUgSlashMoLabel(),
        }
    }

    if (duration === MONTHLY_PLAN_DURATION) {
        return {
            title: getUgMonthlyPlanTitle(),
            subtitle: '',
            badgeText: '',
            textAboveButton: '',
            pricePerMonth: formattedPrice,
            priceSuffix: getUgSlashMoLabel(),
        }
    }

    if (duration === QUARTERLY_PLAN_DURATION) {
        return {
            title: getUgQuarterlyPlanTitle(),
            subtitle: translate('native.marketing.ug_lineup.months_price', {
                count: 3,
                price: formattedPrice,
            }),
            badgeText: '',
            textAboveButton: '',
            pricePerMonth: getPriceWithCurrency({
                price: Number((price / 3).toFixed(2)),
                currency,
            }),
            priceSuffix: getUgSlashMoLabel(),
        }
    }

    const pricePerMonth = getPriceWithCurrency({
        price: Number((price / 12).toFixed(2)),
        currency,
    })

    if (isIntroductory) {
        return {
            title: planOfferName || getUgIntroTitleFallback(),
            subtitle: translate('native.marketing.ug_lineup.first_year_price', {
                price: formattedIntroductoryPrice || formattedPrice,
            }),
            badgeText: getUgSaveBadgeText(getUgInstantSavePercent(productId)),
            textAboveButton: translate('native.marketing.ug_lineup.first_year_for_free_cancel', {
                introPrice: formattedIntroductoryPrice || formattedPrice,
                price: formattedPrice,
            }),
            pricePerMonth,
            priceSuffix: getUgSlashMoLabel(),
        }
    }

    return {
        title: getUgYearlyPlanTitle(),
        subtitle: translate('native.marketing.ug_lineup.months_price', {
            count: 12,
            price: formattedPrice,
        }),
        badgeText: isTrialAvailable ? translate('native.screen_tour.free_trial_text') : '',
        textAboveButton: '',
        pricePerMonth,
        priceSuffix: getUgSlashMoLabel(),
    }
}

export {
    getBadgeText,
    getCalculatedPricePerMonth,
    getCalculatedPricePerYear,
    getCustomPlanName,
    getNamedPersonalOfferTitle,
    getPlanName,
    getPriceForShowingDiscount,
    getSummary,
    getSummaryWeeklyPlan,
    getWelcomeOffer,
    getCurrencyWithPrice,
    getPriceWithCurrency,
    getTrialPeriods,
    getDurationSubscription,
    getDaysAtPricePerWeek,
    getFirstYearThenPerYear,
    getMonthsAtPricePerMonth,
    getPricePerMonth,
    getPricePerWeek,
    getPricePerYear,
    getWeeksAtPricePerWeek,
    textAboveButton,
    getCustomFeatureList,
    getFeatureList,
    getUsdPriceByProductId,
    getAndroidDurationSubscription,
    getAndroidTrialDurationSubscription,
    planNames,
    getPlanNameTypeByProductId,
    getButtonText,
    getCreditsNumberByProductId,
    getUgPlanLineup,
}
