import { useCallback, useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import {
    AppText,
    globalStyles,
    layoutHelpers,
    Loader,
    NativeBottomSheet,
    useSheetDismiss,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BenefitsComponent,
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    getOfferSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    sources,
    subscriptionsRtHelpers,
    useProductInApp,
} from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../../../App/Utils/Analytics.ts'

import { PremiumSwitchBlockContainer } from './components/PremiumSwitcherBlockContainer.tsx'
import { RedirectLogicContainer } from './components/RedirectLogicContainer.tsx'

const styles = StyleSheet.create({
    buyScoreContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(8),
        width: '100%',
    },
    butButtonStyle: {
        position: 'relative',
        paddingHorizontal: 0,
    },
    borderRadius25: { borderRadius: 25 },
})

const scoreBenefits = [
    translate('native.marketing.no_commitments'),
    translate('native.marketing.secured_payment'),
    translate('native.marketing.up_to_discount_scores', { discount: '40' }),
]

const BottomSheetBuyScoreModal = () => {
    const close = useSheetDismiss()
    const actions = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        openScore: scoreThunks.openScore,
    })

    const [score, isPaymentInProgress, subscriptions, isActivePremiumSwitcher] = useValues([
        scoreStoreChunk.props.getCurrentScore,
        marketingStoreChunk.props.getIsPaymentInProgress,
        getOfferSubscriptions,
        marketingStoreChunk.props.getIsActivePremiumSwitcher,
    ])

    const { productInApp } = useProductInApp(score)

    const premiumSubscription = useMemo(
        () =>
            subscriptions.find(
                item => item?.productId === marketingConstants.premiumYearSubscriptionId,
            ),
        [subscriptions.length],
    )

    useEffect(() => {
        if (!premiumSubscription) onCloseModal()
    }, [premiumSubscription])

    useEffect(() => {
        const plansRtParams = subscriptionsRtHelpers.withPaywallPlansRt(
            subscriptionsRtHelpers.getRtParamsBySource({
                source: sources.premium,
            }),
            [premiumSubscription],
        )
        reportEvent(RT_EVENTS.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(RT_EVENTS.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    const onCloseModal = () => {
        close()
        if (score) actions.openScore(score)
    }

    const onBuyScore = useCallback(() => {
        if (productInApp?.productId && premiumSubscription?.productId) {
            const product = isActivePremiumSwitcher ? premiumSubscription : productInApp
            reportEvent(RT_EVENTS.LANDING_CHECKOUT_VIEW, {
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    product.productId,
                ),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(product.productId),
                ...subscriptionsRtHelpers.getRtParamsBySource({ source: sources.premium }),
            })
            actions.requestPurchaseThunk({
                subscription: product,
                source: sources.premium,
                callback: isActivePremiumSwitcher
                    ? () => null
                    : () => {
                          if (score) actions.openScore(score)
                      },
            })
        }
    }, [productInApp, score, isActivePremiumSwitcher, premiumSubscription])

    const onChangeSwitcher = useCallback(() => {
        const isPremium = !isActivePremiumSwitcher
        const product = isPremium ? premiumSubscription : productInApp
        reportEvent(RT_EVENTS.SCORE_PREMIUM_SWITCHER_CLICK, {
            ...subscriptionsRtHelpers.getRtParamsBySource({ source: sources.premium }),
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(product?.productId),
            value: isPremium ? 'on' : 'off',
            subscription_type: [isPremium ? 'premium' : 'piece'],
        })
    }, [isActivePremiumSwitcher, premiumSubscription, productInApp])

    if (!score) return null

    return (
        <ScrollView contentContainerStyle={styles.buyScoreContainer}>
            <AppText
                textAlign="center"
                adaptiveSize
                font="f44w400Accent"
                rawText={translate('native.buyThisScore')}
            />
            <AppText
                textAlign="center"
                adaptiveSize
                font="f15w400"
                brandColor="contentSecondary"
                rawText={translate('native.marketing.compete_your_purchase')}
                style={globalStyles.mb24}
            />
            <BenefitsComponent
                style={globalStyles.mb8}
                subscriptionBenefits={scoreBenefits}
                indexCustomIcon={isActivePremiumSwitcher ? 0 : 2}
            />
            <PremiumSwitchBlockContainer
                price={premiumSubscription?.summary}
                score={score}
                isActiveSwitcher={isActivePremiumSwitcher}
                onChangeSwitcher={onChangeSwitcher}
            />
            {isActivePremiumSwitcher ? (
                <BillingInfoComponent compactFooter currentSubscriptionsGroup="premium" />
            ) : null}
            <BuyButton
                isStatic
                onBuyPress={onBuyScore}
                customStyleContainer={styles.butButtonStyle}
                customButtonStyle={styles.borderRadius25}
                buttonText={translate('native.marketing.continue')}
            />
            {isPaymentInProgress && <Loader />}
            <RedirectLogicContainer />
        </ScrollView>
    )
}

export const ScorePremiumContainer = () => {
    const [isOpenScorePremiumModal] = useValues([scoreStoreChunk.props.getIsOpenScorePremiumModal])
    const actions = useActions({
        setIsOpenScorePremiumModal: scoreStoreChunk.actions.setIsOpenScorePremiumModal,
    })

    const onClose = () => {
        actions.setIsOpenScorePremiumModal(false)
    }

    if (!isOpenScorePremiumModal) return null

    return (
        <NativeBottomSheet presentOnMount onDismiss={onClose} dismissOnOverlayTap={false}>
            <BottomSheetBuyScoreModal />
        </NativeBottomSheet>
    )
}
