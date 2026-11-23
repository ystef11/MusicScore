import { useEffect, useMemo } from 'react'

import { platform } from '@mu-native/common'
import { Loader } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import {
    billingThunks,
    getOneSubscription,
    getSaleSubscriptions,
    getSaleSubscriptionsLearnWithoutTrial,
    getSaleSubscriptionsOffScores,
    getUpgradeBundleCurrentProductId,
    getUpgradeBundleSubscriptions,
    marketingStoreChunk,
    marketingThunks,
    sources,
    StockLanding,
    subscriptionsRtHelpers,
    TPlanTypeSplash,
    TProductId,
    TSubscriptionsGroup,
    useGetPlanName,
} from '@mu-native/marketing'
import { useAppRoute } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { useCloseFloatingLanding } from '../hooks/useCloseFloatingLanding'

const getSource = (isLearnPlan?: boolean, isUpgradeBundle?: boolean) => {
    if (isUpgradeBundle) return sources.splashFloatingButtonUpgradeBundle

    return isLearnPlan ? sources.splashFloatingButtonCourses : sources.splashFloatingButton
}

const FloatingLandingContainer = () => {
    const { isLearnPlan, isUpgradeBundle } = useAppRoute<{
        isLearnPlan?: boolean
        isUpgradeBundle?: boolean
    }>()

    const [
        isPaymentInProgress,
        subscriptionsSale,
        subscriptionsOffScoresSale,
        subscriptionsOne,
        subscriptionsSaleLearn,
        subscriptionsUpgradeBundle,
        activeDecorData,
        currentProductId,
        purchaseTokenAndroidInfo,
        isOffScores,
    ] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getSaleSubscriptions,
        getSaleSubscriptionsOffScores,
        getOneSubscription,
        getSaleSubscriptionsLearnWithoutTrial,
        getUpgradeBundleSubscriptions,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        getUpgradeBundleCurrentProductId,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
        marketingStoreChunk.props.getIsOffScores,
    ])
    const {
        setIsPaymentInProgress,
        setSource,
        requestPurchaseThunk,
        setIsNeedToShowFloatingButton,
        loadAndroidPurchaseToken,
    } = useActions({
        setIsPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        setSource: marketingStoreChunk.actions.setSource,
        setIsNeedToShowFloatingButton: marketingStoreChunk.actions.setIsNeedToShowFloatingButton,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        loadAndroidPurchaseToken: marketingThunks.loadAndroidPurchaseTokenThunk,
    })
    const source = getSource(isLearnPlan, isUpgradeBundle)
    const saleUi = activeDecorData.stockName ? `sale_${activeDecorData.stockName}_floating` : ''
    const landingName = isUpgradeBundle
        ? 'Floating Button landing upgrade'
        : 'Floating Button landing'

    const purchaseTokenAndroid = useMemo(() => {
        if (!isUpgradeBundle || !platform.isAndroid) return undefined

        return purchaseTokenAndroidInfo?.find(item => item.product_id === currentProductId)
            ?.purchase_token
    }, [isUpgradeBundle, purchaseTokenAndroidInfo, currentProductId])

    const subscriptions: TSubscriptionsGroup<TPlanTypeSplash> = {
        pro: subscriptionsSale,
        offScores: subscriptionsOffScoresSale,
        one: subscriptionsOne,
        learning: subscriptionsSaleLearn,
        learningBundle: subscriptionsUpgradeBundle,
    }
    const salePlan = useGetPlanName(!!isLearnPlan, subscriptions)
    const { planName, activePlan } = isUpgradeBundle
        ? {
              planName: 'learningBundle' as const,
              activePlan: subscriptionsUpgradeBundle[0]?.productId,
          }
        : salePlan

    const { onClose, onPurchaseStart } = useCloseFloatingLanding(activePlan)

    const onBuyCallBack = (productId: TProductId) => {
        onPurchaseStart()
        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                isLearnPlan ? ['learn'] : [...(planName === 'one' ? ['one'] : ['pro', 'pro_plus'])],
                subscriptions[planName],
                isUpgradeBundle,
            ),
            ...(saleUi ? { ui: saleUi } : {}),
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(productId),
            subscription_purchase:
                subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(productId),
            funnel_type: 'intentional',
            landing_name: landingName,
            funnel_source: source,
            have_quiz: 'no',
        })
    }

    const dismissFloatingButton = () => {
        reportEvent(MetricaEvents.SALE_FLOATING_CLICK_DISMISS, {
            ...(saleUi ? { ui: saleUi } : {}),
            funnel_source: source,
        })
        setIsNeedToShowFloatingButton(false)
        onClose()
    }

    useEffect(() => {
        setSource(source)
        setIsPaymentInProgress(false)

        if (isUpgradeBundle && platform.isAndroid) loadAndroidPurchaseToken()

        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ...(saleUi ? { ui: saleUi } : {}),
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                isLearnPlan ? ['learn'] : [...(planName === 'one' ? ['one'] : ['pro', 'pro_plus'])],
                subscriptions[planName],
                isUpgradeBundle,
            ),
            funnel_type: 'intentional',
            landing_name: landingName,
            funnel_source: source,
            have_quiz: 'no',
        })

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                ui: saleUi || source,
                subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                    isLearnPlan
                        ? ['learn']
                        : [...(planName === 'one' ? ['one'] : ['pro', 'pro_plus'])],
                    subscriptions[planName],
                    isUpgradeBundle,
                ),
                funnel_type: 'intentional',
                landing_name: landingName,
                funnel_source: source,
                have_quiz: 'no',
            })
        }
    }, [])

    if (!activePlan) return null

    return (
        <>
            <StockLanding
                {...{
                    activePlan,
                    subscriptions,
                    onClose,
                    source,
                    onBuyCallBack,
                    activeDecorData,
                    requestPurchaseThunk,
                    planName,
                    dismissFloatingButton,
                    purchaseTokenAndroid,
                    isUpgrade: isUpgradeBundle,
                    isOffScores,
                }}
            />
            {isPaymentInProgress && <Loader />}
        </>
    )
}

export default FloatingLandingContainer
