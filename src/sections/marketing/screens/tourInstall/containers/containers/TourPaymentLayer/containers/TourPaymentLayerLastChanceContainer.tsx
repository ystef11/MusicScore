import { memo, useCallback, useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text } from 'react-native'
import Animated, {
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform } from '@mu-native/common'
import {
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    Loader,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BenefitsComponent,
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    findByProductId,
    getStudentSubscriptions,
    getTrialSubscriptionOffScores,
    marketingConstants,
    marketingStoreChunk,
    PaymentLayerCloseBlockComponent,
    PlanSwitcher,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
    TSubscription,
} from '@mu-native/marketing'
import { getIsStudent, quizHelpers } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../../App/Utils/Analytics'
import { onCloseTourThunk } from '../../../../store/tourInstallThunkActions'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    lastChanceContainer: {
        flex: 1,
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    featuresWrapper: {
        width: '100%',
        paddingTop: getResponsiveSizeExtended(24),
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: getResponsiveSizeExtended(120),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
    },
    mainTitle: {
        fontWeight: '600',
        color: colors.text900,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: getResponsiveSizeExtended(24),
        marginBottom: getResponsiveSizeExtended(12),
    },
    scrollView: {
        width: '100%',
    },
    featureImage: {
        width: '100%',
        height: platform.isTablet ? 220 : 240,
        borderRadius: platform.isTablet ? 20 : 0,
        marginTop: platform.isTablet ? 48 : 0,
        maxWidth: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
    },
    closeIcon: {
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(20),
        zIndex: 10,
        borderRadius: 50,
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    rebrandButtonStyle: {
        borderRadius: 30,
        backgroundColor: brandColors.additionalDefault,
        borderColor: brandColors.additionalDefault,
    },
    borderWidth: {
        borderTopWidth: 1,
    },
    bgColorIconClose: { backgroundColor: colors.white },
})

const { getRtParamsBySource } = subscriptionsRtHelpers

