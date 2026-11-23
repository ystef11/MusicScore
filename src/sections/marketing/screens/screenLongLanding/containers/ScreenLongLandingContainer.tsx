import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { marketingTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import { colors, layoutHelpers } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    BackButton,
    billingThunks,
    BuyButton,
    findByProductId,
    getAllSubscriptions,
    getCurrentUpgradeMode,
    getScoreDiscountSplashSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
    PaymentLoaderContainer,
    subscriptionHelpers,
    subscriptionsRtHelpers,
    TContentTypes,
    TourLongPaymentLayerPlansComponent,
    TProduct,
    TProductId,
    type TScoreSale,
    TSubscription,
    useProductInApp,
} from '@mu-native/marketing'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import { getContentTypeByProductId } from '../../../../../modules/marketing/helpers/getContentTypeByProductId.ts'
import { buttonTexts } from '../constants/screenNoLandingContants'
import { redirectOnWeb } from '../helpers/redirectOnWeb'
import { TPlanNameScreenNoLanding } from '../types/screenNoLandingScreenAppTypes'

import { useAnalyticsEffect } from './hooks/useAnalyticsEffect'
import { useTourTrialReanimatedStyle } from './hooks/useTourTrialReanimatedStyle.ts'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    backButton: {
        alignSelf: 'center',
        marginBottom: getResponsiveSizeExtended(16),
    },
})

const proGroup = 'pro'
const offScoresGroup = 'offScores'

