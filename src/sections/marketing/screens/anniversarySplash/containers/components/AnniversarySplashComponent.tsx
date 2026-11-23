import { memo, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import Reanimated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { colors, icons, layout, layoutHelpers, Loader, replacerText } from '@mu-native/ds'
import { PlainLocaleKey, translate } from '@mu-native/locale'
import {
    BackButton,
    BuyButton,
    marketingConstants,
    PlanSwitcher,
    sources,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
    TSubscription,
} from '@mu-native/marketing'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    closeContainer: {
        zIndex: 1,
    },
    backButton: {
        alignSelf: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
    scrollViewStyle: { width: '100%' },
    contentContainer: {
        padding: platform.isTablet ? undefined : layout.marginMd,
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        justifyContent: platform.isTablet ? 'flex-end' : 'flex-end',
        width: '100%',
    },
    discountContainer: {
        paddingTop: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(10),
        alignItems: 'center',
    },
    discountTitle: {
        color: colors.blue600,
        fontSize: layoutHelpers.getResponsiveSizeExtended(44),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(44),
        fontWeight: 'bold',
    },
    discountSubtitle: {
        color: colors.text900,
        textAlign: 'center',
        fontSize: layoutHelpers.getResponsiveSizeExtended(18),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(24),
    },
    giftImage: {
        width: '100%',
        alignSelf: 'center',
        height: platform.isTablet ? 450 : 400,
        marginBottom: platform.isTablet ? 70 : 20,
    },
    plansContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    mainContentContainer: {
        width: '100%',
        alignItems: 'center',
    },
    headingWithName: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(20),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(24),
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    subTitle: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(21),
        color: colors.gray500,
        textAlign: 'center',
    },
    customButtonStyle: {
        backgroundColor: colors.blue600,
        borderColor: colors.blue600,
    },
})

const buttonTexts: PlainLocaleKey[] = [
    'native.marketing.anniversary.open_my_gift',
    'native.marketing.anniversary.use_my_gift',
]

