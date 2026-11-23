import { useEffect } from 'react'

import {
    billingThunks,
    getAnniversarySplashSubscriptions,
    marketingStoreChunk,
    sources,
    subscriptionsRtHelpers,
    TSubscription,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { getShowDays } from '../helpers/anniversaryHelper'
import { useGetUserNameInfo } from '../hooks/useGetUserName'

import AnniversarySplashComponent from './components/AnniversarySplashComponent'

const ScreenAnniversarySplash = () => {
    const { goBack } = useNavigation()

    const [isPaymentInProgress, anniversarySplashInfo, subscriptions] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        marketingStoreChunk.props.getAnniversarySplashInfo,
        getAnniversarySplashSubscriptions,
    ])
    const actions = useActions({
        setIsPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        setLastShownDaysAnniversarySplash:
            marketingStoreChunk.actions.setLastShownDaysAnniversarySplash,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })

    const userName = useGetUserNameInfo()

    const updateLastShownDays = () => {
        const showDays = getShowDays(anniversarySplashInfo?.daysFromFirstTouch)
        actions.setLastShownDaysAnniversarySplash(showDays)
    }

    useEffect(() => {
        if (isPaymentInProgress) actions.setIsPaymentInProgress(false)
        updateLastShownDays()
    }, [])

    useEffect(() => {
        if (!subscriptions) goBack()
    }, [subscriptions])

    const onPurchase = (subscription: TSubscription | undefined) => {
        if (!subscription) return

        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            subscription_type: ['pro', 'pro_plus'],
            funnel_type: 'intentional',
            subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                subscription.productId,
            ),
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription.productId),
            landing_name: 'Special offer',
            funnel_source: sources.splashAnniversaryOffer,
            have_quiz: 'no',
        })

        actions.requestPurchaseThunk({
            subscription,
            source: sources.splashAnniversaryOffer,
            callback: goBack,
        })
    }

    const onBuy = (isOffScores = false) => {
        onPurchase(isOffScores ? subscriptions?.offScores?.[1] : subscriptions?.pro?.[1])
    }

    const daysQty = String(getShowDays(anniversarySplashInfo?.daysFromFirstTouch))
    if (!subscriptions) return null

    return (
        <AnniversarySplashComponent
            subscriptions={subscriptions}
            onBuy={onBuy}
            days={daysQty}
            username={userName?.value}
            isPaymentInProgress={isPaymentInProgress}
        />
    )
}

export default ScreenAnniversarySplash
