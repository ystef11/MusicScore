import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform, useDidUpdate } from '@mu-native/common'
import { brandColors, layoutHelpers, Loader, SheetFooter } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    billingThunks,
    BuyButton,
    closeIconContrastBgColor,
    ExperimentsMonetization,
    findByProductId,
    getTimerLeft,
    getTourSecondBlockSubscriptions,
    getTourSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TourLongPaymentLayerPlansComponent,
    TourSteps,
    TPlanTypeTourInstall,
    type TProductId,
    TSources,
    type TSubscription,
    useCloseIconContrastBgExperiment,
    useClosePaymentScreen,
    useMonetizationExperiment,
} from '@mu-native/marketing'
import { getIsStudent, quizHelpers } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { tourInstallScreenStoreChunk } from '../../../store/tourInstallScreenStoreChunk'
import { onCloseTourThunk } from '../../../store/tourInstallThunkActions'

import FeaturesModalComponent from './components/FeaturesModalComponent'
import GradientComponent from './components/GradientComponent'
import TourInstallTopComponent from './components/TourInstallTopComponent'
import TrialModalComponent from './components/TrialModal'
import { plansWithSwitcher, subscriptionTourGroup } from './constants.ts'
import { DoubtModalContainer } from './containers/DoubtModalContainer.tsx'
import TourTimerContainer from './containers/TourTimerContainer'
import { useDoubtModalLogic } from './hooks/useDoubtModalLogic.ts'
import { useGetSubscriptionGroup } from './hooks/useGetSubscriptionGroup.ts'
import { useTourTrialReanimatedStyle } from './hooks/useTourTrialReanimatedStyle'

const { getRtParamsBySource } = subscriptionsRtHelpers

const styles = StyleSheet.create({
    scroll: {
        width: '100%',
        flexGrow: 1,
    },
    buttonBuyTextStyle: {
        fontSize: layoutHelpers.getResponsiveSize(16),
        lineHeight: layoutHelpers.getResponsiveSize(20),
        textTransform: 'capitalize',
        fontWeight: '500',
    },
    loaderZIndex: { zIndex: 10 },
})

