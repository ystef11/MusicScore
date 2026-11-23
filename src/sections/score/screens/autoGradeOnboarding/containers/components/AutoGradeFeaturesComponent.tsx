import { memo, useCallback, useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import {
    colors,
    FadeAnimationComponent,
    globalStyles,
    icons,
    layoutHelpers,
    Loader,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BackButton,
    billingThunks,
    BuyButtonComponent,
    findByProductId,
    getAutoGradeSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
    SubscribePlanComponent,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TProductId,
    type TSubscription,
} from '@mu-native/marketing'
import { loadTourAnswerThunk, quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { autoGradeOnboardingScreenStoreChunk } from '../../store/autoGradeOnboardingScreenStoreChunk.ts'

import { RightOnboardingComponent } from './components/RightOnboardingComponent'

const styles = StyleSheet.create({
    imageAutoGrade: {
        width: layoutHelpers.getResponsiveSizeExtended(300),
        height: layoutHelpers.getResponsiveSizeExtended(300),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(32),
    },
    titleFirstStep: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
        maxWidth: '90%',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(32),
    },
    subTitleFirstStep: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
    },
    paddingVertical: {
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(50),
    },
    imageAutoGradeLandscape: {
        width: layoutHelpers.getResponsiveSizeExtended(200),
        height: layoutHelpers.getResponsiveSizeExtended(200),
    },
    absoluteFullWidthImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    benefitsContainer: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(10),
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
    },
    backgroundButtonColor: {
        borderWidth: 0,
        paddingHorizontal: 0,
        backgroundColor: colors.transparent,
        left: layoutHelpers.getResponsiveSizeExtended(24),
        paddingBottom: 0,
    },
    rightComponentStyle: {
        alignSelf: 'flex-end',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(24),
    },
    customTitleSize: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(34),
    },
})

export const AutoGradeFeaturesComponent = memo(() => {
    const [
        { offScoresAutoGrade },
        isPaymentInProgress,
        isPro,
        isOffScores,
        subscriptionProInfo,
        subscriptionOffScoresInfo,
        androidPurchaseTokens,
    ] = useValues([
        getAutoGradeSubscriptions,
        marketingStoreChunk.props.getIsPaymentInProgress,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getCurrentSubscriptionProInfo,
        marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
    ])
    const [activeSubscribePlanId, setActiveSubscribePlanId] = useState<TProductId>(
        marketingConstants.proPlusAutoGradeInstantSubscriptionId,
    )
    const [isUpgradeMode, setIsUpgradeMode] = useState(false)
    const [purchaseToken, setPurchaseToken] = useState('')

    const actions = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        resetState: quizStoreChunk.actions.resetState,
        loadTourAnswerThunk,
        loadAndroidPurchaseToken: marketingThunks.loadAndroidPurchaseTokenThunk,
        setCompleted: autoGradeOnboardingScreenStoreChunk.actions.setCompleted,
    })

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
        const plansRtParams = subscriptionsRtHelpers.withPaywallPlansRt(
            subscriptionsRtHelpers.getRtParamsBySource({
                source: marketingConstants.sources.autoGrade,
            }),
            offScoresAutoGrade,
        )
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    useEffect(() => {
        if (platform.isAndroid && isUpgradeMode) {
            const currentSubscriptionProductInfo = isOffScores
                ? subscriptionOffScoresInfo
                : subscriptionProInfo
            const currentSubscription = androidPurchaseTokens?.find(
                item => item.product_id === currentSubscriptionProductInfo?.productId,
            )

            if (currentSubscription?.purchase_token) {
                setPurchaseToken(currentSubscription.purchase_token)
            }
        }
    }, [androidPurchaseTokens, isUpgradeMode])

    const onPurchase = useCallback(
        (subscription: TSubscription) => {
            if (!subscription?.productId) return
            const { productId } = subscription
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                ...subscriptionsRtHelpers.getRtParamsBySource({
                    source: marketingConstants.sources.autoGrade,
                }),
                subscription_purchase:
                    subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(productId),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(productId),
            })

            actions.requestPurchaseThunk({
                subscription,
                source: marketingConstants.sources.autoGrade,
                callback: onSendCloseEvent,
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
                        offScoresAutoGrade,
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
        [offScoresAutoGrade, onPurchase],
    )

    const onPressBuyButton = useCallback(() => {
        setActiveSubscribePlanId(planId => {
            onChangeSubscribePlan(planId)

            return planId
        })
    }, [onChangeSubscribePlan])

    const onSendCloseEvent = useCallback(() => {
        reportEvent(MetricaEvents.AUTOGRADE_CLOSE_CLICK, {
            value: 'plans',
        })
    }, [])

    // Play's purchase sheet runs in a portrait-locked activity of its own, so while it is open
    // the screen re-lays out to portrait — hide the landscape layout instead of showing it broken.
    const isLayoutHidden = platform.isAndroid && isPaymentInProgress

    return (
        <FadeAnimationComponent>
            <View style={globalStyles.flex1FullWidth}>
                {!isLayoutHidden && (
                    <BackButton goBackCallback={onSendCloseEvent} isShowRestoreButton={false} />
                )}
                <Image source={icons.autoGradeAcquisition5} style={styles.absoluteFullWidthImage} />

                {!isLayoutHidden && (
                    <RightOnboardingComponent
                        width="60%"
                        style={styles.rightComponentStyle}
                        backgroundColor={colors.transparent}
                        paddingLeft={layoutHelpers.getResponsiveSizeExtended(24)}
                    >
                        <ScrollView
                            style={globalStyles.fullWidth}
                            indicatorStyle="white"
                            contentContainerStyle={{
                                paddingBottom: layoutHelpers.getResponsiveSizeExtended(32),
                            }}
                        >
                            <OnboardingTitleComponent
                                contentStyle={[
                                    globalStyles.zeroHorizontalPadding,
                                    globalStyles.mb8,
                                ]}
                                color={colors.white}
                                titleStyle={styles.customTitleSize}
                                title={translate('native.practice_mode.onboarding.paywall_title')}
                                subTitle={translate(
                                    'native.practice_mode.onboarding.paywall_subtitle',
                                )}
                            />
                            <SubscribePlanComponent
                                activeSubscribePlan={activeSubscribePlanId}
                                onPress={onChangeSubscribePlan}
                                currentScreen="TOUR_UPDATE"
                                subscribePlans={offScoresAutoGrade}
                            />
                        </ScrollView>
                        <BuyButtonComponent
                            customStyleContainer={styles.backgroundButtonColor}
                            buttonText={translate('native.screen_new_account.continue')}
                            onBuyPress={onPressBuyButton}
                            customBottomInset={0}
                        />
                    </RightOnboardingComponent>
                )}
                {isPaymentInProgress && <Loader color={colors.text900} />}
            </View>
        </FadeAnimationComponent>
    )
})
