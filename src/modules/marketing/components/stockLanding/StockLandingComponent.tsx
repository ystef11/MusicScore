import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import ReAnimated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform, TThunkAction } from '@mu-native/common'
import {
    brandColors,
    colors,
    FastImage,
    globalStyles,
    layout,
    layoutHelpers,
    replacerText,
} from '@mu-native/ds'
import { TActiveDecor } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import { useIsLandscape } from '@mu-native/system'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import { findByProductId } from '../../helpers/findByProductId'
import { subscriptionsRtHelpers } from '../../helpers/subscriptionsRtHelpers'
import { useAnimatedScrollShadow } from '../../hooks/useAnimatedScrollShadow'
import { useClosePaymentScreen } from '../../hooks/useClosePaymentScreen.ts'
import {
    TPlanTypeSplash,
    TProduct,
    TProductId,
    TProductInApp,
    TSources,
    TSubscription,
    TSubscriptionsGroup,
} from '../../types/marketingTypes'
import BillingInfoComponent from '../billingPlansInfo/BillingInfoComponent'
import BuyButton from '../buyButton/BuyButtonComponent'
import PaymentLayerCloseBlockComponent from '../paymentLayerCloseBlock/PaymentLayerCloseBlockComponent'
import PlanSwitcher from '../planSwitcher/PlanSwitcher'
import SubscribePlanComponent from '../subscribePlan/SubscriptionsPlanContainer.tsx'

import { buttonTexts } from './constants'
import { useHolidayDecor } from './hooks/useHolidayDecor'

const { getResponsiveSizeExtended } = layoutHelpers
const { getRtParamsBySource, getProSwitcherRtParams } = subscriptionsRtHelpers

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        width: '100%',
        padding: getResponsiveSizeExtended(layout.marginMd),
        paddingTop: getResponsiveSizeExtended(30),
        paddingBottom: getResponsiveSizeExtended(platform.isTablet ? 100 : 150),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    width50: {
        width: '50%',
        overflow: 'hidden',
    },
    subscribePlanContainer: {
        alignSelf: 'center',
        minHeight: 180,
        justifyContent: platform.isTablet ? 'flex-start' : 'flex-end',
    },
    subscribePlanContainerUpgrade: {
        minHeight: 'auto',
    },
    marginBottomPlans: {
        marginBottom: getResponsiveSizeExtended(layout.marginMd),
    },
    fullWidth: {
        width: '100%',
    },
    width110: {
        width: '110%',
    },
    stockLandingTextContainerDefault: {
        maxWidth: layout.maxWidthTabletContainer,
        marginBottom: getResponsiveSizeExtended(12),
        marginTop: platform.isTablet ? 0 : getResponsiveSizeExtended(20),
        paddingTop: platform.isTablet ? getResponsiveSizeExtended(8) : 0,
    },
    paddingHorizontal: {
        width: '100%',
        paddingHorizontal: 20,
    },
    upgradeBundleTextContainer: {
        marginTop: getResponsiveSizeExtended(40),
        height: 'auto',
        maxHeight: 'auto',
    },
    upgradeBundleTitle: {
        fontSize: getResponsiveSizeExtended(30),
        lineHeight: getResponsiveSizeExtended(40),
    },
})

type TStockLandingProps = {
    source: TSources
    dismissFloatingButton?: () => void
    onBuyCallBack: (productId: TProductId) => void
    onClose: () => void
    subscriptions: TSubscriptionsGroup<TPlanTypeSplash>
    planName: TPlanTypeSplash
    activePlan: TProductId
    activeDecorData: TActiveDecor
    purchaseTokenAndroid?: string
    isUpgrade?: boolean
    isOffScores?: boolean
    requestPurchaseThunk: TThunkAction<{
        subscription: TSubscription | TProductInApp | TProduct
        source: TSources
        callback: () => void
        purchaseTokenAndroid?: string
        isOfferPersonalized?: boolean
    }>
}