export const TourLongPaymentLayerContainer = memo(() => {
    const opacityView = useSharedValue(0)
    const actions = useActions({
        setTimerTour: marketingStoreChunk.actions.setTimerTour,
        onCloseTourThunk,
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })

    const [
        isCourses,
        subscribePlans,
        isPaymentInProgress,
        isHadProAccess,
        isHadProAccessOffScores,
        isPro,
        isOffScores,
        isStudent,
        activeDecorData,
        subscriptionSecondBlock,
        isShowDoubtModal,
    ] = useValues([
        marketingStoreChunk.props.getIsCourses,
        getTourSubscriptions,
        marketingStoreChunk.props.getIsPaymentInProgress,
        marketingStoreChunk.props.getIsHadProAccess,
        marketingStoreChunk.props.getIsHadProAccessOffScores,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        getIsStudent,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        getTourSecondBlockSubscriptions,
        tourInstallScreenStoreChunk.props.getIsShowDoubtModal,
    ])
    const { requestPurchaseThunk } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })

    const isHadAccess = isHadProAccess && isHadProAccessOffScores

    const [isShowTrialModal, setIsShowTrialsModal] = useState(platform.isAndroid && !isHadAccess)
    const { subscriptionGroup } = useGetSubscriptionGroup(true)
    const [currentSubscriptionsGroup, setCurrentSubscriptionsGroup] =
        useState<TPlanTypeTourInstall>(
            platform.isIos && isPro ? subscriptionTourGroup.learnGroup : subscriptionGroup,
        )
    const [isActiveShortPlan, setIsActiveShortPlan] = useState(true)
    const [isActiveSwitcher, setIsActiveSwitcher] = useState(true)
    const [isUserScrollDown, setIsUserScrollDown] = useState(false)

    const [isNeedToShowTimer, setIsNeedToShowTimer] = useState(false)
    const [source, setSource] = useState<TSources>(marketingConstants.sources.tourInstall)

    const updatedSubscriptions = useMemo(() => {
        return subscribePlans?.[currentSubscriptionsGroup] || []
    }, [subscribePlans, currentSubscriptionsGroup])

    const [activeSubscribePlan, setActiveSubscribePlan] = useState<TProductId>(
        subscriptionHelpers.getActiveProductId({ subscriptions: updatedSubscriptions }),
    )
    const [isShowFeaturesLayer, setIsShowFeaturesLayer] = useState(false)

    const setExpSubscriptionGroupCallback = useCallback(() => {
        setIsNeedToShowTimer(false)
        setCurrentSubscriptionsGroup(subscriptionTourGroup.offScoreDoubt)
        setIsActiveSwitcher(true)
    }, [])

    const { variation: variationDiscountLabel } = useMonetizationExperiment(
        platform.isAndroid && !isShowTrialModal,
        8069,
        ExperimentsMonetization.discountLabel,
    )
    const isShowSaleLabelExp = platform.isAndroid && variationDiscountLabel === 2

    useDidUpdate(() => {
        setActiveSubscribePlan(
            subscriptionHelpers.getActiveProductId({
                subscriptions: updatedSubscriptions,
                customId: plansWithSwitcher.includes(activeSubscribePlan)
                    ? updatedSubscriptions?.[0]?.productId
                    : '',
            }),
        )
    }, [updatedSubscriptions])

    const onSetSubscriptionGroupCallback = useCallback(() => {
        setSource(marketingConstants.sources.tourInstallAndroidGift)
        setCurrentSubscriptionsGroup(subscriptionTourGroup.offScoresGroup)
        setIsActiveShortPlan(true)
        setIsActiveSwitcher(true)
    }, [])

    const onCloseTourAction = useCallback(() => {
        reportEvent(MetricaEvents.TOUR_PAYMENT_LAYER_CLOSE, {
            ...getRtParamsBySource({
                source,
                isLearnPlan: isPro,
            }),
            datetime_timer: getTimerLeft(),
            value: 'none',
        })

        if (isOffScores || platform.isIos) {
            actions.onCloseTourThunk()

            return
        }

        setIsShowFeaturesLayer(true)
    }, [isOffScores, source])

    const onPurchase = (subscription: TSubscription) => {
        if (!subscription?.productId) return

        const subscriptionData = subscriptionsRtHelpers.getRtBillingParams(subscription)

        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            ...getRtParamsBySource({
                source,
                isLearnPlan: isPro,
            }),
            subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                subscription.productId,
            ),
            productId: subscription.productId,
            datetime_timer: getTimerLeft(),
            ...quizHelpers.getQuizAnswersRt(),
            'params.key': [...subscriptionData['params.key']],
            'params.str_value': [...subscriptionData['params.str_value']],
            'params.value': [...subscriptionData['params.value']],
        })

        requestPurchaseThunk({
            subscription,
            source,
            callback: actions.onCloseTourThunk,
            isOfferPersonalized: true,
        })
    }

    const onChangeSubscribePlan = useCallback(
        (activeSubscribePlanId: string) => {
            setActiveSubscribePlan(prevActiveSubscribePlanId => {
                if (activeSubscribePlanId === prevActiveSubscribePlanId) {
                    const subscription = (findByProductId(
                        updatedSubscriptions,
                        activeSubscribePlanId,
                    ) ||
                        findByProductId(
                            subscriptionSecondBlock,
                            activeSubscribePlanId,
                        )) as TSubscription
                    if (
                        // stay free plan
                        subscription.productId !==
                        marketingConstants.proPlusAutoGradeInstantSubscriptionId
                    ) {
                        onPurchase(subscription)
                    }

                    return prevActiveSubscribePlanId
                }
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: activeSubscribePlanId,
                    ...getRtParamsBySource({ source }),
                    datetime_timer: getTimerLeft(),
                    ...quizHelpers.getQuizAnswersRt(),
                })

                return activeSubscribePlanId
            })
        },
        [updatedSubscriptions, subscriptionSecondBlock, source],
    )

    const onPressStartTrial = useCallback(() => {
        setActiveSubscribePlan(prevActiveSubscriptionPlanId => {
            if (
                // stay free plan
                prevActiveSubscriptionPlanId ===
                marketingConstants.proPlusAutoGradeInstantSubscriptionId
            ) {
                if (isOffScores || platform.isIos) {
                    actions.onCloseTourThunk()

                    return prevActiveSubscriptionPlanId
                }

                setIsShowFeaturesLayer(true)

                return prevActiveSubscriptionPlanId
            }

            const subscription = (findByProductId(
                updatedSubscriptions,
                prevActiveSubscriptionPlanId,
            ) ||
                findByProductId(
                    subscriptionSecondBlock,
                    prevActiveSubscriptionPlanId,
                )) as TSubscription
            onPurchase(subscription)

            return prevActiveSubscriptionPlanId
        })
    }, [isOffScores, updatedSubscriptions])

    const onChangeSubscriptionsCallback = useCallback(() => {
        setIsActiveShortPlan(prevState => {
            const isBaseGroups = platform.isIos || isNeedToShowTimer
            const proGroupDoubt = isBaseGroups
                ? subscriptionTourGroup.proGroup
                : subscriptionTourGroup.proDoubt
            const offScoresDoubt = isBaseGroups
                ? subscriptionTourGroup.offScoresGroup
                : subscriptionTourGroup.offScoreDoubt

            setCurrentSubscriptionsGroup(prevState ? proGroupDoubt : offScoresDoubt)

            reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
                ...getRtParamsBySource({ source, isLearnPlan: isPro }),
                datetime_timer: getTimerLeft(),
                ...subscriptionsRtHelpers.getProSwitcherRtParams(!prevState),
            })

            return !prevState
        })
    }, [isNeedToShowTimer, source])

    const onChangeSubscriptionsSwitcher = useCallback(() => {
        setIsActiveSwitcher(prevState => !prevState)
        opacityView.value = withTiming(0, { duration: 200 }, (finished?: boolean) => {
            if (finished) {
                scheduleOnRN(onChangeSubscriptionsCallback)
                opacityView.value = withTiming(1, { duration: 600 })
            }
        })
    }, [onChangeSubscriptionsCallback])

    const onNextStep = useCallback(() => {
        actions.setStep(TourSteps.LAST_CHANCE_SCREEN)
    }, [])

    const activeSubscription = (findByProductId(updatedSubscriptions, activeSubscribePlan) ||
        findByProductId(subscriptionSecondBlock, activeSubscribePlan)) as TSubscription

    const plansRtParamsRef = useRef<Record<string, unknown>>({})

    const reportPlansView = () => {
        plansRtParamsRef.current = subscriptionsRtHelpers.withPaywallPlansRt(
            getRtParamsBySource({
                source,
                isLearnPlan: isPro || currentSubscriptionsGroup.includes('learn'),
            }),
            [...updatedSubscriptions, ...(subscriptionSecondBlock || [])],
        )
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ...plansRtParamsRef.current,
            datetime_timer: getTimerLeft(),
            ...quizHelpers.getQuizAnswersRt(),
        })
    }

    const reportPlansClose = () => {
        reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
            ...plansRtParamsRef.current,
            datetime_timer: getTimerLeft(),
            ...quizHelpers.getQuizAnswersRt(),
        })
    }

    useEffect(() => {
        if (isCourses && isOffScores) actions.onCloseTourThunk()

        if (isShowTrialModal) {
            reportEvent(MetricaEvents.TOUR_MODAL_VIEW, {
                ...getRtParamsBySource({ source }),
                ...quizHelpers.getQuizAnswersRt(),
            })
        }
        if (isShowTrialModal) {
            return () => {
                actions.setTimerTour(null)
            }
        }

        actions.setTimerTour(marketingConstants.dateForBadgeTimer)
        reportPlansView()

        return () => {
            reportPlansClose()
            actions.setTimerTour(null)
        }
    }, [isShowTrialModal])

    useDidUpdate(() => {
        if (isShowTrialModal) return
        reportPlansView()
    }, [source])

    const { animatedValueViewButton, animatedViewSubscriptions, animatedViewSwitcher } =
        useTourTrialReanimatedStyle(opacityView, isShowTrialModal)

    const setIsUserScrollDownCallback = useCallback(() => {
        setIsUserScrollDown(true)
    }, [])

    const { isCloseIconContrastBg } = useCloseIconContrastBgExperiment(
        !isShowTrialModal && !isShowFeaturesLayer,
    )

    const scrollCloseIconBgColor = isUserScrollDown
        ? brandColors.backgroundDefault
        : activeDecorData.closeTourIconBgColor
    const closeIconBgColor = isCloseIconContrastBg
        ? closeIconContrastBgColor
        : scrollCloseIconBgColor

    useClosePaymentScreen({
        subscriptions: updatedSubscriptions,
        callback: actions.onCloseTourThunk,
    })
    useDoubtModalLogic({
        isPaymentInProgress,
        isShowFeaturesLayer,
        isShowTrialModal,
        currentSubscriptionsGroup,
    })

    const [headerBottom, setHeaderBottom] = useState<number>()

    const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
        const { y, height } = event.nativeEvent.layout
        setHeaderBottom(y + height)
    }, [])

    return (
        <>
            <View style={styles.scroll}>
                <GradientComponent gradientTourColors={activeDecorData.gradientTourColors} />
                {!isShowTrialModal && !isShowFeaturesLayer && (
                    <TourInstallTopComponent
                        onLayout={onHeaderLayout}
                        testID="Tour install close trial"
                        onLeftPress={onCloseTourAction}
                        rightTitle={translate('native.billing_restore')}
                        customIconColorStyle={activeDecorData.tourCloseIconStyle}
                        backgroundColorIcon={closeIconBgColor}
                    />
                )}
                {!isShowTrialModal && (
                    <TourLongPaymentLayerPlansComponent
                        isActiveSwitcher={isActiveSwitcher}
                        tourSaleAppText={activeDecorData.tourSaleText}
                        currentSubscriptionsGroup={currentSubscriptionsGroup}
                        onChangeSubscribePlan={onChangeSubscribePlan}
                        activeSubscribePlan={activeSubscribePlan}
                        animatedViewSubscriptions={animatedViewSubscriptions}
                        isShowSwitcher={!isShowTrialModal && !isPro}
                        onChangeSubscriptionsSwitcher={onChangeSubscriptionsSwitcher}
                        switcherTourActiveColor={activeDecorData.switcherTourActiveColor}
                        animatedViewSwitcher={animatedViewSwitcher}
                        updatedSubscriptions={updatedSubscriptions}
                        setIsUserScrollDown={setIsUserScrollDownCallback}
                        isNeedToShowTimer={isNeedToShowTimer}
                        isScrollToTop={isShowDoubtModal}
                        isShowMorePlansComponent={false}
                        isTour
                        currentScreen="TOUR_INSTALL"
                        headerBottom={headerBottom}
                        footer={
                            <BuyButton
                                isStatic
                                isShowSaleLabel={
                                    isShowSaleLabelExp &&
                                    (marketingConstants.proIntroductorySubscriptions.includes(
                                        activeSubscribePlan,
                                    ) ||
                                        marketingConstants.plansSaleLabel.includes(
                                            activeSubscribePlan,
                                        ))
                                }
                                currentSubscriptionsGroup={currentSubscriptionsGroup}
                                onBuyPress={onPressStartTrial}
                                buttonText={
                                    activeSubscription?.isTrialAvailable
                                        ? translate('native.screen_tour.start_trial_text')
                                        : translate('native.screen_tour.start_now_text')
                                }
                                textAboveButton={
                                    (platform.isAndroid &&
                                        activeSubscription?.ugPlanLineup?.textAboveButton) ||
                                    (activeSubscription?.isTrialAvailable
                                        ? activeSubscription?.textAboveButton
                                        : translate('native.screen_tour.free_cancel'))
                                }
                                customButtonStyle={activeDecorData.tourBuyButtonStyle}
                                customButtonTextStyle={styles.buttonBuyTextStyle}
                                customStyleContainer={animatedValueViewButton}
                            />
                        }
                    />
                )}
            </View>
            {isPaymentInProgress && (
                <SheetFooter fullScreen>
                    <Loader style={styles.loaderZIndex} />
                </SheetFooter>
            )}
            {isShowDoubtModal && !isPaymentInProgress && (
                <SheetFooter fullScreen>
                    <DoubtModalContainer
                        setIsNeedToShowTimer={setIsNeedToShowTimer}
                        isPaymentInProgress={isPaymentInProgress}
                        onSetSubscriptionGroupCallback={onSetSubscriptionGroupCallback}
                    />
                </SheetFooter>
            )}
            <TrialModalComponent
                isShowTrialsModal={isShowTrialModal}
                setIsShowTrialsModal={setIsShowTrialsModal}
            />
            {isShowFeaturesLayer && (
                <SheetFooter fullScreen>
                    <FeaturesModalComponent
                        isStudent={isStudent}
                        onNextStep={onNextStep}
                        isShowFeaturesModal={isShowFeaturesLayer}
                    />
                </SheetFooter>
            )}
            {isNeedToShowTimer && (
                <TourTimerContainer endTimerCallback={setExpSubscriptionGroupCallback} />
            )}
        </>
    )
})
