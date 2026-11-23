import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, TextStyle, View } from 'react-native'
import Reanimated, { FadeIn } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    brandFonts,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    Loader,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    findByProductId,
    getCurrentUpgradeMode,
    marketingStoreChunk,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
    TSubscription,
} from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'

const styles = StyleSheet.create({
    plansWrapper: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
    },
    onboardingImageStyle: {
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        aspectRatio: 1.5,
        alignSelf: 'center',
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: 'center',
        padding: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(140),
    },
    tourTitleStyle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        fontFamily: brandFonts.semibold,
    },
    titleProfile: {
        position: 'absolute',
        alignSelf: 'center',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(40),
    },
    backgroundProfile: {
        backgroundColor: brandColors.colorCyan700,
        justifyContent: 'center',
    },
})

type TPlansProps = {
    goBack: () => void
    subscriptions: TSubscription[]
    delayEnteringAnimation?: number
    profileCancelTextStyle: TextStyle
}

const PlansSaleComponent = ({
    subscriptions = [],
    goBack,
    delayEnteringAnimation = 0,
    profileCancelTextStyle,
}: TPlansProps) => {
    const { requestPurchaseThunk } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })

    const [
        isPro,
        isPaymentInProgress,
        currentSubscriptionProductId,
        purchaseTokenAndroidInfo,
        source,
        { stockName },
    ] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsPaymentInProgress,
        marketingStoreChunk.props.getCurrentSubscriptionProductId,
        marketingStoreChunk.props.getPurchaseTokenAndroidInfo,
        marketingStoreChunk.props.getSource,
        dynamicDecorStoreChunk.props.getActiveDecorData,
    ])
    const ui = stockName ? `sale_${stockName}_profile_banner` : 'profile'

    const [currentSubscriptionId] = useState(subscriptions?.[0]?.productId)
    const [purchaseTokenAndroid, setPurchaseTokenAndroid] = useState('')
    const [isUpgradeSubscriptionMode, setIsUpgradeSubscriptionMode] = useState(false)

    const onPurchase = () => {
        const subscription = findByProductId(subscriptions, currentSubscriptionId) as TSubscription
        requestPurchaseThunk({
            subscription,
            source,
            callback: goBack,
            purchaseTokenAndroid,
        })
        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            ui,
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription?.productId),
            subscription_type: ['pro_plus'],
            subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                subscription?.productId,
            ),
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: source,
            have_quiz: 'no',
        })
    }

    useEffect(() => {
        const { typeUpgrade } = getCurrentUpgradeMode({
            isPro,
            currentSubscriptionId: currentSubscriptionProductId,
        })
        setIsUpgradeSubscriptionMode(
            typeUpgrade === 'android-upgrade' || typeUpgrade === 'ios-upgrade',
        )
    }, [currentSubscriptionId, isPro])

    useEffect(() => {
        if (platform.isAndroid && isPro) {
            const currentSubscription =
                purchaseTokenAndroidInfo?.length &&
                purchaseTokenAndroidInfo.find(item => item.service_name === 'android_mu_pro')

            if (currentSubscription) {
                setPurchaseTokenAndroid(currentSubscription?.purchase_token)
            }
        }
    }, [purchaseTokenAndroidInfo])

    useEffect(() => {
        const plansRtParams = {
            ui,
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                ['pro_plus'],
                subscriptions,
            ),
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: source,
            have_quiz: 'no',
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    return (
        <Reanimated.View
            style={styles.plansWrapper}
            entering={FadeIn.duration(1000).delay(delayEnteringAnimation)}
        >
            <View style={styles.backgroundProfile}>
                <Image
                    resizeMode="cover"
                    source={icons.wavesBrand}
                    style={styles.onboardingImageStyle}
                />
                <AppText
                    style={styles.titleProfile}
                    brandColor="backgroundDefault"
                    font="f44w400Accent"
                    textAlign="center"
                    rawText={translate('native.marketing.game.wow_off_annual', {
                        discount: platform.isIos ? '80' : '70',
                    })}
                />
            </View>
            <ScrollView
                style={globalStyles.fullWidth}
                scrollEnabled
                contentContainerStyle={styles.scrollViewContainer}
                showsVerticalScrollIndicator={false}
            >
                <OnboardingTitleComponent
                    title={translate('native.screen_tour.scores_switcher_title')}
                    titleStyle={styles.tourTitleStyle}
                    contentStyle={[globalStyles.zeroHorizontalPadding, globalStyles.mb24]}
                />
                <SubscribePlanComponent
                    activeSubscribePlan={currentSubscriptionId}
                    onPress={onPurchase}
                    currentScreen="GAME_SCREEN"
                    subscribePlans={subscriptions}
                    containerStyle={globalStyles.mb24}
                />
                <BillingInfoComponent currentSubscriptionsGroup="offScores" />
            </ScrollView>
            <BuyButton
                buttonText={
                    isUpgradeSubscriptionMode
                        ? translate('native.upgrade_messages.upgrade_now')
                        : translate('native.marketing.continue')
                }
                onBuyPress={onPurchase}
            />
            {isPaymentInProgress && <Loader />}
        </Reanimated.View>
    )
}

export default React.memo(PlansSaleComponent)
