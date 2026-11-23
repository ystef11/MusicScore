import { useCallback, useEffect, useState } from 'react'
import { Image, LayoutChangeEvent, StatusBar, StyleSheet, View } from 'react-native'
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    Loader,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    findByProductId,
    getFlashSaleSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    PaymentLayerCloseBlockComponent,
    SubscribePlanComponent,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TProductId,
    TSubscription,
    useAnimatedScrollShadow,
} from '@mu-native/marketing'
import { useAppRoute, useNavigation } from '@mu-native/navigation'
import { useWindowDimensions } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { TimerBadge } from '../components/TimerBadge.tsx'
import {
    indexOfFirstItemInColumn,
    indexOfLastItemInColumn,
} from '../constants/flashSplashConstants'

const imagesArrayFirstLine = [
    icons.coursesCarousel_1,
    icons.coursesCarousel_3,
    icons.coursesCarousel_4,
    icons.coursesCarousel_2,
    icons.coursesCarousel_9,
]
const imagesArrayFirstLineOffScores = [
    icons.coursesCarousel_11,
    icons.coursesCarousel_13,
    icons.coursesCarousel_12,
    icons.coursesCarousel_2,
    icons.coursesCarousel_9,
]

const imagesArrayFirstLineOffScoresLandscape = [
    icons.coursesCarousel_11,
    icons.coursesCarousel_13,
    icons.coursesCarousel_14,
    icons.coursesCarousel_15,
    icons.coursesCarousel_12,
]

const imagesArraySecondLine = [
    icons.coursesCarousel_6,
    icons.coursesCarousel_7,
    icons.coursesCarousel_5,
    icons.coursesCarousel_8,
    icons.coursesCarousel_10,
]

const imagesArraySecondLineOffScores = [
    icons.coursesCarousel_14,
    icons.coursesCarousel_15,
    icons.coursesCarousel_14,
    icons.coursesCarousel_8,
    icons.coursesCarousel_10,
]

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    paymentModalContainer: {
        width: '100%',
    },
    contentContainerScroll: {
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
        minHeight: '100%',
    },
    itemImageCarousel: {
        width: layoutHelpers.getResponsiveSizeExtended(210),
        height: layoutHelpers.getResponsiveSizeExtended(120),
        marginRight: layoutHelpers.getResponsiveSizeExtended(2),
    },
    itemImageLandscape: {
        width: getResponsiveSizeExtended(198),
    },
    carouselSecondContainer: {
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        width: '100%',
    },
    firstItemImageFirstCarousel: {
        width: 100,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
        marginLeft: 0,
    },
    firstItemImageFirstCarouselExp: {
        marginLeft: 0,
    },
    firstItemImageSecondCarousel: {
        width: 180,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
    },
    lastItemImageFirstCarousel: {
        width: 104,
        marginRight: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        marginLeft: platform.isTablet ? 0 : '20%',
    },
    lastItemImageSecondCarousel: {
        width: 24,
        marginRight: 0,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
    },
    subscribePlanContainer: {
        alignSelf: 'center',
        minHeight: 200,
    },
    plansContainer: {
        padding: layout.marginMd,
        alignSelf: 'center',
        width: '100%',
        justifyContent: 'center',
        marginTop: -getResponsiveSizeExtended(40),
    },
})

const imageWidthContent = 228 * 4 + 180 + 104 + 16 * 5

