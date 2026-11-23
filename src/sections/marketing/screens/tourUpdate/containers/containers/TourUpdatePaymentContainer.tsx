import { memo, useCallback, useEffect, useState } from 'react'
import { Image, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated'

import { platform, useDidUpdate } from '@mu-native/common'
import {
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    Loader,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BenefitsComponent,
    billingThunks,
    findByProductId,
    getSaleSubscriptionsOffScores,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
    PaymentLayerCloseBlockComponent,
    SubscribePlanComponent,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TProductId,
    type TSubscription,
} from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { loadTourAnswerThunk, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import {
    getBenefitsTourUpdate,
    getTitlePaymentScreen,
    quizName,
} from '../../constants/tourUpdateConstants'
import { LearnSubscriptionTextComponent } from '../components/LearnSubscriptionTextComponent.tsx'
import TourUpdateBottomElement from '../components/TourUpdateBottomElement'

const closeIconBgStyle = 'rgba(110, 95, 121, 0.4)'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    fullWidth: { width: '100%', backgroundColor: colors.white },
    scoreImageStyle: {
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        aspectRatio: 1.8,
        alignSelf: 'center',
    },
    contentContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.white,
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(140),
    },
    closeIconBgStyle: {
        backgroundColor: closeIconBgStyle,
        left: layoutHelpers.getResponsiveSizeExtended(10),
    },
    tourTitleStyle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(44),
    },
})

const dynamicPlanStyles = {
    getDynamicPlanStyles: (isLastStep: boolean): StyleProp<ViewStyle> => [
        styles.fullWidth,
        {
            overflow: isLastStep ? 'visible' : 'hidden',
            height: isLastStep ? 'auto' : 0,
            marginBottom: layoutHelpers.getResponsiveSizeExtended(12),
        },
    ],
}

const getUpgradeTitle = (isPro: boolean, isUpgradeMode: boolean, isOffScores: boolean) => {
    if (isOffScores) return translate('native.marketing.tour_update.covered_by_pro_plus')
    if (isPro && isUpgradeMode)
        return translate('native.marketing.tour_update.upgrade_pro_to_pro_plus_required')
    return translate('native.marketing.tour_update.pro_plus_access_required')
}

type TTourUpdatePaymentComponent = { isLastStep?: boolean }