const LastChangeContainer = () => {
    const opacityView = useSharedValue(1)

    const [
        isPaymentInProgress,
        subscriptions,
        studentsSubscriptions,
        isStudent,
        isHadProAccessOffScores,
    ] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getTrialSubscriptionOffScores,
        getStudentSubscriptions,
        getIsStudent,
        marketingStoreChunk.props.getIsHadProAccessOffScores,
    ])
    const activePlan = subscriptions[0]
    const activeTrialSubscription = activePlan?.productId || ''

    const [isActiveSwitcher, setIsActiveSwitcher] = useState(true)
    const [activeSubscribePlanId, setActiveSubscribePlan] = useState(
        isStudent ? marketingConstants.monthOffScoresLiteSubscriptionId : activeTrialSubscription,
    )
    const [currentSubscriptionsGroup, setCurrentSubscriptionsGroup] = useState<
        'offScoresMonth' | 'proMonth'
    >('offScoresMonth')
    const [_, setIsActiveShortPlan] = useState(true)

    const { requestPurchaseThunk, onCloseTour, setIsStudentAge } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        onCloseTour: onCloseTourThunk,
        setIsStudentAge: marketingStoreChunk.actions.setIsStudentAge,
    })

    useEffect(() => {
        if (!activeTrialSubscription) onCloseTour()

        const plansRtParams = {
            ...getRtParamsBySource({
                source: marketingConstants.sources.tourInstallLastChance,
            }),
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                ['pro_plus'],
                isStudent ? studentsSubscriptions?.offScoresMonth : subscriptions,
            ),
            ...quizHelpers.getQuizAnswersRt(),
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
            setIsStudentAge(false)
        }
    }, [])

    const onPurchase = useCallback(
        (subscription?: TSubscription) => {
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                ...getRtParamsBySource({
                    source: marketingConstants.sources.tourInstallLastChance,
                }),
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    subscription?.productId || activeTrialSubscription,
                ),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(
                    subscription?.productId || activeTrialSubscription,
                ),
                ...quizHelpers.getQuizAnswersRt(),
            })

            requestPurchaseThunk({
                subscription: subscription?.productId ? subscription : subscriptions[0],
                source: marketingConstants.sources.tourInstallLastChance,
                callback: onCloseTour,
                isOfferPersonalized: true,
            })
        },
        [subscriptions],
    )

    const updatedStudentsSubscriptions = studentsSubscriptions?.[currentSubscriptionsGroup]

    const onChangeSubscriptionLogic = useCallback(
        (selectedPlanId: string) => {
            if (!isStudent) {
                onPurchase()
                return
            }

            setActiveSubscribePlan(prevActiveSubscribePlanId => {
                if (selectedPlanId === prevActiveSubscribePlanId) {
                    const subscription = findByProductId(
                        updatedStudentsSubscriptions,
                        selectedPlanId,
                    ) as TSubscription
                    onPurchase(subscription)

                    return prevActiveSubscribePlanId
                }
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: selectedPlanId,
                    ...getRtParamsBySource({
                        source: marketingConstants.sources.tourInstallLastChance,
                    }),
                    ...quizHelpers.getQuizAnswersRt(),
                })

                return selectedPlanId
            })
        },
        [onPurchase, updatedStudentsSubscriptions],
    )

    const onChangeSubscriptionsCallback = () => {
        setIsActiveShortPlan(prevState => {
            setCurrentSubscriptionsGroup(prevState ? 'proMonth' : 'offScoresMonth')
            setActiveSubscribePlan(
                prevState
                    ? marketingConstants.monthLiteSubscriptionInstantId
                    : marketingConstants.monthOffScoresLiteSubscriptionId,
            )
            reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
                ...getRtParamsBySource({
                    source: marketingConstants.sources.tourInstallLastChance,
                }),
                ...quizHelpers.getQuizAnswersRt(),
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

    const animatedSubscriptionView = useAnimatedStyle(() => ({
        opacity: opacityView.value,
    }))

    const lastChanceTitle =
        isHadProAccessOffScores || !activePlan?.isTrialAvailable
            ? translate('native.marketing.last_chance.start_membership')
            : translate('native.marketing.last_chance.start_with_trial')

    return (
        <Animated.View entering={FadeIn.duration(800)} style={styles.lastChanceContainer}>
            <PaymentLayerCloseBlockComponent
                containerStyle={styles.closeIcon}
                onClose={onCloseTour}
                closeIconBgStyle={styles.bgColorIconClose}
            />
            <Image
                source={platform.isTablet ? icons.lastChanceImageTablet : icons.lastChanceImage}
                style={styles.featureImage}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.featuresWrapper}
            >
                <Text style={styles.mainTitle}>
                    {isStudent ? translate('native.marketing.terms_title') : lastChanceTitle}
                </Text>
                <Animated.View style={animatedSubscriptionView}>
                    <SubscribePlanComponent
                        activeSubscribePlan={
                            isStudent ? activeSubscribePlanId : activeTrialSubscription
                        }
                        onPress={onChangeSubscriptionLogic}
                        currentScreen={isStudent ? 'STUDENTS' : 'LAST_CHANCE'}
                        subscribePlans={isStudent ? updatedStudentsSubscriptions : subscriptions}
                    />
                </Animated.View>
                {isStudent && (
                    <PlanSwitcher
                        colorText={colors.text900}
                        backgroundColor={colors.gray300}
                        activeColor={brandColors.accentPrimary}
                        isActiveOffScores={isActiveSwitcher}
                        changeSubscriptions={onChangeSubscriptionsSwitcher}
                    />
                )}
                {!isStudent && <BenefitsComponent style={globalStyles.pt12} />}
                <BillingInfoComponent currentSubscriptionsGroup="offScores" />
            </ScrollView>
            {isPaymentInProgress && <Loader />}
            <BuyButton
                buttonText={translate('native.marketing.continue')}
                textAboveButton={translate('native.screen_tour.free_cancel')}
                onBuyPress={onPurchase}
                customStyleContainer={styles.borderWidth}
                customButtonStyle={styles.rebrandButtonStyle}
            />
        </Animated.View>
    )
}

export default memo(LastChangeContainer)