const StockLanding = ({
    source,
    dismissFloatingButton,
    onBuyCallBack,
    onClose,
    subscriptions,
    planName,
    activePlan,
    activeDecorData,
    requestPurchaseThunk,
    purchaseTokenAndroid,
    isUpgrade = false,
    isOffScores = false,
}: TStockLandingProps) => {
    const {
        stockLandingSwitcherColor,
        floating_image_sale: floatingImageUri,
        buyButtonContainerStockLandingStyle,
        stockLandingSaleText,
        stockLandingSaleTextStyle,
        buyButtonStockLandingStyle,
        stockLandingImageStyle,
        stockLandingBgStyle,
        stockLandingCloseIconBgStyle,
        stockLandingDynamicTitleStyle,
        closeIconStockLandingStyle,
        stockLandingTextContainerStyle,
        colorRestoreStockLandingButton,
        stockLandingImageStyleIpad,
    } = activeDecorData

    const opacitySubscription = useSharedValue(1)

    const [currentSubscriptionsGroup, setCurrentSubscriptionsGroup] =
        useState<TPlanTypeSplash>(planName)
    const [activeSubscribePlan, setActiveSubscribePlan] = useState<TProductId>(activePlan)
    const [isActiveSwitcher, setIsActiveSwitcher] = useState(true)

    const currentSubscriptions = subscriptions?.[currentSubscriptionsGroup] || []

    useEffect(() => {
        setCurrentSubscriptionsGroup(planName)
    }, [planName])

    useEffect(() => {
        setActiveSubscribePlan(activePlan)
    }, [activePlan])

    const onPurchase = (subscription: TSubscription, callback: () => void) => {
        requestPurchaseThunk({
            subscription,
            source,
            callback,
            purchaseTokenAndroid,
        })
    }

    const onChangeSubscribePlan = useCallback(
        (subscriptionPlan: TProductId) => {
            if (subscriptionPlan === activeSubscribePlan) {
                const subscription = findByProductId(currentSubscriptions, subscriptionPlan) || ''
                if (subscription) {
                    onBuyCallBack(subscriptionPlan)

                    onPurchase(subscription, () => {
                        onClose()
                    })
                }
            } else {
                setActiveSubscribePlan(subscriptionPlan)
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: subscriptionPlan,
                    ...getRtParamsBySource({ source }),
                    funnel_source: source,
                })
            }
        },
        [currentSubscriptions, activeSubscribePlan, purchaseTokenAndroid, source],
    )

    const onPressStartTrial = useCallback(() => {
        setActiveSubscribePlan(activePlanId => {
            const subscription = currentSubscriptions.find(
                curSubscription => curSubscription?.productId === activePlanId,
            )

            if (subscription) {
                onBuyCallBack(subscription.productId)

                onPurchase(subscription, () => {
                    onClose()
                })
            }

            return activePlanId
        })
    }, [currentSubscriptions, purchaseTokenAndroid])

    const onChangeSubscriptionCallback = () => {
        setIsActiveSwitcher(prevActiveSwitcherState => {
            const currentGroup = prevActiveSwitcherState ? 'pro' : 'offScores'
            setCurrentSubscriptionsGroup(currentGroup)

            setActiveSubscribePlan(subscriptions?.[currentGroup]?.[0]?.productId || '')
            reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
                ...getRtParamsBySource({ source }),
                funnel_source: source,
                ...getProSwitcherRtParams(!prevActiveSwitcherState),
            })

            return !prevActiveSwitcherState
        })
    }
    const onChangeSubscriptions = useCallback(() => {
        opacitySubscription.value = withTiming(0, { duration: 200 }, isFinished => {
            if (isFinished) {
                scheduleOnRN(onChangeSubscriptionCallback)
                opacitySubscription.value = withTiming(1, { duration: 200 })
            }
        })
    }, [])

    const buttonText = isUpgrade
        ? translate('native.upgrade_messages.upgrade_now')
        : buttonTexts[activeSubscribePlan] || translate('native.screen_tour.start_now_text')

    const isLandscape = useIsLandscape()

    const {
        mainContainerStyle,
        buttonContainerTextStyle,
        secondTitleButtonStyle,
        mainImageStyle,
        stockLandingSale,
        stockLandingTitleStyle,
        stockLandingTitleColorSale,
        colorTextSwitcher,
    } = useHolidayDecor(isLandscape, planName)
    const { onContentSizeChange, scrollHandler, contentHeight, scrollOffset, isNeedToShowShadow } =
        useAnimatedScrollShadow()

    const opacitySubscriptionStyle = useAnimatedStyle(() => ({
        opacity: opacitySubscription.value,
    }))
    useClosePaymentScreen({ subscriptions: currentSubscriptions, callback: onClose })

    const isUpgradeBundle = planName === 'learningBundle'
    const titleStyle = [
        stockLandingTitleStyle,
        stockLandingDynamicTitleStyle,
        !!stockLandingDynamicTitleStyle?.fontSize && {
            fontSize: layoutHelpers.getResponsiveSizeExtended(
                stockLandingDynamicTitleStyle?.fontSize,
            ),
        },
    ]

    return (
        <View style={[mainContainerStyle, stockLandingBgStyle]}>
            {isLandscape && (
                <ReAnimated.View
                    style={styles.width50}
                    entering={FadeIn.duration(600)}
                    exiting={FadeOut.duration(100)}
                >
                    <FastImage
                        source={layoutHelpers.getUriSourceByImageUrl(floatingImageUri)}
                        resizeMode="cover"
                        style={mainImageStyle}
                    />
                </ReAnimated.View>
            )}
            {isLandscape && (
                <PaymentLayerCloseBlockComponent
                    onClose={onClose}
                    isShowRestore
                    containerStyle={styles.paddingHorizontal}
                    closeIconBgStyle={stockLandingCloseIconBgStyle}
                    closeIconStyle={closeIconStockLandingStyle}
                />
            )}
            <View style={[styles.fullWidth, isLandscape && styles.width50]}>
                <ReAnimated.ScrollView
                    style={styles.fullWidth}
                    contentContainerStyle={styles.scrollContainer}
                    onScroll={scrollHandler}
                    onContentSizeChange={onContentSizeChange}
                    scrollEventThrottle={30}
                    showsVerticalScrollIndicator={false}
                >
                    {!isLandscape && (
                        <PaymentLayerCloseBlockComponent
                            onClose={onClose}
                            isShowRestore
                            containerStyle={globalStyles.fullWidth}
                            closeIconBgStyle={stockLandingCloseIconBgStyle}
                            closeIconStyle={closeIconStockLandingStyle}
                            colorRestoreButton={colorRestoreStockLandingButton}
                        />
                    )}
                    {!isLandscape && (
                        <ReAnimated.View
                            style={styles.width110}
                            entering={FadeIn.duration(600)}
                            exiting={FadeOut.duration(100)}
                        >
                            <FastImage
                                source={layoutHelpers.getUriSourceByImageUrl(floatingImageUri)}
                                resizeMode="cover"
                                style={
                                    [
                                        mainImageStyle,
                                        platform.isTablet
                                            ? stockLandingImageStyleIpad
                                            : stockLandingImageStyle,
                                    ] as any
                                }
                            />
                        </ReAnimated.View>
                    )}
                    <View
                        style={[
                            styles.stockLandingTextContainerDefault,
                            !isUpgradeBundle && stockLandingTextContainerStyle,
                            isUpgradeBundle && styles.upgradeBundleTextContainer,
                        ]}
                    >
                        {isUpgradeBundle ? (
                            <Text style={[titleStyle, styles.upgradeBundleTitle]} numberOfLines={3}>
                                {replacerText({
                                    text: isOffScores
                                        ? translate('native.marketing.upgrade_bundle.add_courses')
                                        : translate(
                                              'native.marketing.upgrade_bundle.add_courses_and_official_scores',
                                          ),
                                    textColor: brandColors.accentPrimary,
                                })}
                            </Text>
                        ) : (
                            !!stockLandingSaleText && (
                                <Text style={titleStyle} numberOfLines={2}>
                                    {stockLandingSaleText}
                                    <Text
                                        style={[
                                            stockLandingTitleColorSale,
                                            stockLandingSaleTextStyle,
                                        ]}
                                    >
                                        {stockLandingSale}
                                    </Text>
                                </Text>
                            )
                        )}
                    </View>
                    <ReAnimated.View style={[styles.fullWidth, opacitySubscriptionStyle]}>
                        <SubscribePlanComponent
                            activeSubscribePlan={activeSubscribePlan}
                            subscribePlans={currentSubscriptions}
                            onPress={onChangeSubscribePlan}
                            currentScreen="FLOATING"
                            containerStyle={[
                                styles.subscribePlanContainer,
                                isUpgrade && styles.subscribePlanContainerUpgrade,
                                planName !== 'offScores' && styles.marginBottomPlans,
                            ]}
                        />
                    </ReAnimated.View>
                    {planName === 'offScores' && (
                        <PlanSwitcher
                            colorText={colorTextSwitcher}
                            isActiveOffScores={isActiveSwitcher}
                            changeSubscriptions={onChangeSubscriptions}
                            backgroundColor={colors.gray300}
                            activeColor={stockLandingSwitcherColor}
                        />
                    )}
                    <BillingInfoComponent currentSubscriptionsGroup={currentSubscriptionsGroup} />
                </ReAnimated.ScrollView>
                <BuyButton
                    buttonText={buttonText}
                    textAboveButton={translate('native.screen_tour.free_cancel')}
                    onBuyPress={onPressStartTrial}
                    customStyleContainer={buyButtonContainerStockLandingStyle}
                    customDontTextStyle={secondTitleButtonStyle}
                    customButtonTextStyle={buttonContainerTextStyle}
                    customButtonStyle={buyButtonStockLandingStyle}
                    onCloseAndDismissPage={dismissFloatingButton}
                    isNeedToShowShadow={isNeedToShowShadow}
                    contentHeight={contentHeight}
                    shadowOpacity={scrollOffset}
                />
            </View>
        </View>
    )
}

export default React.memo(StockLanding)
