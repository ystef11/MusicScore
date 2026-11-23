import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Reanimated from 'react-native-reanimated'

import {
    colors,
    DividerComponent,
    layout,
    layoutHelpers,
    Loader,
    nativePresentFittedSheet,
    useSafeAreaInsets,
} from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    BackButton,
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    FeaturesCarouselComponent,
    getAllSubscriptions,
    getCreditsPack,
    LandingImageComponent,
    LandingTitlesComponent,
    marketingConstants,
    marketingStorage,
    marketingStoreChunk,
    marketingThunks,
    PieceSaleComponent,
    SubscribePlanComponent,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    type TInAppForSale,
    type TPlanType,
    TProduct,
    type TProductId,
    type TSubscription,
    useAnimatedScrollShadow,
    useProductInApp,
} from '@mu-native/marketing'
import { navigationThunks, Screen, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { buttonTexts } from '../constants/paymentLayerContants'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    scrollContentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.marginMd,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '100%',
        backgroundColor: colors.white,
        paddingBottom: getResponsiveSizeExtended(130),
    },
    titleText: {
        fontSize: getResponsiveSizeExtended(25),
        fontWeight: '600',
        color: colors.text900,
        paddingBottom: '2%',
    },
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 12,
    },
    scrollViewContainer: {
        backgroundColor: colors.blue100,
    },
    marginBottom0: { marginBottom: 0 },
})

const { sources } = marketingConstants