const TourUpdatePaymentComponent = ({ isLastStep }: TTourUpdatePaymentComponent) => {
    const [
        subscriptions,
        isPaymentInProgress,
        isPro,
        isOffScores,
        subscriptionProInfo,
        subscriptionOffScoresInfo,
        androidPurchaseTokens,
        isLearn,
    ] = useValues([
        getSaleSubscriptionsOffScores,
        marketingStoreChunk.props.getIsPaymentInProgress,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getCurrentSubscriptionProInfo,
        marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
        marketingStoreChunk.props.getIsCourses,
    ])
    const [activeSubscribePlanId, setActiveSubscribePlanId] = useState<TProductId>(
        subscriptions[0]?.productId,
    )
    const [isUpgradeMode, setIsUpgradeMode] = useState(false)
    const [purchaseToken, setPurchaseToken] = useState('')

    const actions = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        resetState: quizStoreChunk.actions.resetState,
        loadTourAnswerThunk,
        loadAndroidPurchaseToken: marketingThunks.loadAndroidPurchaseTokenThunk,
    })

    const { replace } = useAppNavigation()

    useEffect(() => {
        const isUpgradeMode = subscriptionHelpers.checkIsUpgradeMode({
            isPro,
            isOffScores,
            subscriptionOffScoresInfo,
            subscriptionProInfo,
        })
        if (isUpgradeMode) {
            setIsUpgradeMode(true)
            if (platform.isAndroid) actions.loadAndroidPurchaseToken()
        }
    }, [])

    useDidUpdate(() => {
        if (platform.isAndroid && isUpgradeMode && androidPurchaseTokens?.length) {
            const currentSubscriptionProductInfo = isOffScores
                ? subscriptionOffScoresInfo
                : subscriptionProInfo
            const currentSubscription = androidPurchaseTokens.find(
                item => item.product_id === currentSubscriptionProductInfo?.productId,
            )

            if (currentSubscription) {
                setPurchaseToken(currentSubscription.purchase_token)
            }
        }
    }, [androidPurchaseTokens, isUpgradeMode])

    useEffect(() => {
        if (!isLastStep) return undefined

        const plansRtParams = subscriptionsRtHelpers.withPaywallPlansRt(
            subscriptionsRtHelpers.getRtParamsBySource({
                source: marketingConstants.sources.tourUpdate,
            }),
            subscriptions,
        )
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [isLastStep])

    const onCloseTour = useCallback(() => {
        reportEvent(MetricaEvents.TOUR_UPDATE_END, {
            funnel_source: quizName,
        })
        actions.resetState()
        actions.loadTourAnswerThunk()

        replace(Screen.app, {
            index: 0,
            routes: [{ name: Screen.app }],
        })
    }, [])

    const onPurchase = useCallback(
        (subscription: TSubscription) => {
            if (!subscription?.productId) return
            const { productId } = subscription
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                ...subscriptionsRtHelpers.getRtParamsBySource({
                    source: marketingConstants.sources.tourUpdate,
                }),
                subscription_purchase:
                    subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(productId),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(productId),
            })

            actions.requestPurchaseThunk({
                subscription,
                source: marketingConstants.sources.tourUpdate,
                callback: onCloseTour,
                purchaseTokenAndroid: purchaseToken,
            })
        },
        [purchaseToken],
    )

    const onChangeSubscribePlan = useCallback(
        (activeSubscribePlanId: string) => {
            setActiveSubscribePlanId(prevActiveSubscribePlanId => {
                if (activeSubscribePlanId === prevActiveSubscribePlanId) {
                    const subscription = findByProductId(
                        subscriptions,
                        activeSubscribePlanId,
                    ) as TSubscription
                    onPurchase(subscription)

                    return prevActiveSubscribePlanId
                }
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: activeSubscribePlanId,
                    ...subscriptionsRtHelpers.getRtParamsBySource({
                        source: marketingConstants.sources.tourUpdate,
                    }),
                })

                return activeSubscribePlanId
            })
        },
        [subscriptions, onPurchase],
    )

    const onPressBuyButton = useCallback(() => {
        setActiveSubscribePlanId(prevActiveSubscribePlanId => {
            onChangeSubscribePlan(prevActiveSubscribePlanId)

            return prevActiveSubscribePlanId
        })
    }, [])

    const upgradeTitle =
        isPro && isUpgradeMode
            ? translate('native.marketing.tour_update.upgrade_to_unlock_feature')
            : ''
    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(500)}
            style={styles.container}
        >
            <Image
                resizeMode="cover"
                source={icons.tourUpdatedPaymentScreenImage}
                style={styles.scoreImageStyle}
            />
            {isLastStep && (
                <PaymentLayerCloseBlockComponent
                    onClose={onCloseTour}
                    closeIconStyle={{ tintColor: brandColors.backgroundDefault }}
                    closeIconBgStyle={styles.closeIconBgStyle}
                    containerStyle={globalStyles.fullWidth}
                />
            )}
            <ScrollView
                style={styles.fullWidth}
                scrollEnabled
                contentContainerStyle={styles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
            >
                <OnboardingTitleComponent
                    title={getTitlePaymentScreen()}
                    titleStyle={styles.tourTitleStyle}
                    subTitle={getUpgradeTitle(isPro, isUpgradeMode, isOffScores)}
                />
                <Animated.View
                    layout={LinearTransition.duration(800)}
                    style={styles.contentContainer}
                >
                    <View style={dynamicPlanStyles.getDynamicPlanStyles(!!isLastStep)}>
                        <SubscribePlanComponent
                            activeSubscribePlan={activeSubscribePlanId}
                            onPress={onChangeSubscribePlan}
                            currentScreen="TOUR_UPDATE"
                            subscribePlans={subscriptions}
                        />
                    </View>
                    <Animated.View layout={LinearTransition.duration(300)}>
                        <BenefitsComponent
                            subscriptionBenefits={getBenefitsTourUpdate()}
                            iconCheckSource={icons.tourUpdatedCheckedIcon}
                            marginBottom={20}
                        />
                    </Animated.View>
                </Animated.View>
                {!isLastStep && isLearn && <LearnSubscriptionTextComponent />}
            </ScrollView>
            {!!isLastStep && (
                <TourUpdateBottomElement
                    textAboveButton={
                        isLastStep ? translate('native.screen_tour.free_cancel') : upgradeTitle
                    }
                    isFirstStep={false}
                    text={translate('native.screen_tour.start_now_text')}
                    onNextPress={onPressBuyButton}
                />
            )}
            {isPaymentInProgress && <Loader />}
        </Animated.View>
    )
}

export default memo(TourUpdatePaymentComponent)
