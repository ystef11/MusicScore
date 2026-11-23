import { translate } from '@mu-native/locale'

import { getOneFeatures } from '../../constants/subsriptionBillingConstants.ts'
import type { TCurrentSubscription, TProductId } from '../../types/marketingTypes'

export type TPurchaseSuccessPlanType =
    | 'one'
    | 'learnOffScores'
    | 'learnPro'
    | 'offScores'
    | 'pro'
    | 'learn'
    | 'learnLite'
    | 'ebook'

export type TPurchaseSuccessPlan = {
    type: TPurchaseSuccessPlanType
    info: TCurrentSubscription | null
    // separate subscriptions behind a combined plan, each billed on its own
    billingPlans?: TPurchaseSuccessPlan[]
}

export const purchaseSuccessPlanTitles: Record<TPurchaseSuccessPlanType, string> = {
    one: 'One',
    learnOffScores: 'Learn & Pro+',
    learnPro: 'Learn & Pro',
    offScores: 'Pro+',
    pro: 'Pro',
    learn: 'Learn',
    learnLite: 'Learn Lite',
    ebook: 'Book',
}

const getBundlePlans = (plans: TPurchaseSuccessPlan[]): TPurchaseSuccessPlan[] => {
    const offScoresInfo = plans.find(({ type }) => type === 'offScores')?.info
    const learnInfo = plans.find(({ type }) => type === 'learn')?.info
    const ebookInfo = plans.find(({ type }) => type === 'ebook')?.info

    if (
        !offScoresInfo?.productId ||
        offScoresInfo.productId !== learnInfo?.productId ||
        offScoresInfo.dateEndAccess !== learnInfo.dateEndAccess
    )
        return []

    const isOne = ebookInfo?.productId === offScoresInfo.productId

    return [
        {
            type: isOne ? 'one' : 'learnOffScores',
            info: { ...offScoresInfo, featureList: getOneFeatures() },
        },
    ]
}

export const getPurchaseSuccessPlan = ({
    productId,
    plans,
}: {
    productId: TProductId | ''
    plans: TPurchaseSuccessPlan[]
}) => {
    const plansWithBundle = [...getBundlePlans(plans), ...plans]

    return (
        plansWithBundle.find(({ info }) => !!productId && info?.productId === productId) ||
        plansWithBundle.find(({ info }) => info?.isActive)
    )
}

type TFeatureList = TCurrentSubscription['featureList']

const mergeFeatureLists = (first: TFeatureList, second: TFeatureList): TFeatureList => [
    ...first.map(feature => ({
        ...feature,
        isDisabled:
            feature.isDisabled &&
            (second.find(({ title }) => title === feature.title)?.isDisabled ?? true),
    })),
    ...second.filter(feature => !first.some(({ title }) => title === feature.title)),
]

const getActivePlan = (plans: TPurchaseSuccessPlan[], types: TPurchaseSuccessPlanType[]) =>
    plans.find(({ type, info }) => types.includes(type) && info?.isActive)

// Learn and Pro/Pro+ can be two separate subscriptions (e.g. an upsell on the tour after-sell)
export const getPurchaseSuccessCombinedPlan = (
    plan: TPurchaseSuccessPlan | undefined,
    plans: TPurchaseSuccessPlan[],
): TPurchaseSuccessPlan | undefined => {
    if (!plan?.info || !['learn', 'offScores', 'pro'].includes(plan.type)) return plan

    const isLearnPurchased = plan.type === 'learn'
    const learnPlan = isLearnPurchased ? plan : getActivePlan(plans, ['learn'])
    const proPlan = isLearnPurchased ? getActivePlan(plans, ['offScores', 'pro']) : plan

    if (!learnPlan?.info || !proPlan?.info || learnPlan.info.productId === proPlan.info.productId)
        return plan

    return {
        type: proPlan.type === 'offScores' ? 'learnOffScores' : 'learnPro',
        info: {
            ...plan.info,
            featureList: mergeFeatureLists(learnPlan.info.featureList, proPlan.info.featureList),
        },
        billingPlans: [learnPlan, proPlan],
    }
}

const purchaseSuccessPeriods: Record<string, 'year' | 'three_months' | 'month' | 'week'> = {
    '12 month': 'year',
    '3 month': 'three_months',
    '1 month': 'month',
    '1 week': 'week',
    '1 weeks': 'week',
    '7 days': 'week',
}

export const getPurchaseSuccessPriceLine = ({
    price = '',
    duration = '',
    date = '',
}: {
    price?: string
    duration?: string
    date?: string
}) => {
    const period = purchaseSuccessPeriods[duration] || 'other'

    if (!price) {
        return date ? translate('native.marketing.purchase_success.on_date', { date }) : ''
    }
    if (!duration) {
        return date
            ? translate('native.marketing.purchase_success.price_on_date', { price, date })
            : price
    }
    return date
        ? translate('native.marketing.purchase_success.price_per_period_on_date', {
              price,
              period,
              duration,
              date,
          })
        : translate('native.marketing.purchase_success.price_per_period', {
              price,
              period,
              duration,
          })
}
