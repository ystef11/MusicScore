import { useEffect, useMemo } from 'react'

import { platform } from '@mu-native/common'
import { Loader } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import {
    billingThunks,
    getIsUpgradeBundleAudience,
    getOneSubscription,
    getSaleSubscriptions,
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
    useFloatingUpgradeBundleExperiment,
    useGetPlanName,
} from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { useIsCheckDeepLinks } from '../hooks/useIsCheckDeepLinks.ts'

const getSource = (isPro: boolean, isUpgradeBundle: boolean) => {
    if (isUpgradeBundle) return sources.splashReturnOfferUpgradeBundle

    return isPro ? sources.splashReturnOfferCourses : sources.splashReturnOffer
}

const getSubscriptionType = (isPro: boolean, isUpgradeBundle: boolean) => {
    if (isUpgradeBundle) return ['learn&pro_plus']

    return isPro ? ['learn'] : ['pro']
}

const ReturnSplashScreen = () => {
    const { goBack: onClose } = useAppNavigation()

    const [
        isPaymentInProgress,
        subscriptionsSale,
        subscriptionsOffScoresSale,
        subscriptionsOne,
        isPro,
        activeDecorData,
        isUpgradeBundleAudience,
        subscriptionsUpgradeBundle,
        currentProductId,
        purchaseTokenAndroidInfo,
        isOffScores,
    ] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getSaleSubscriptions,
        getSaleSubscriptionsOffScores,
        getOneSubscription,
        marketingStoreChunk.props.getIsPro,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        getIsUpgradeBundleAudience,
        getUpgradeBundleSubscriptions,
        getUpgradeBundleCurrentProductId,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
        marketingStoreChunk.props.getIsOffScores,
    ])
    const { requestPurchaseThunk, setIsPaymentInProgress, setSource, loadAndroidPurchaseToken } =
        useActions({
            setIsPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
            setSource: marketingStoreChunk.actions.setSource,
            requestPurchaseThunk: billingThunks.requestPurchaseThunk,
            loadAndroidPurchaseToken: marketingThunks.loadAndroidPurchaseTokenThunk,
        })

    const { isFloatingUpgradeBundleVariation } =
        useFloatingUpgradeBundleExperiment(isUpgradeBundleAudience)
    const isUpgradeBundle = isUpgradeBundleAudience && isFloatingUpgradeBundleVariation

    const subscriptionType = getSubscriptionType(isPro, isUpgradeBundle)
    const landingName = isUpgradeBundle ? 'Return offer upgrade' : 'Return offer'

    const purchaseTokenAndroid = useMemo(() => {
        if (!isUpgradeBundle || !platform.isAndroid) return undefined

        return purchaseTokenAndroidInfo?.find(item => item.product_id === currentProductId)
            ?.purchase_token
    }, [isUpgradeBundle, purchaseTokenAndroidInfo, currentProductId])

    const source = getSource(isPro, isUpgradeBundle)
    const saleUi = activeDecorData.stockName ? `sale_${activeDecorData.stockName}_floating` : ''

    const onBuyCallBack = (productId: TProductId) => {
        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                subscriptionType,
                subscriptions[planName],
                isUpgradeBundle,
            ),
            ...(saleUi ? { ui: saleUi } : {}),
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(productId),
            funnel_type: 'intentional',
            landing_name: landingName,
            subscription_purchase:
                subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(productId),
            funnel_source: source,
            have_quiz: 'no',
            event_old: MetricaEvents.SPLASH_CLICK_BUY,
        })
    }

    const subscriptions: TSubscriptionsGroup<TPlanTypeSplash> = {
        pro: subscriptionsSale,
        offScores: subscriptionsOffScoresSale,
        one: subscriptionsOne,
        learning: subscriptionsOffScoresSale,
        learningBundle: subscriptionsUpgradeBundle,
    }
    const salePlan = useGetPlanName(false, subscriptions)
    const { planName, activePlan } = isUpgradeBundle
        ? {
              planName: 'learningBundle' as const,
              activePlan: subscriptionsUpgradeBundle[0]?.productId,
          }
        : salePlan

    useEffect(() => {
        if (isUpgradeBundle) {
            setSource(source)
            if (platform.isAndroid) loadAndroidPurchaseToken()
        }

        reportEvent(MetricaEvents.LANDING_VIEW, {
            landing_name: landingName,
            funnel_type: 'intentional',
        })
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ...(saleUi ? { ui: saleUi } : {}),
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                subscriptionType,
                subscriptions[planName],
                isUpgradeBundle,
            ),
            funnel_type: 'intentional',
            landing_name: landingName,
            funnel_source: source,
            have_quiz: 'no',
        })

        setIsPaymentInProgress(false)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                    subscriptionType,
                    subscriptions[planName],
                    isUpgradeBundle,
                ),
                ...(saleUi ? { ui: saleUi } : {}),
                funnel_type: 'intentional',
                landing_name: landingName,
                funnel_source: source,
                have_quiz: 'no',
            })
        }
    }, [])

    useIsCheckDeepLinks(onClose, isPro && !isUpgradeBundle)

    if (!activePlan) {
        onClose()
        return null
    }

    return (
        <>
            <StockLanding
                {...{
                    subscriptions,
                    onClose,
                    planName,
                    onBuyCallBack,
                    source,
                    activePlan,
                    activeDecorData,
                    requestPurchaseThunk,
                    purchaseTokenAndroid,
                    isUpgrade: isUpgradeBundle,
                    isOffScores,
                }}
            />
            {isPaymentInProgress && <Loader />}
        </>
    )
}

export default ReturnSplashScreen
