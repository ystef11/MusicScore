import { memo, useCallback, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    layout,
    layoutHelpers,
    Loader,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BenefitsComponent,
    BillingInfoComponent,
    billingThunks,
    BuyButton,
    getAfterSaleSubscriptions,
    marketingConstants,
    marketingStoreChunk,
    PaymentLayerCloseBlockComponent,
    subscriptionsRtHelpers,
} from '@mu-native/marketing'
import { quizHelpers } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { onCloseTourThunk } from '../../store/tourInstallThunkActions'

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
        paddingTop: getResponsiveSizeExtended(120),
        paddingBottom: getResponsiveSizeExtended(120),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
    },
    scrollView: {
        width: '100%',
    },
    closeIcon: {
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(20),
        zIndex: 10,
        borderRadius: 50,
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
        tintColor: brandColors.backgroundInverse,
    },
    rebrandButtonStyle: {
        borderRadius: 30,
        backgroundColor: brandColors.additionalDefault,
        borderColor: brandColors.additionalDefault,
    },
    borderWidth: {
        borderTopWidth: 0.5,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(16),
        borderColor: brandColors.contentTertiary,
    },
    bgColorIconClose: { backgroundColor: colors.white },
    subscriptionBlock: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(16),
        backgroundColor: brandColors.additionalDefaultSubdued,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    subscriptionInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textPointColor: { color: brandColors.contentTertiary },
    fz16: { fontSize: layoutHelpers.getResponsiveSizeExtended(16) },
    maxWidthText: {
        maxWidth: '76%',
    },
})

const { getRtParamsBySource } = subscriptionsRtHelpers
const getCurrentSubscriptionGroup = (isOffScores: boolean, isCourses: boolean) => {
    if (isCourses) return 'Learn'
    return isOffScores ? 'PRO+' : 'PRO'
}

const getSubscriptionGroup = (isOffScores: boolean) => {
    if (isOffScores) return 'Learn'
    return 'Pro+'
}

const offScoresBenefits = [
    translate('native.marketing.offscores_licensed'),
    translate('native.marketing.export_community_scores_title'),
    translate('native.marketing.advanced_tools'),
]

const getCurrentSource = () => {
    return marketingConstants.sources.appCellCourses
}

export const TourAfterSellContainer = memo(() => {
    const [isPaymentInProgress, subscriptions, isOffScores, isCourses] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getAfterSaleSubscriptions,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
    ])
    const { requestPurchaseThunk, onCloseTour, setSource } = useActions({
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        onCloseTour: onCloseTourThunk,
        setSource: marketingStoreChunk.actions.setSource,
    })

    useEffect(() => {
        if (!subscriptions.length) onCloseTour()
    }, [subscriptions.length])

    const currentSubscription = subscriptions?.[0]

    const onClosePress = useCallback(() => {
        onCloseTour()
    }, [])

    useEffect(() => {
        setSource(getCurrentSource())
        const plansRtParams = {
            ...subscriptionsRtHelpers.withPaywallPlansRt(
                getRtParamsBySource({
                    source: getCurrentSource(),
                }),
                subscriptions,
            ),
            ...quizHelpers.getQuizAnswersRt(),
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    const onPurchase = useCallback(() => {
        if (currentSubscription?.productId) {
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                ...getRtParamsBySource({
                    source: getCurrentSource(),
                }),
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    currentSubscription?.productId,
                ),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(currentSubscription.productId),
                ...quizHelpers.getQuizAnswersRt(),
            })

            requestPurchaseThunk({
                subscription: currentSubscription,
                source: getCurrentSource(),
                callback: onCloseTour,
                isOfferPersonalized: true,
            })
        }
    }, [subscriptions])

    if (!subscriptions.length) return null

    return (
        <Animated.View entering={FadeIn.duration(800)} style={styles.lastChanceContainer}>
            <PaymentLayerCloseBlockComponent
                closeIconStyle={styles.closeIcon}
                onClose={onClosePress}
                closeIconBgStyle={styles.bgColorIconClose}
                containerStyle={globalStyles.fullWidth}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.featuresWrapper}
            >
                <OnboardingTitleComponent
                    title={translate('native.marketing.welcome_subscription_title', {
                        type: getCurrentSubscriptionGroup(isOffScores, isCourses),
                    })}
                    subTitle={translate('native.marketing.right_choice_title')}
                />
                <View style={styles.subscriptionBlock}>
                    <AppText
                        adaptiveSize
                        style={globalStyles.mb24}
                        font="f20w600"
                        rawText={translate(
                            currentSubscription?.trialStatus
                                ? 'native.marketing.after_sell.combines_with_trial'
                                : 'native.marketing.combines_title',
                            { type: getSubscriptionGroup(isOffScores) },
                        )}
                    />
                    {!isOffScores && (
                        <BenefitsComponent
                            style={globalStyles.mb16}
                            subscriptionBenefits={offScoresBenefits}
                        />
                    )}
                    <View
                        style={[
                            styles.subscriptionInfoContainer,
                            platform.isIos && globalStyles.mb24,
                        ]}
                    >
                        <AppText
                            adaptiveSize
                            font="f15w400"
                            rawText={translate('native.marketing.online_access', {
                                type: getSubscriptionGroup(isOffScores),
                            })}
                            style={styles.maxWidthText}
                            numberOfLines={2}
                        />
                        <AppText
                            adaptiveSize
                            font="f16w700"
                            rawText={currentSubscription?.formattedPrice}
                        />
                    </View>
                    {platform.isAndroid && (
                        <View style={[styles.subscriptionInfoContainer, globalStyles.mb24]}>
                            <AppText
                                adaptiveSize
                                font="f15w400"
                                rawText={translate('native.marketing.downlodable_materials')}
                                style={styles.maxWidthText}
                                numberOfLines={2}
                            />
                            <AppText
                                adaptiveSize
                                font="f16w700"
                                rawText={translate('native.marketing.free')}
                            />
                        </View>
                    )}
                    <AppText
                        adaptiveSize
                        font="f18w400"
                        rawText={translate('native.marketing.add_musescore_title', {
                            type: getSubscriptionGroup(isOffScores),
                        })}
                    />
                </View>
                <BillingInfoComponent
                    currentSubscriptionsGroup="learning"
                    customStyles={globalStyles.horizontalPadding20}
                />
            </ScrollView>
            {isPaymentInProgress && <Loader />}
            <BuyButton
                buttonText={translate('native.screen_tour.confirm')}
                onBuyPress={onPurchase}
                customButtonStyle={styles.rebrandButtonStyle}
                onCloseAndDismissPage={onClosePress}
                customDontTextStyle={{ color: brandColors.additionalDefault }}
                customDismissText={translate('native.marketing.skip_for_now')}
            />
        </Animated.View>
    )
})
