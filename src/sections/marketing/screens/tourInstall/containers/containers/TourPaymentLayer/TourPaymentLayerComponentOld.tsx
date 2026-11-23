import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Image, ImageStyle, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform } from '@mu-native/common'
import {
    AppText,
    colors,
    layout,
    layoutHelpers,
    Loader,
    NativeBottomSheet,
    SheetFooter,
    style,
    textHelpers,
} from '@mu-native/ds'
import { dynamicDecorHelpers, dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    closeIconContrastBgColor,
    findByProductId,
    getAllSubscriptions,
    getTimerLeft,
    marketingConstants,
    marketingStoreChunk,
    PlanSwitcher,
    PlanType,
    SubscribePlanComponent,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TourSteps,
    TProductId,
    TSubscription,
    useCloseIconContrastBgExperiment,
    useRemoveProSwitcherTourExperiment,
    useUgPlanLineup4IterationExperiment,
} from '@mu-native/marketing'
import { getIsStudent, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'
import debounce from 'lodash/debounce'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../../../../App/Utils/Analytics.ts'
import { tourInstallScreenStoreChunk } from '../../../store/tourInstallScreenStoreChunk'
import { onCloseTourThunk } from '../../../store/tourInstallThunkActions'

import FeaturesModalComponent from './components/FeaturesModalComponent'
import GradientComponent from './components/GradientComponent'
import TourInstallTopComponent from './components/TourInstallTopComponent'
import TrialModalComponent from './components/TrialModal'
import TourTimerContainer from './containers/TourTimerContainer'
import { getStartNowText } from './helpers'
import { useSheetHeights } from './hooks/useSheetHeights'
import { useTourTrialReanimatedStyle } from './hooks/useTourTrialReanimatedStyle'

const { getRtParamsBySource } = subscriptionsRtHelpers

const styles = StyleSheet.create({
    scroll: style.view({
        width: '100%',
        flexGrow: 1,
    }),
    containerPlanStyle: style.view({
        minHeight: layoutHelpers.getResponsiveSizeExtended(260),
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(12),
    }),
    imageContainer: style.view({
        justifyContent: 'flex-start',
    }),
    scrollViewContainer: style.view({
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(24),
        paddingBottom: 80,
    }),
    contentPlanContainer: style.view({ width: '100%', alignSelf: 'center' }),
    tourTopComponent: style.view({
        zIndex: 100,
        paddingHorizontal: 0,
        maxWidth: '96%',
        alignSelf: 'center',
    }),
    customHeaderBottomSheet: style.view({
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        height: 20,
        backgroundColor: colors.white,
    }),
    saleTextTitle: style.text({
        fontSize: layoutHelpers.getResponsiveSizeExtended(20),
        color: colors.text900,
        textAlign: 'center',
        fontWeight: '600',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(6),
    }),
    ugPlanLineupTitle: style.text({
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(12),
    }),
    paymentLayerBg: style.image({
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: -1,
    }),
    tourBillingInfoContainer: style.view({
        alignItems: 'center',
    }),
    buttonBuyStyle: style.view({
        borderWidth: 0,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
    }),
    buttonBuyTextStyle: style.text({
        fontSize: layoutHelpers.getResponsiveSize(16),
        lineHeight: layoutHelpers.getResponsiveSize(20),
        textTransform: 'capitalize',
        fontWeight: '500',
    }),
    tourImage: style.image({
        height: platform.isTablet ? 340 : layoutHelpers.getResponsiveSizeExtended(220),
        width: '80%',
        alignSelf: 'center',
        zIndex: 1,
    }),
    loaderZIndex: { zIndex: 1000 },
})

const dynamicStyles = {
    getTourImageStyle: (tourDynamicStyle: ImageStyle) => [
        styles.tourImage,
        !!tourDynamicStyle && tourDynamicStyle,
    ],
}

const buttonTexts = {
    [marketingConstants.yearLiteSubscriptionId]: translate('native.screen_tour.start_trial_text'),
    [marketingConstants.yearOffScoresLiteSubscriptionId]: translate(
        'native.screen_tour.start_trial_text',
    ),
    [marketingConstants.pro69SubscriptionId]: translate('native.screen_tour.start_trial_text'),
    [marketingConstants.offScores99SubscriptionIdTrial]: translate(
        'native.screen_tour.start_trial_text',
    ),
}
const offScoresGroup = 'offScores'
const proGroup = 'pro'
const learnGroup = 'learning'
const renderCustomHeader = () => <View style={styles.customHeaderBottomSheet} />

export const TourPaymentLayerComponentOld = memo(() => {
    const opacityView = useSharedValue(0)

    const actions = useActions({
        setTimerTour: marketingStoreChunk.actions.setTimerTour,
        onCloseTourThunk,
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })

    const [
        userName,
        routeSource,
        isCourses,
        subscribePlans,
        isPaymentInProgress,
        tourAnswerNames,
        quizQuestions,
        isPro,
        isOffScores,
        isStudent,
        {
            tourCloseIconStyle,
            tourImageStyle,
            tourBuyButtonStyle,
            switcherTourActiveColor,
            tour_image_sale: tourImageSale,
            tourSaleText,
            tourSaleTextStyle,
            closeTourIconBgColor,
            tour_image_bg_phone: tourImageBgPhone,
            tour_image_bg_tablet: tourImageBgTablet,
            gradientTourColors,
        },
    ] = useValues([
        tourInstallScreenStoreChunk.props.getUserName,
        tourInstallScreenStoreChunk.props.getRouteSource,
        marketingStoreChunk.props.getIsCourses,
        getAllSubscriptions,
        marketingStoreChunk.props.getIsPaymentInProgress,
        quizStoreChunk.props.getQuizAnswersNames,
        quizStoreChunk.props.getQuizQuestions,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        getIsStudent,
        dynamicDecorStoreChunk.props.getActiveDecorData,
    ])
    const [isShowTrialsModal, setIsShowTrialsModal] = useState(false)

    const offScoresDefaultGroup = offScoresGroup
    const proDefaultGroup = proGroup

    const [currentSubscriptionsGroup, setCurrentSubscriptionsGroup] = useState<PlanType>(
        isPro ? learnGroup : offScoresGroup,
    )

    const [isActiveShortPlan, setIsActiveShortPlan] = useState(true)
    const [isActiveSwitcher, setIsActiveSwitcher] = useState(true)

    const { requestPurchaseThunk } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })

    const { isUgPlanLineup4Iteration: isUgPlanLineup4IterationVariation } =
        useUgPlanLineup4IterationExperiment(!isShowTrialsModal)

    const isPlanSwitcherAvailable = !isPro
    const { isRemoveProSwitcherTour } = useRemoveProSwitcherTourExperiment(
        isPlanSwitcherAvailable && !isShowTrialsModal,
    )

    const updatedSubscriptions = useMemo(
        () => subscribePlans?.[currentSubscriptionsGroup] || [],
        [subscribePlans, currentSubscriptionsGroup],
    )

    const [activeSubscribePlan, setActiveSubscribePlan] = useState<TProductId>(
        subscriptionHelpers.getActiveProductId({ subscriptions: updatedSubscriptions }),
    )
    const [isShowFeaturesLayer, setIsShowFeaturesLayer] = useState(false)

    const onCloseTourAction = useCallback(() => {
        reportEvent(MetricaEvents.TOUR_PAYMENT_LAYER_CLOSE, {
            ...getRtParamsBySource({
                source: marketingConstants.sources.tourInstall,
                isLearnPlan: isPro,
            }),
            ...(routeSource ? { funnel_source: routeSource } : {}),
            datetime_timer: getTimerLeft(),
            value: 'none',
        })

        if (isOffScores || platform.isIos) {
            actions.onCloseTourThunk()

            return
        }

        setIsShowFeaturesLayer(true)
    }, [isOffScores])

    const onPurchase = (subscription: TSubscription) => {
        if (!subscription) return
        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            ...getRtParamsBySource({
                source: marketingConstants.sources.tourInstall,
                isLearnPlan: isPro,
            }),
            subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                subscription.productId,
            ),
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription.productId),
            ...(routeSource ? { funnel_source: routeSource } : {}),
            datetime_timer: getTimerLeft(),
            'quiz_answer.value': tourAnswerNames,
            'quiz_answer.question': quizQuestions,
        })

        requestPurchaseThunk({
            subscription,
            source: routeSource || marketingConstants.sources.tourInstall,
            callback: () => {
                actions.onCloseTourThunk()
            },
            isOfferPersonalized: true,
        })
    }

    const onChangeSubscribePlan = useCallback(
        (activeSubscribePlanId: string) => {
            setActiveSubscribePlan(prevActiveSubscribePlanId => {
                if (activeSubscribePlanId === prevActiveSubscribePlanId) {
                    const subscription = findByProductId(
                        updatedSubscriptions,
                        activeSubscribePlanId,
                    ) as TSubscription
                    onPurchase(subscription)

                    return prevActiveSubscribePlanId
                }
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: activeSubscribePlanId,
                    ...getRtParamsBySource({ source: marketingConstants.sources.tourInstall }),
                    ...(routeSource ? { funnel_source: routeSource } : {}),
                    datetime_timer: getTimerLeft(),
                    'quiz_answer.value': tourAnswerNames,
                    'quiz_answer.question': quizQuestions,
                })

                return activeSubscribePlanId
            })
        },
        [updatedSubscriptions],
    )
    const onPressStartTrial = useCallback(
        debounce(() => {
            setActiveSubscribePlan(prevActiveSubscriptionPlanId => {
                const subscription = findByProductId(
                    updatedSubscriptions,
                    prevActiveSubscriptionPlanId,
                ) as TSubscription
                onPurchase(subscription)

                return prevActiveSubscriptionPlanId
            })
        }, 500),
        [updatedSubscriptions],
    )

    const onChangeSubscriptionsCallback = () => {
        setIsActiveShortPlan(prevState => {
            const nextSubscriptionsGroup = prevState ? proDefaultGroup : offScoresDefaultGroup

            setCurrentSubscriptionsGroup(nextSubscriptionsGroup)
            setActiveSubscribePlan(
                subscriptionHelpers.getActiveProductId({
                    subscriptions: subscribePlans[nextSubscriptionsGroup],
                }),
            )

            reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
                ...getRtParamsBySource({
                    source: marketingConstants.sources.tourInstall,
                    isLearnPlan: isPro,
                }),
                ...(routeSource ? { funnel_source: routeSource } : {}),
                datetime_timer: getTimerLeft(),
                'quiz_answer.value': tourAnswerNames,
                'quiz_answer.question': quizQuestions,
                ...subscriptionsRtHelpers.getProSwitcherRtParams(!prevState),
            })

            return !prevState
        })
    }

    const onChangeSubscriptionsSwitcher = useCallback(() => {
        setIsActiveSwitcher(prevState => !prevState)
        opacityView.value = withTiming(0, { duration: 200 }, (finished?: boolean) => {
            if (finished) {
                scheduleOnRN(onChangeSubscriptionsCallback)
                opacityView.value = withTiming(1, { duration: 600 })
            }
        })
    }, [])

    const onNextStep = useCallback(() => {
        actions.setStep(TourSteps.BENEFITS_SCREEN)
    }, [])

    const isUgPlanLineup = isUgPlanLineup4IterationVariation
    const activeSubscription = findByProductId(updatedSubscriptions, activeSubscribePlan)

    const textAboveButton =
        (isUgPlanLineup && activeSubscription?.ugPlanLineup?.textAboveButton) ||
        (activeSubscription?.isTrialAvailable
            ? activeSubscription?.textAboveButton
            : translate('native.screen_tour.free_cancel'))

    const userNameTitle = userName ? textHelpers.titleCase(userName?.trim()) : ''

    const buttonText = buttonTexts[activeSubscribePlan] || getStartNowText(userNameTitle)

    useEffect(() => {
        if (isCourses && isOffScores) actions.onCloseTourThunk()

        if (isShowTrialsModal) {
            reportEvent(MetricaEvents.TOUR_MODAL_VIEW, {
                ...getRtParamsBySource({ source: marketingConstants.sources.tourInstall }),
                'quiz_answer.value': tourAnswerNames,
                'quiz_answer.question': quizQuestions,
                ...(routeSource ? { funnel_source: routeSource } : {}),
            })
        }
        if (isShowTrialsModal) {
            return () => {
                actions.setTimerTour(null)
            }
        }

        actions.setTimerTour(marketingConstants.dateForBadgeTimer)
        reportEvent(MetricaEvents.LANDING_VIEW, {
            landing_name: 'Tour install',
            funnel_type: 'unintentional',
        })
        const plansRtParams = {
            ...subscriptionsRtHelpers.withPaywallPlansRt(
                getRtParamsBySource({
                    source: marketingConstants.sources.tourInstall,
                    isLearnPlan: isPro,
                }),
                updatedSubscriptions,
            ),
            ...(routeSource ? { funnel_source: routeSource } : {}),
            'quiz_answer.value': tourAnswerNames,
            'quiz_answer.question': quizQuestions,
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ...plansRtParams,
            datetime_timer: getTimerLeft(),
        })

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                ...plansRtParams,
                datetime_timer: getTimerLeft(),
            })
            actions.setTimerTour(null)
        }
    }, [isShowTrialsModal])

    const { animatedValueViewButton, animatedViewSubscriptions, animatedViewSwitcher } =
        useTourTrialReanimatedStyle(opacityView, isShowTrialsModal)
    const { isCloseIconContrastBg } = useCloseIconContrastBgExperiment(!isShowTrialsModal)
    const { sheetHeight, collapsedHeight } = useSheetHeights()

    if (isCourses && isOffScores) return null

    return (
        <>
            <View style={styles.scroll}>
                {!isShowTrialsModal && (
                    <TourInstallTopComponent
                        testID="Tour install close trial"
                        onLeftPress={onCloseTourAction}
                        rightTitle={translate('native.billing_restore')}
                        style={styles.tourTopComponent}
                        customIconColorStyle={tourCloseIconStyle}
                        backgroundColorIcon={
                            isCloseIconContrastBg ? closeIconContrastBgColor : closeTourIconBgColor
                        }
                    />
                )}
                <GradientComponent gradientTourColors={gradientTourColors} />
                {!isShowTrialsModal && (
                    <Animated.View
                        entering={FadeIn.duration(600).delay(300)}
                        style={styles.imageContainer}
                    >
                        <Image
                            resizeMode="contain"
                            style={dynamicStyles.getTourImageStyle(tourImageStyle)}
                            source={dynamicDecorHelpers.getUriSourceByImageUrl(tourImageSale)}
                        />
                    </Animated.View>
                )}
                {!!tourImageBgPhone && !!tourImageBgTablet && (
                    <Image
                        style={styles.paymentLayerBg}
                        source={dynamicDecorHelpers.getUriSourceByImageUrl(
                            platform.isTablet ? tourImageBgTablet : tourImageBgPhone,
                        )}
                    />
                )}
                {!isShowTrialsModal && (
                    <NativeBottomSheet
                        inline
                        presentOnMount
                        hideHandle
                        enablePanDownToClose={false}
                        overlayOpacity={0}
                        radius={12}
                        maxHeight={sheetHeight}
                        rootViewStyle={{ height: sheetHeight }}
                        applyMaxHeightToMinHeight
                        collapsedHeight={collapsedHeight}
                        maxWidth={platform.isTablet ? layout.maxWidthTabletContainer : undefined}
                    >
                        {renderCustomHeader()}
                        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                            <View style={styles.contentPlanContainer}>
                                {!!tourSaleText &&
                                    (isUgPlanLineup ? (
                                        <AppText
                                            rawText={translate('native.marketing.choose_your_plan')}
                                            font="f20w600"
                                            textAlign="center"
                                            style={styles.ugPlanLineupTitle}
                                            adaptiveSize
                                        />
                                    ) : (
                                        <Text style={styles.saleTextTitle}>
                                            {tourSaleText}
                                            <Text style={[styles.saleTextTitle, tourSaleTextStyle]}>
                                                {marketingConstants.getSaleValueForPaymentLayer(
                                                    currentSubscriptionsGroup,
                                                )}
                                            </Text>
                                        </Text>
                                    ))}
                                <Animated.View style={animatedViewSubscriptions}>
                                    <SubscribePlanComponent
                                        subscribePlans={updatedSubscriptions}
                                        activeSubscribePlan={activeSubscribePlan}
                                        onPress={onChangeSubscribePlan}
                                        currentScreen="TOUR_INSTALL"
                                        containerStyle={styles.containerPlanStyle}
                                    />
                                </Animated.View>
                                {isPlanSwitcherAvailable &&
                                    !isRemoveProSwitcherTour &&
                                    !isShowTrialsModal && (
                                        <Animated.View style={animatedViewSwitcher}>
                                            <PlanSwitcher
                                                colorText={colors.text900}
                                                backgroundColor={colors.gray300}
                                                isActiveOffScores={isActiveSwitcher}
                                                changeSubscriptions={onChangeSubscriptionsSwitcher}
                                                activeColor={switcherTourActiveColor}
                                            />
                                        </Animated.View>
                                    )}
                                <Animated.View
                                    style={[
                                        styles.tourBillingInfoContainer,
                                        animatedValueViewButton,
                                    ]}
                                >
                                    <BillingInfoComponent
                                        currentSubscriptionsGroup={currentSubscriptionsGroup}
                                    />
                                </Animated.View>
                            </View>
                        </ScrollView>
                    </NativeBottomSheet>
                )}
            </View>
            <SheetFooter>
                <BuyButton
                    isStatic
                    onBuyPress={onPressStartTrial}
                    buttonText={buttonText}
                    textAboveButton={textAboveButton}
                    customButtonStyle={[styles.buttonBuyStyle, tourBuyButtonStyle]}
                    customButtonTextStyle={styles.buttonBuyTextStyle}
                    customStyleContainer={animatedValueViewButton}
                />
            </SheetFooter>
            {isPaymentInProgress && (
                <SheetFooter fullScreen>
                    <Loader style={styles.loaderZIndex} />
                </SheetFooter>
            )}
            {isShowTrialsModal && (
                <SheetFooter fullScreen>
                    <TrialModalComponent
                        setIsShowTrialsModal={setIsShowTrialsModal}
                        isShowTrialsModal={isShowTrialsModal}
                    />
                </SheetFooter>
            )}
            {isShowFeaturesLayer && (
                <SheetFooter fullScreen>
                    <FeaturesModalComponent
                        isStudent={isStudent}
                        onNextStep={onNextStep}
                        isShowFeaturesModal={isShowFeaturesLayer}
                    />
                </SheetFooter>
            )}
            <TourTimerContainer />
        </>
    )
})