const FeaturesLandingContainer = () => {
    const {
        inAppItem,
        planName = 'pro',
        activePlanIndex,
    } = useAppRoute<{
        inAppItem?: TInAppForSale
        planName?: TPlanType
        activePlanIndex: number
    }>()
    const { goBack, replace } = useAppNavigation()
    const insets = useSafeAreaInsets()

    const actions = useActions({
        invokeClosePaymentModalCallbackThunk: marketingThunks.invokeClosePaymentModalCallbackThunk,
        setIsAutoScrollSettingsModalVisible:
            marketingStoreChunk.actions.setIsAutoScrollSettingsModalVisible,
        setFeatureText: marketingStoreChunk.actions.setFeatureText,
        setPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        setRestoreProcessing: marketingStoreChunk.actions.setIsRestoreProcessing,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        setPageLayoutType: scoreStoreChunk.actions.setPageLayoutType,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        buyScoreByCreditThunk: billingThunks.buyScoreByCreditThunk,
        setScreens: navigationThunks.setScreen,
    })
    const [
        featureText,
        source,
        subscriptions,
        isPaymentInProgress,
        products,
        creditScoreBalance,
        isOffScores,
        isPremium,
        { stockName },
    ] = useValues([
        marketingStoreChunk.props.getFeatureText,
        marketingStoreChunk.props.getSource,
        getAllSubscriptions,
        marketingStoreChunk.props.getIsPaymentInProgress,
        getCreditsPack,
        marketingStoreChunk.props.getCreditBalance,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsPremiumRights,
        dynamicDecorStoreChunk.props.getActiveDecorData,
    ])
    const saleUiRt = stockName ? { ui: `sale_${stockName}_inner` } : {}

    const isEbook = planName === 'ebook'
    const creditBalance = isEbook ? 0 : creditScoreBalance
    const { inAppInfo, productInApp } = useProductInApp(inAppItem, planName)
    const isPieceSale =
        !!productInApp &&
        (featureText === 'marketing_text.score' || featureText === 'marketing_text.ebook')

    const [activeSubscribePlan, setActiveSubscribePlan] = useState(
        subscriptionHelpers.getActiveProductId({
            subscriptions: subscriptions[planName],
            activePlanIndex,
            customId: isPieceSale
                ? subscriptionHelpers.getInAppIdByPrice(
                      inAppItem?.price,
                      isOffScores || isPremium,
                      planName,
                  )
                : '',
        }),
    )

    const updatedSubscriptions =
        // исключение для сони скоров, тк для них триал(yearSubscriptions) не подходит
        useMemo(
            () =>
                source === sources.pdf_trialRestricted
                    ? subscriptions[planName].filter(
                          subscription =>
                              !(
                                  subscription?.productId ===
                                      marketingConstants.yearLiteSubscriptionId ||
                                  subscription?.productId === marketingConstants.pro69SubscriptionId
                              ),
                      )
                    : subscriptions[planName],
            [planName, source, subscriptions],
        )

    const isActiveScore = activeSubscribePlan === inAppInfo.id

    const purchaseCallback = useCallback(() => {
        if (source === sources.hqSound) {
            nativePresentFittedSheet('mixerSheet')
            reportEvent('ScreenSettingsMixerId: open')
        }
        if (isActiveScore && !isEbook) {
            replace(Screen.orders)
            return
        }
        goBack()
    }, [source, isActiveScore, isEbook, goBack, replace])

    const onPurchase = useCallback(
        (subscription: TSubscription | TProduct | undefined) => {
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                ui: source,
                subscription_type: [isEbook ? 'ebook' : 'pro', ...(isPieceSale ? ['piece'] : [])],
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    subscription?.productId,
                ),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription?.productId),
                funnel_type: 'intentional',
                landing_name: 'Feature landing',
                funnel_source: source,
                have_quiz: 'no',
                ...saleUiRt,
            })

            if (isActiveScore && creditBalance && inAppInfo.scoreId) {
                actions.buyScoreByCreditThunk({
                    scoreId: inAppInfo.scoreId,
                    callback: purchaseCallback,
                })
                return
            }
            if (subscription)
                actions.requestPurchaseThunk({
                    subscription,
                    source,
                    callback: purchaseCallback,
                })
        },
        [isActiveScore, stockName, purchaseCallback, source, creditBalance, inAppInfo?.scoreId],
    )

    const onChangeSubscribePlan = useCallback(
        (newActivePlanId: TProductId) => {
            if (marketingConstants.listInApps.includes(newActivePlanId)) {
                reportEvent(MetricaEvents.SCORE_PIECE_SALE_SHOW_CLICK, {
                    ui: 'cart',
                })
            }
            setActiveSubscribePlan(currentActivePlanId => {
                if (newActivePlanId !== currentActivePlanId) {
                    reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                        productId: newActivePlanId,
                        subscription_type: [
                            isEbook ? 'ebook' : 'pro',
                            ...(isPieceSale ? ['piece'] : []),
                        ],
                        funnel_type: 'intentional',
                        landing_name: 'Feature landing',
                        funnel_source: source,
                        have_quiz: 'no',
                        ...saleUiRt,
                    })

                    return newActivePlanId
                }

                const product =
                    updatedSubscriptions.find(
                        currentSubscription =>
                            currentSubscription?.productId === currentActivePlanId,
                    ) ||
                    products.find(product => product?.productId === currentActivePlanId) ||
                    productInApp

                onPurchase(product)

                return currentActivePlanId
            })
        },
        [updatedSubscriptions, products, onPurchase, source, isPieceSale, stockName],
    )

    const onPressStartTrial = useCallback(() => {
        setActiveSubscribePlan(activePlanId => {
            const product =
                updatedSubscriptions?.find(
                    currentSubscription => currentSubscription?.productId === activePlanId,
                ) ||
                products.find(product => product?.productId === activePlanId) ||
                productInApp

            if (marketingConstants.listInApps.includes(activeSubscribePlan)) {
                reportEvent(MetricaEvents.SCORE_PIECE_SALE_SHOW_CLICK, {
                    ui: 'cart',
                })
            }

            onPurchase(product)

            return activePlanId
        })
    }, [updatedSubscriptions, onPurchase, products])

    useEffect(() => {
        actions.setScreens('PaywallScreen')
        if (isPaymentInProgress) actions.setPaymentInProgress(false)

        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                [isEbook ? 'ebook' : 'pro', ...(isPieceSale ? ['piece'] : [])],
                updatedSubscriptions,
            ),
            funnel_type: 'intentional',
            landing_name: 'Feature landing',
            funnel_source: source,
            have_quiz: 'no',
            ...saleUiRt,
        })

        reportEvent(
            isPieceSale
                ? MetricaEvents.SCORE_PIECE_SALE_SHOW
                : MetricaEvents.SCREEN_LANDING_PIECE_SALE_CLICK,
            { ui: source },
        )

        if (featureText === 'marketing_text.auto_scroll') {
            actions.setPageLayoutType('horizontal')

            reportEvent(MetricaEvents.PAYMENT_LAYER_TURN_AUTO_SCROLL_OFF, { ui: 'autoscroll' })

            if (!marketingStorage.get('autoScrollModalSettingsShown')) {
                actions.setIsAutoScrollSettingsModalVisible(true)
            }
        }

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                subscription_type: [isEbook ? 'ebook' : 'pro', ...(isPieceSale ? ['piece'] : [])],
                funnel_type: 'intentional',
                landing_name: 'Feature landing',
                funnel_source: source,
                have_quiz: 'no',
                ...saleUiRt,
            })
            actions.setScreens('PaywallCheckoutScreen')
        }
    }, [])

    const scoreTextButton = creditBalance
        ? translate('native.marketing.use_credit_title')
        : translate('native.marketing.continue')
    const subscriptionText =
        buttonTexts[activeSubscribePlan] || translate('native.screen_tour.start_now_text')
    const buttonText = isActiveScore ? scoreTextButton : subscriptionText

    const freeCancelText = translate('native.screen_tour.free_cancel')

    const textAboveButton =
        updatedSubscriptions?.find(item => item?.productId === activeSubscribePlan)
            ?.textAboveButton || freeCancelText

    const isShowTopScoreBlock = !!inAppInfo.scoreId && isPieceSale && !!inAppItem?.id
    const isShowBottomScoreBlock = !!inAppInfo.scoreId && !isPieceSale && !!inAppItem?.id

    const { onContentSizeChange, scrollHandler, scrollOffset, contentHeight, isNeedToShowShadow } =
        useAnimatedScrollShadow()

    return (
        <View style={styles.container}>
            <Reanimated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
                onScroll={scrollHandler}
                scrollEventThrottle={30}
                onContentSizeChange={onContentSizeChange}
            >
                <BackButton />
                <FeaturesCarouselComponent
                    landingName={planName}
                    firstFeature={featureText}
                    topInset={insets?.top}
                />
                <View
                    style={[
                        styles.scrollContentContainer,
                        isShowTopScoreBlock && { paddingTop: layout.marginMd },
                    ]}
                >
                    {isShowTopScoreBlock && (
                        <PieceSaleComponent
                            isActiveScore={isActiveScore}
                            setActiveSubscribePlan={onChangeSubscribePlan}
                            inAppInfo={inAppInfo}
                            creditBalance={creditBalance}
                            imageInAppUri={inAppItem?.imageInAppUri}
                        />
                    )}
                    {isShowTopScoreBlock && <DividerComponent customStyle={styles.marginBottom0} />}
                    {!isShowTopScoreBlock && <LandingImageComponent />}
                    <LandingTitlesComponent
                        customStyle={styles.titleText}
                        currentSubscriptionsGroup={planName}
                    />
                    <SubscribePlanComponent
                        activeSubscribePlan={activeSubscribePlan}
                        onPress={onChangeSubscribePlan}
                        subscribePlans={updatedSubscriptions}
                    />
                    {isShowBottomScoreBlock && <DividerComponent />}
                    {isShowBottomScoreBlock && (
                        <PieceSaleComponent
                            isActiveScore={isActiveScore}
                            setActiveSubscribePlan={onChangeSubscribePlan}
                            inAppInfo={inAppInfo}
                            creditBalance={creditBalance}
                        />
                    )}
                    <BillingInfoComponent currentSubscriptionsGroup="pro" />
                </View>

                {isPaymentInProgress && <Loader />}
            </Reanimated.ScrollView>
            <BuyButton
                textAboveButton={
                    isActiveScore && creditBalance
                        ? translate('native.marketing.credits.pro_balance_with_count', {
                              count: String(creditBalance),
                          })
                        : textAboveButton
                }
                onBuyPress={onPressStartTrial}
                buttonText={buttonText}
                contentHeight={contentHeight}
                isNeedToShowShadow={isNeedToShowShadow}
                shadowOpacity={scrollOffset}
            />
        </View>
    )
}

export default FeaturesLandingContainer