const ScreenLongLandingContainer = () => {
    const {
        planName = offScoresGroup,
        inAppItem,
        isOfficialScore = false,
        activePlanIndex,
        isScoreDiscountPlans = false,
        funnelStartAction,
    } = useAppRoute<{
        planName?: TPlanNameScreenNoLanding
        isOfficialScore: boolean
        inAppItem: TScoreSale
        activePlanIndex?: number
        isScoreDiscountPlans?: boolean
        funnelStartAction?: string
    }>()
    const funnelStartActionRt = funnelStartAction ? { funnel_start_action: funnelStartAction } : {}

    const actions = useActions({
        loadAndroidPurchaseToken: marketingThunks.loadAndroidPurchaseTokenThunk,
        setPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        buyScoreByCreditThunk: billingThunks.buyScoreByCreditThunk,
        reloadScore: scoreThunks.openScore,
    })
    const [
        isPro,
        isOffScores,
        isPremium,
        currentSubscriptionProductId,
        source,
        user,
        purchaseTokenAndroidInfo,
        allSubscriptions,
        scoreDiscountSubscriptions,
        isLearnLiteAccess,
        currentSubscriptionLearnLiteInfo,
        activeDecorData,
        creditBalance,
        isPaymentInProgress,
    ] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsPremiumRights,
        marketingStoreChunk.props.getCurrentSubscriptionProductId,
        marketingStoreChunk.props.getSource,
        authStoreChunk.props.getUser,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
        getAllSubscriptions,
        getScoreDiscountSplashSubscriptions,
        marketingStoreChunk.props.getIsLearningLite,
        marketingStoreChunk.props.getCurrentSubscriptionLearnLiteInfo,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        marketingStoreChunk.props.getCreditBalance,
        marketingStoreChunk.props.getIsPaymentInProgress,
    ])
    const saleUi = activeDecorData.stockName ? `sale_${activeDecorData.stockName}_inner` : ''
    // score discount splash exp: pro and pro+ groups replaced with the discounted plans
    const subscriptions = useMemo(
        () =>
            isScoreDiscountPlans && scoreDiscountSubscriptions
                ? { ...allSubscriptions, ...scoreDiscountSubscriptions }
                : allSubscriptions,
        [allSubscriptions, isScoreDiscountPlans, scoreDiscountSubscriptions],
    )
    const { goBack } = useAppNavigation()
    const opacityPlanContainer = useSharedValue(1)
    const { inAppInfo, productInApp } = useProductInApp(inAppItem, planName)
    const isShowTopScoreBlock = !!inAppItem && !!inAppInfo?.id

    const [currentSubscriptionsGroup, setCurrentSubscriptionsGroup] = useState(planName)
    const [activeSubscribePlan, setActiveSubscribePlan] = useState(
        subscriptionHelpers.getActiveProductId({
            subscriptions: subscriptions[planName],
            activePlanIndex,
            customId:
                isShowTopScoreBlock && typeof activePlanIndex !== 'number'
                    ? subscriptionHelpers.getInAppIdByPrice(
                          inAppItem?.price,
                          isOffScores || isPremium,
                          planName,
                      )
                    : '',
        }),
    )
    const [currentUpgradeMode, setCurrentUpgradeMode] = useState('')
    const [purchaseTokenAndroid, setPurchaseToken] = useState('')
    const [isActiveSwitcher, setIsActiveSwitcher] = useState(planName.includes('offScores'))

    const isCoursesScreen = planName === 'learning' || planName === 'learningLite'
    const isBookScreen = planName === 'ebook'
    const isWebUpgrade =
        currentUpgradeMode === marketingConstants.webUpgrade && !isCoursesScreen && !isBookScreen
    const updatedSubscriptions = subscriptions[currentSubscriptionsGroup] as TSubscription[]
    const isShowSwitcher =
        currentSubscriptionsGroup !== 'ebook' && !isWebUpgrade && !isOfficialScore
    const switcherGroups: TPlanNameScreenNoLanding[] = isCoursesScreen
        ? ['learning', 'learningLite']
        : [proGroup, offScoresGroup]

    useAnalyticsEffect({
        source,
        isUpgradeMode: !!currentUpgradeMode,
        currentSubscriptionsGroup,
        switcherGroups: isShowSwitcher ? switcherGroups : undefined,
        isShowScoreBlock: isShowTopScoreBlock,
        subscriptions: updatedSubscriptions,
        funnelStartAction,
        saleUi,
    })

    useEffect(() => {
        const { typeUpgrade } = getCurrentUpgradeMode({
            isPro,
            currentSubscriptionId: currentSubscriptionProductId,
            isLearnLite: isLearnLiteAccess && !planName.includes('offScores'),
            isPageWithoutUpgrade: isCoursesScreen || isBookScreen,
            currentSubscriptionLearnLiteInfo,
        })

        if (typeUpgrade === 'android-upgrade') actions.loadAndroidPurchaseToken()

        setCurrentUpgradeMode(typeUpgrade)
    }, [])

    useEffect(() => {
        if (platform.isAndroid && !!purchaseTokenAndroidInfo?.length) {
            const currentSubscription = purchaseTokenAndroidInfo.find(
                item => item.product_id === currentSubscriptionProductId,
            )

            if (currentSubscription) {
                setPurchaseToken(currentSubscription?.purchase_token)
            }
        }
    }, [purchaseTokenAndroidInfo])

    const purchaseCallback = useCallback(() => {
        goBack()
        if (
            inAppItem &&
            getContentTypeByProductId(activeSubscribePlan) === TContentTypes.scoreInApp
        ) {
            actions.reloadScore(inAppItem as unknown as MSScoreT)
        }
    }, [inAppItem, activeSubscribePlan])

    const onPurchase = useCallback(
        (subscription: TSubscription | TProduct | undefined) => {
            if (subscription) {
                reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                    subscription_type: [
                        marketingConstants.currentSubscriptionType[currentSubscriptionsGroup] ||
                            'pro_plus',
                    ],
                    subscription_purchase:
                        subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                            subscription.productId,
                        ),
                    ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription.productId),
                    funnel_type: 'intentional',
                    landing_name: currentUpgradeMode ? 'update' : 'Start Free Trial landing',
                    funnel_source: source,
                    have_quiz: 'no',
                    ...funnelStartActionRt,
                    ...(saleUi ? { ui: saleUi } : {}),
                })
                actions.requestPurchaseThunk({
                    subscription,
                    source,
                    callback: purchaseCallback,
                    purchaseTokenAndroid,
                })
            }
        },
        [isCoursesScreen, purchaseTokenAndroid, source, currentUpgradeMode],
    )

    const onChangeSubscribePlan = useCallback(
        (subscribePlanId: TProductId) => {
            setActiveSubscribePlan(prevActivePlanId => {
                if (subscribePlanId === prevActivePlanId) {
                    const product =
                        findByProductId(updatedSubscriptions, prevActivePlanId) || productInApp
                    onPurchase(product)

                    return prevActivePlanId
                }
                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: subscribePlanId,
                    landing_name: currentUpgradeMode ? 'update' : 'Start Free Trial landing',
                    subscription_type: [
                        marketingConstants.currentSubscriptionType[currentSubscriptionsGroup] ||
                            'pro_plus',
                    ],
                    funnel_type: 'intentional',
                    funnel_source: source,
                    have_quiz: 'no',
                    ...funnelStartActionRt,
                })
                return subscribePlanId
            })
        },
        [onPurchase, updatedSubscriptions, currentUpgradeMode, productInApp],
    )

    const buttonText = currentUpgradeMode
        ? translate('native.upgrade_messages.upgrade_now')
        : buttonTexts[activeSubscribePlan]

    const activeSubscriptionData = findByProductId(updatedSubscriptions, activeSubscribePlan)
    const textSubscriptionButton =
        activeSubscriptionData?.textAboveButton || translate('native.screen_tour.free_cancel')

    const onPressStartTrial = useCallback(() => {
        if (isWebUpgrade) {
            redirectOnWeb(user?.id)
            return
        }

        setActiveSubscribePlan(planId => {
            const product = findByProductId(updatedSubscriptions, planId) || productInApp

            onPurchase(product)

            return planId
        })
    }, [updatedSubscriptions, onPurchase, isWebUpgrade, user?.id, productInApp])

    const changeSubscriptionLogic = useCallback(() => {
        setIsActiveSwitcher(isActiveSwitcher => {
            const learnSubscriptionGroup = isActiveSwitcher ? 'learning' : 'learningLite'
            const proSubscriptionGroup = isActiveSwitcher ? proGroup : offScoresGroup
            const subscriptionNameGroup = isCoursesScreen
                ? learnSubscriptionGroup
                : proSubscriptionGroup
            const currentGroup = isCoursesScreen ? learnSubscriptionGroup : subscriptionNameGroup

            setCurrentSubscriptionsGroup(currentGroup)
            setActiveSubscribePlan(
                subscriptionHelpers.getActiveProductId({
                    subscriptions: subscriptions[currentGroup],
                    activePlanIndex,
                }),
            )
            reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
                ui: source,
                value: isActiveSwitcher ? 'off' : 'on',
                subscription_type: [marketingConstants.currentSubscriptionType[currentGroup]],
                funnel_type: 'intentional',
                landing_name: currentUpgradeMode ? 'update' : 'long landing',
                funnel_source: source,
                have_quiz: 'no',
                ...funnelStartActionRt,
            })

            return !isActiveSwitcher
        })
    }, [isLearnLiteAccess, activePlanIndex, subscriptions, source, currentUpgradeMode])

    const onChangeTypeSubscription = useCallback(() => {
        opacityPlanContainer.value = withTiming(0, { duration: 200 }, isFinished => {
            if (isFinished) {
                scheduleOnRN(changeSubscriptionLogic)
                opacityPlanContainer.value = withTiming(1, { duration: 600 })
            }
        })
    }, [changeSubscriptionLogic])

    const { animatedViewSubscriptions, animatedViewSwitcher } = useTourTrialReanimatedStyle(
        opacityPlanContainer,
        false,
    )

    const isActiveScore = marketingConstants.listInApps.includes(activeSubscribePlan)

    const [headerBottom, setHeaderBottom] = useState<number>()

    const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
        const { y, height } = event.nativeEvent.layout
        setHeaderBottom(y + height)
    }, [])

    return (
        <View style={styles.background} testID={marketingTestIds.offScoresLongLandingScreen}>
            <BackButton
                onLayout={onHeaderLayout}
                containerStyle={styles.backButton}
                closeTestID={marketingTestIds.offScoresLongLandingCloseButton}
            />
            <TourLongPaymentLayerPlansComponent
                isActiveSwitcher={isActiveSwitcher}
                tourSaleAppText={activeDecorData.tourSaleText}
                currentSubscriptionsGroup={currentSubscriptionsGroup}
                onChangeSubscribePlan={onChangeSubscribePlan}
                activeSubscribePlan={activeSubscribePlan}
                animatedViewSubscriptions={animatedViewSubscriptions}
                isShowSwitcher={isShowSwitcher}
                onChangeSubscriptionsSwitcher={onChangeTypeSubscription}
                switcherTourActiveColor={activeDecorData.switcherTourActiveColor}
                animatedViewSwitcher={animatedViewSwitcher}
                updatedSubscriptions={updatedSubscriptions}
                isNeedToShowTimer={false}
                isScrollToTop={false}
                isShowMorePlansComponent={false}
                isWebUpgrade={isWebUpgrade}
                isActiveScore={isActiveScore}
                inAppInfo={inAppInfo}
                isShowTopScoreBlock={isShowTopScoreBlock}
                imageInAppUri={inAppItem?.previewImageUrl as string}
                currentScreen="LONG_LANDING"
                saleValue={
                    isScoreDiscountPlans
                        ? ` ${translate('native.marketing.discount_off', {
                              discount: marketingConstants.anniversaryDiscount,
                          })}`
                        : undefined
                }
            />
            <BuyButton
                isStatic
                textAboveButton={textSubscriptionButton}
                onBuyPress={onPressStartTrial}
                buttonText={buttonText || translate('native.screen_tour.start_now_text')}
                testID={marketingTestIds.offScoresLongLandingStartButton}
            />
            {isPaymentInProgress && <PaymentLoaderContainer />}
        </View>
    )
}

export default ScreenLongLandingContainer