type TAnniversarySplashComponent = {
    days: string
    isPaymentInProgress: boolean
    onBuy: (isOffScores: boolean) => void
    username: string
    subscriptions: {
        pro: TSubscription[]
        offScores: TSubscription[]
    }
}
const AnniversarySplashComponent = ({
    days,
    isPaymentInProgress,
    onBuy,
    username,
    subscriptions,
}: TAnniversarySplashComponent) => {
    const transition = useSharedValue(0)
    const opacityCloseIcon = useSharedValue(0)

    const [subscriptionGroup, setSubscriptionGroup] = useState<'pro' | 'offScores'>('pro')
    const [isActiveSwitcher, setIsActiveSwitcher] = useState(false)
    const [isClickedGift, setIsClickedGift] = useState(false)

    const updatedSubscription = subscriptions[subscriptionGroup]

    const [activePlanId, setActivePlanId] = useState(updatedSubscription?.[1]?.productId)

    useEffect(() => {
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                ['pro', 'pro_plus'],
                updatedSubscription,
            ),
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: sources.splashAnniversaryOffer,
            have_quiz: 'no',
            screen: 'PaywallScreen',
        })

        opacityCloseIcon.value = withTiming(1, { duration: 3500 })

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                subscription_type: ['pro', 'pro_plus'],
                funnel_type: 'intentional',
                landing_name: 'Special offer',
                funnel_source: sources.splashAnniversaryOffer,
                have_quiz: 'no',
                screen: 'PaywallScreen',
            })
        }
    }, [])

    const onChangeSubscriptions = () => {
        reportEvent(MetricaEvents.PRO_SWITCHER_CLICK, {
            funnel_type: 'intentional',
            landing_name: 'Special offer',
            funnel_source: sources.splashAnniversaryOffer,
            have_quiz: 'no',
            screen: 'PaywallScreen',
            ...subscriptionsRtHelpers.getProSwitcherRtParams(!isActiveSwitcher),
        })
        setIsActiveSwitcher(prevState => !prevState)
        setSubscriptionGroup(isActiveSwitcher ? 'pro' : 'offScores')
        setActivePlanId(subscriptions[isActiveSwitcher ? 'pro' : 'offScores'][1].productId)
    }

    const onGetGiftPress = () => {
        if (!isClickedGift) {
            reportEvent(MetricaEvents.ANNIVERSARY_SPLASH_OPEN_GIFT_CLICK, {
                subscription_type: [isActiveSwitcher ? 'pro_plus' : 'pro'],
                funnel_type: 'intentional',
                landing_name: 'Special offer',
                funnel_source: sources.splashAnniversaryOffer,
                have_quiz: 'no',
                screen: 'PaywallScreen',
            })
            setIsClickedGift(true)
            transition.value = withTiming(1, { duration: 500 })

            return
        }
        onBuy(isActiveSwitcher)
    }

    const mainContentContainerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    transition.value,
                    [0, 1],
                    [100, layout.fullScreenHeight < 700 ? -180 : -160],
                ),
            },
        ],
    }))

    const transformGiftImageStyle = useAnimatedStyle(() => ({
        transform: [
            {
                scale: interpolate(
                    transition.value,
                    [0, 1],
                    [1, platform.isTablet || layout.fullScreenHeight < 700 ? 0.6 : 0.7],
                ),
            },
            {
                translateY: interpolate(
                    transition.value,
                    [0, 1],
                    [100, layout.fullScreenHeight < 700 ? -130 : -80],
                ),
            },
        ],
    }))
    const mainContainerOpacity = useAnimatedStyle(() => ({
        opacity: transition.value,
    }))
    const closeIconOpacity = useAnimatedStyle(() => ({
        opacity: opacityCloseIcon.value,
    }))

    const textButton = isClickedGift
        ? translate('native.marketing.anniversary.available_only_now_free_cancel')
        : ''

    return (
        <View style={styles.mainContainer}>
            <Reanimated.View style={[styles.closeContainer, closeIconOpacity]}>
                <BackButton containerStyle={styles.backButton} isShowRestoreButton={false} />
            </Reanimated.View>

            <ScrollView
                style={styles.scrollViewStyle}
                contentContainerStyle={styles.contentContainer}
            >
                <Reanimated.Image
                    style={[styles.giftImage, transformGiftImageStyle]}
                    source={icons.anniversarySplashLogo}
                    resizeMode="contain"
                />
                <Reanimated.View
                    style={[styles.mainContentContainer, mainContentContainerAnimatedStyle]}
                >
                    <Text style={styles.headingWithName}>
                        {username
                            ? translate('native.marketing.anniversary.dear_username', { username })
                            : translate('native.anniversary.hi_title')}{' '}
                        {replacerText({
                            text: translate('native.anniversary.main_title', { d: days }),
                        })}
                    </Text>
                    <Text style={styles.subTitle}>{translate('native.anniversary.title')}</Text>
                    <Reanimated.View style={[styles.mainContentContainer, mainContainerOpacity]}>
                        <View style={styles.discountContainer}>
                            <Text style={styles.discountTitle}>
                                {translate('native.marketing.discount_off', {
                                    discount: marketingConstants.anniversaryDiscount,
                                })}
                            </Text>
                            <Text style={styles.discountSubtitle}>
                                {translate('native.anniversary.title_offer')}
                            </Text>
                        </View>
                        <View style={styles.plansContainer}>
                            <SubscribePlanComponent
                                activeSubscribePlan={activePlanId}
                                onPress={onGetGiftPress}
                                username={username}
                                currentScreen="ANNIVERSARY_SCREEN"
                                subscribePlans={updatedSubscription}
                            />
                        </View>
                        <PlanSwitcher
                            isActiveOffScores={isActiveSwitcher}
                            changeSubscriptions={onChangeSubscriptions}
                            activeColor={colors.blue600}
                            backgroundColor={colors.gray200}
                            colorText={colors.text900}
                        />
                    </Reanimated.View>
                </Reanimated.View>
            </ScrollView>
            <BuyButton
                textAboveButton={textButton}
                customButtonStyle={styles.customButtonStyle}
                onBuyPress={onGetGiftPress}
                buttonText={translate(buttonTexts[isClickedGift ? 1 : 0])}
            />
            {isPaymentInProgress && <Loader />}
        </View>
    )
}

export default memo(AnniversarySplashComponent)
