import type { ProductSubscriptionAndroid } from 'react-native-iap'
import { LaunchArguments } from 'react-native-launch-arguments'

import { platform } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants.ts'

// Set only by the Detox launch helper. Android E2E emulators have no Google Play Billing, so the
// store returns no subscriptions and every subscription-gated paywall stays hidden (MUP-14880).
const isE2eTestSubscriptions = Boolean(
    LaunchArguments.value<{ e2eTestSubscriptions?: boolean }>()?.e2eTestSubscriptions,
)

const pricingPhase = (billingPeriod: string, micros: number, recurrenceMode: number) => ({
    billingCycleCount: recurrenceMode === 1 ? 0 : 1,
    billingPeriod,
    formattedPrice: `$${(micros / 1_000_000).toFixed(2)}`,
    priceAmountMicros: String(micros),
    priceCurrencyCode: 'USD',
    recurrenceMode,
})

const testSubscription = (id: string): ProductSubscriptionAndroid => {
    const isMonthly = /month/i.test(id)
    const pricingPhaseList = [
        ...(/trial/i.test(id) ? [pricingPhase('P1W', 0, 2)] : []),
        isMonthly ? pricingPhase('P1M', 9_990_000, 1) : pricingPhase('P1Y', 59_990_000, 1),
    ]
    return {
        id,
        platform: 'android',
        type: 'subs',
        title: id,
        description: id,
        nameAndroid: id,
        currency: 'USD',
        displayPrice: pricingPhaseList[pricingPhaseList.length - 1].formattedPrice,
        subscriptionOfferDetailsAndroid: [
            {
                basePlanId: id,
                offerTags: [],
                offerToken: `e2e-${id}`,
                pricingPhases: { pricingPhaseList },
            },
        ],
    } as unknown as ProductSubscriptionAndroid
}

/** Test subscriptions for an Android E2E run without billing, or null outside one. */
export const getE2eTestSubscriptions = (): ProductSubscriptionAndroid[] | null =>
    isE2eTestSubscriptions && platform.isAndroid
        ? marketingConstants.listOfSubscriptions.map(id => testSubscription(id))
        : null
