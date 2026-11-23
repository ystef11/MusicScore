import { useValues } from '@ug/store'

import formatDate from '../../../../../App/Utils/Date'
import { marketingStoreChunk } from '../../../store/marketingStoreChunk'
import {
    getPurchaseSuccessCombinedPlan,
    getPurchaseSuccessPlan,
    getPurchaseSuccessPriceLine,
    purchaseSuccessPlanTitles,
    TPurchaseSuccessPlan,
} from '../purchaseSuccessHelpers'

export type TPurchaseSuccessBilling = {
    key: string
    title: string
    isTrial: boolean
    date: string
    price: string
}

export const usePurchaseSuccessPlan = () => {
    const [productId, subscriptions, offScoresInfo, proInfo, learnInfo, learnLiteInfo, ebookInfo] =
        useValues([
            marketingStoreChunk.props.getProductId,
            marketingStoreChunk.props.getSubscriptions,
            marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
            marketingStoreChunk.props.getCurrentSubscriptionProInfo,
            marketingStoreChunk.props.getCurrentSubscriptionLearnInfo,
            marketingStoreChunk.props.getCurrentSubscriptionLearnLiteInfo,
            marketingStoreChunk.props.getCurrentSubscriptionEbookInfo,
        ])

    const plans: TPurchaseSuccessPlan[] = [
        { type: 'offScores', info: offScoresInfo },
        { type: 'learn', info: learnInfo },
        { type: 'pro', info: proInfo },
        { type: 'learnLite', info: learnLiteInfo },
        { type: 'ebook', info: ebookInfo },
    ]
    const plan = getPurchaseSuccessCombinedPlan(getPurchaseSuccessPlan({ productId, plans }), plans)

    const getBilling = (billingPlan: TPurchaseSuccessPlan): TPurchaseSuccessBilling => {
        const billingProductId = billingPlan.info?.productId || productId
        const subscription = subscriptions.find(item => item.productId === billingProductId)
        const date = billingPlan.info?.dateEndAccess
            ? formatDate(billingPlan.info.dateEndAccess, 'DD MMM YYYY')
            : ''

        return {
            key: billingProductId,
            title: purchaseSuccessPlanTitles[billingPlan.type],
            isTrial: !!subscription?.trialStatus,
            date,
            price: getPurchaseSuccessPriceLine({
                price: subscription?.formattedPrice,
                duration: subscription?.duration,
                date,
            }),
        }
    }

    const billings = (plan?.billingPlans || (plan ? [plan] : []))
        .map(getBilling)
        .filter(({ price }) => !!price)

    return {
        title: purchaseSuccessPlanTitles[plan?.type || 'pro'],
        featureList: plan?.info?.featureList?.filter(feature => !feature.isDisabled) || [],
        billings,
    }
}