const FlashSplashComponent = () => {
    const [isPaymentInProgress, subscriptionsGroup] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getFlashSaleSubscriptions,
    ])

    const { goBack } = useNavigation()
    const { planName = 'learn' } = useAppRoute<{ planName: 'offScores' | 'learn' }>()
    const { requestPurchaseThunk } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })
    const isLearnFlashSale = planName === 'learn'
    const subscriptions = subscriptionsGroup?.[planName] || []

    const opacityModal = useSharedValue(0)

    const [activeSubscribePlanId, setActiveSubscriptionPlan] = useState(
        subscriptionHelpers.getActiveProductId({
            subscriptions,
        }),
    )
    const [isHideSecondImageLine, setIsHideSecondImageLine] = useState(false)

    const { height, width } = useWindowDimensions()
    const isLandscape = width > height

    // для больших планшетов в гориз. режиме картинки нужно растягивать
    const isBigImages = height < width && width > imageWidthContent

    const onPurchase = (subscription: TSubscription) => {
        const source = isLearnFlashSale
            ? marketingConstants.sources.splashFlashSale
            : marketingConstants.sources.splashFlashSaleOffScores

        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            ui: 'flash sale',
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription?.productId),
            subscription_type: [isLearnFlashSale ? 'learn' : 'pro_plus'],
            subscription_purchase: isLearnFlashSale ? 'learn' : 'pro_plus',
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: source,
            have_quiz: 'no',
        })
        requestPurchaseThunk({
            subscription,
            source,
            callback: goBack,
        })
    }

    const onChangeSubscribePlan = useCallback(
        (activeSubscribePlan: TProductId) => {
            setActiveSubscriptionPlan(prevActiveSubscribePlan => {
                if (prevActiveSubscribePlan === activeSubscribePlan) {
                    const subscription = findByProductId(
                        subscriptions,
                        activeSubscribePlan,
                    ) as TSubscription
                    onPurchase(subscription)

                    return prevActiveSubscribePlan
                }

                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: activeSubscribePlan,
                    ui: 'flash sale',
                    subscription_type: [isLearnFlashSale ? 'learn' : 'pro_plus'],
                    funnel_type: 'intentional',
                    landing_name: 'Special offer',
                    funnel_source: isLearnFlashSale
                        ? marketingConstants.sources.splashFlashSale
                        : marketingConstants.sources.splashFlashSaleOffScores,
                    have_quiz: 'no',
                })
                return activeSubscribePlan
            })
        },
        [subscriptions],
    )

    useEffect(() => {
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ui: 'flash sale',
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                [isLearnFlashSale ? 'learn' : 'pro_plus'],
                subscriptions,
            ),
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: isLearnFlashSale
                ? marketingConstants.sources.splashFlashSale
                : marketingConstants.sources.splashFlashSaleOffScores,
            have_quiz: 'no',
        })

        const statusBarStackEntry = StatusBar.pushStackEntry({
            barStyle: 'dark-content',
        })

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                ui: 'flash sale',
                subscription_type: [isLearnFlashSale ? 'learn' : 'pro_plus'],
                funnel_type: 'intentional',
                landing_name: 'Special offer',
                funnel_source: isLearnFlashSale
                    ? marketingConstants.sources.splashFlashSale
                    : marketingConstants.sources.splashFlashSaleOffScores,
                have_quiz: 'no',
            })
            StatusBar.popStackEntry(statusBarStackEntry)
        }
    }, [])

    const onButItemPress = useCallback(() => {
        setActiveSubscriptionPlan(activeSubscribePlanId => {
            const subscription = findByProductId(
                subscriptions,
                activeSubscribePlanId,
            ) as TSubscription
            onPurchase(subscription)

            return activeSubscribePlanId
        })
    }, [])

    const onLayoutSubscribeComponent = ({ nativeEvent }: LayoutChangeEvent) => {
        const { layout } = nativeEvent
        // расчет высоты контента планов и картинок
        setIsHideSecondImageLine(isLandscape || layout.height + 12 * 2 + 104 * 2 + 80 > height)

        opacityModal.value = withTiming(1, { duration: 800 })
    }

    const { onContentSizeChange, scrollHandler, contentHeight, scrollOffset, isNeedToShowShadow } =
        useAnimatedScrollShadow()

    const opacityModalStyle = useAnimatedStyle(() => ({
        opacity: opacityModal.value,
    }))

    const imagesOffScoresFirstLine = isLandscape
        ? imagesArrayFirstLineOffScoresLandscape
        : imagesArrayFirstLineOffScores

    return (
        <View style={styles.paymentModalContainer}>
            <Reanimated.View style={opacityModalStyle}>
                <Reanimated.ScrollView
                    scrollEventThrottle={30}
                    onScroll={scrollHandler}
                    style={globalStyles.fullWidth}
                    onContentSizeChange={onContentSizeChange}
                    contentContainerStyle={styles.contentContainerScroll}
                >
                    <PaymentLayerCloseBlockComponent
                        onClose={goBack}
                        isAbsolutePosition
                        closeIconStyle={{ tintColor: brandColors.backgroundDefault }}
                        containerStyle={{ backgroundColor: brandColors.overlyModal }}
                    />
                    <View style={styles.carouselSecondContainer}>
                        {(isLearnFlashSale ? imagesArrayFirstLine : imagesOffScoresFirstLine).map(
                            (item, index) => (
                                <Image
                                    style={[
                                        styles.itemImageCarousel,
                                        isBigImages && styles.itemImageLandscape,
                                        index === indexOfFirstItemInColumn &&
                                            styles.firstItemImageFirstCarousel,
                                        styles.firstItemImageFirstCarouselExp,
                                        index === indexOfLastItemInColumn &&
                                            styles.lastItemImageFirstCarousel,
                                    ]}
                                    key={index}
                                    source={item}
                                    resizeMode="cover"
                                />
                            ),
                        )}
                    </View>
                    {!isHideSecondImageLine && (
                        <View style={styles.carouselSecondContainer}>
                            {(isLearnFlashSale
                                ? imagesArraySecondLine
                                : imagesArraySecondLineOffScores
                            ).map((item, index) => (
                                <Image
                                    style={[
                                        styles.itemImageCarousel,
                                        isBigImages && styles.itemImageLandscape,
                                        index === indexOfFirstItemInColumn &&
                                            styles.firstItemImageSecondCarousel,
                                        index === indexOfLastItemInColumn &&
                                            styles.lastItemImageSecondCarousel,
                                    ]}
                                    key={index}
                                    source={item}
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    )}
                    <TimerBadge />
                    <View style={styles.plansContainer} onLayout={onLayoutSubscribeComponent}>
                        <AppText
                            rawText={translate('native.marketing.flash_sale.dont_miss_offer', {
                                plan: isLearnFlashSale ? 'Courses' : 'PRO+',
                            })}
                            adaptiveSize
                            textAlign="center"
                            font="f20w600"
                            style={globalStyles.mb16}
                        />
                        <SubscribePlanComponent
                            activeSubscribePlan={activeSubscribePlanId}
                            subscribePlans={subscriptions}
                            onPress={onChangeSubscribePlan}
                            currentScreen="FLOATING"
                            containerStyle={styles.subscribePlanContainer}
                        />
                    </View>
                    <View style={globalStyles.horizontalPadding20}>
                        <BillingInfoComponent currentSubscriptionsGroup="learning" />
                    </View>
                </Reanimated.ScrollView>
                <BuyButton
                    onBuyPress={onButItemPress}
                    buttonText={translate('native.screen_tour.start_now_text')}
                    textAboveButton={translate('native.screen_tour.free_cancel')}
                    shadowOpacity={scrollOffset}
                    contentHeight={contentHeight}
                    isNeedToShowShadow={isNeedToShowShadow}
                />
                {isPaymentInProgress && <Loader />}
            </Reanimated.View>
        </View>
    )
}

export default FlashSplashComponent
