import { useEffect, useLayoutEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { colors, layout, layoutHelpers, Loader, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import type { TProductId, TProductInApp, TSubscription } from '@mu-native/marketing'
import {
    billingThunks,
    getProfileSubscriptions,
    marketingStoreChunk,
    marketingThunks,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { NavHeader } from '../../../../../App/Components/NavHeader/NavHeader'
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    scrollContentContainer: style.view({
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.marginMd,
        width: '100%',
        backgroundColor: colors.white,
        paddingBottom: getResponsiveSizeExtended(120),
        paddingTop: getResponsiveSizeExtended(24),
    }),
    container: style.view({
        flex: 1,
        width: '100%',
        backgroundColor: colors.white,
    }),
    scrollViewContainer: style.view({
        backgroundColor: colors.blue100,
    }),
})

const PricingLandingContainer = () => {
    const { setOptions, goBack } = useNavigation()
    const actions = useActions({
        invokeClosePaymentModalCallbackThunk: marketingThunks.invokeClosePaymentModalCallbackThunk,
        setIsAutoScrollSettingsModalVisible:
            marketingStoreChunk.actions.setIsAutoScrollSettingsModalVisible,
        setFeatureText: marketingStoreChunk.actions.setFeatureText,
        setPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        setRestoreProcessing: marketingStoreChunk.actions.setIsRestoreProcessing,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
    })

    const [source, isPaymentInProgress, subscriptions] = useValues([
        marketingStoreChunk.props.getSource,
        marketingStoreChunk.props.getIsPaymentInProgress,
        getProfileSubscriptions,
    ])

    const [activeSubscribePlan, setActiveSubscribePlan] = useState<TProductId>(
        subscriptions?.[0]?.productId as TProductId,
    )

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => <NavHeader headerTitle={translate('native.pricing')} noNotifications />,
        })
    }, [])

    const purchaseCallback = () => {
        goBack()
    }

    const onPurchase = (
        subscription: TSubscription | TProductInApp | undefined,
        callback: () => void,
    ) => {
        reportEvent(MetricaEvents.LANDING_PRICING_CONTINUE_CLICK, {
            ...subscriptionsRtHelpers.getRtParamsBySource({ source }),
            subscription_purchase:
                subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(activeSubscribePlan),
            landing_name: 'Pricing page',
            funnel_source: source,
        })
        if (subscription)
            actions.requestPurchaseThunk({
                subscription,
                source,
                callback,
            })
    }

    const onChangeSubscribePlan = (activeSubscribePlanId: TProductId) => {
        if (activeSubscribePlanId === activeSubscribePlan) {
            const product = subscriptions?.find(
                product => product?.productId === activeSubscribePlanId,
            )
            onPurchase(product, purchaseCallback)
        } else {
            setActiveSubscribePlan(activeSubscribePlanId)
            reportEvent(MetricaEvents.LANDING_PRICING_PRODUCT_CLICK, {
                productId: activeSubscribePlanId,
                landing_name: 'Pricing page',
                funnel_source: source,
                ...subscriptionsRtHelpers.getRtParamsBySource({ source }),
            })
            reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                productId: activeSubscribePlanId,
                ...subscriptionsRtHelpers.getRtParamsBySource({ source }),
                landing_name: 'Pricing page',
                funnel_source: source,
            })
        }
    }

    useEffect(() => {
        if (isPaymentInProgress) actions.setPaymentInProgress(false)

        reportEvent(MetricaEvents.LANDING_PRICING_VIEW, {
            productId: activeSubscribePlan,
            landing_name: 'Pricing page',
            funnel_source: source,
            ...subscriptionsRtHelpers.getRtParamsBySource({ source }),
        })

        const plansRtParams = {
            ...subscriptionsRtHelpers.withPaywallPlansRt(
                subscriptionsRtHelpers.getRtParamsBySource({ source }),
                subscriptions as TSubscription[],
            ),
            landing_name: 'Pricing page',
            funnel_source: source,
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
                scrollEventThrottle={30}
            >
                <View style={styles.scrollContentContainer}>
                    <SubscribePlanComponent
                        activeSubscribePlan={activeSubscribePlan}
                        onPress={onChangeSubscribePlan}
                        subscribePlans={subscriptions}
                        currentScreen="PROFILE"
                    />
                </View>
                {isPaymentInProgress && <Loader />}
            </ScrollView>
        </View>
    )
}

export default PricingLandingContainer
