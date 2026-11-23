import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Reanimated from 'react-native-reanimated'

import {
    brandColors,
    colors,
    globalStyles,
    layout,
    layoutHelpers,
    Loader,
    useSafeAreaInsets,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BackButton,
    billingThunks,
    BuyButton,
    CreditsInfoComponent,
    FeaturesCarouselComponent,
    getCreditsPack,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
    TProduct,
    TProductId,
    TProductInApp,
    useAnimatedScrollShadow,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { showAlertNotification } from '../../../../../App/Elements/NewAlertNotifications'
import reportEvent from '../../../../../App/Utils/Analytics'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    scrollContentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.marginMd,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        width: '100%',
        backgroundColor: brandColors.backgroundDefault,
        paddingBottom: getResponsiveSizeExtended(120),
        paddingTop: getResponsiveSizeExtended(24),
    },
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: brandColors.backgroundDefault,
        borderRadius: 12,
    },
    scrollViewContainer: {
        backgroundColor: colors.blue100,
    },
})

// id пака вида com.musescore.player.scorefeatures.<количество>.credit
const getCreditsCount = (productId: TProductId) =>
    productId.match(/\.(\d+)\.credit$/)?.[1] ?? productId.replace(/\D+/g, '')

const CreditsLandingContainer = () => {
    const { goBack } = useNavigation()
    const insets = useSafeAreaInsets()
    const actions = useActions({
        invokeClosePaymentModalCallbackThunk: marketingThunks.invokeClosePaymentModalCallbackThunk,
        setIsAutoScrollSettingsModalVisible:
            marketingStoreChunk.actions.setIsAutoScrollSettingsModalVisible,
        setFeatureText: marketingStoreChunk.actions.setFeatureText,
        setPaymentInProgress: marketingStoreChunk.actions.setIsPaymentInProgress,
        setRestoreProcessing: marketingStoreChunk.actions.setIsRestoreProcessing,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
    })

    const [source, products, isPaymentInProgress] = useValues([
        marketingStoreChunk.props.getSource,
        getCreditsPack,
        marketingStoreChunk.props.getIsPaymentInProgress,
    ])

    const [activeSubscribePlan, setActiveSubscribePlan] = useState<TProductId>(
        marketingConstants.credit5pack,
    )

    const purchaseCallback = useCallback((productId: TProductId) => {
        goBack()
        showAlertNotification({
            title: translate('native.credits.balance_top_up_success', {
                count: getCreditsCount(productId),
            }),
        })
    }, [])

    const onPurchase = useCallback(
        (subscription?: TProduct) => {
            if (subscription) {
                reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                    ui: source,
                    subscription_type: ['piece'],
                    subscription_purchase: 'piece',
                    ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription.productId),
                    funnel_type: 'intentional',
                    landing_name: 'Pro Credit Balance landing',
                    funnel_source: source,
                    have_quiz: 'no',
                })
                actions.requestPurchaseThunk({
                    subscription,
                    source,
                    callback: () => purchaseCallback(subscription.productId),
                })
            }
        },
        [source, purchaseCallback],
    )

    const onChangeSubscribePlan = useCallback(
        (activeSubscribePlanId: TProductId) => {
            if (marketingConstants.listInApps.includes(activeSubscribePlanId)) {
                reportEvent(MetricaEvents.SCORE_PIECE_SALE_SHOW_CLICK, {
                    ui: 'cart',
                })
            }

            setActiveSubscribePlan(prevActiveSubscribePlanId => {
                if (activeSubscribePlanId === prevActiveSubscribePlanId) {
                    const product = products?.find(
                        product => product?.productId === activeSubscribePlanId,
                    )
                    if (product) onPurchase(product)

                    return prevActiveSubscribePlanId
                }

                reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                    productId: activeSubscribePlanId,
                    subscription_type: ['piece'],
                    funnel_type: 'intentional',
                    landing_name: 'Pro Credit Balance landing',
                    funnel_source: source,
                    have_quiz: 'no',
                })
                return activeSubscribePlanId
            })
        },
        [products, source],
    )

    const onPressStartTrial = useCallback(() => {
        setActiveSubscribePlan(activePlanId => {

            if (marketingConstants.listInApps.includes(activePlanId)) {
                reportEvent(MetricaEvents.SCORE_PIECE_SALE_SHOW_CLICK, {
                    ui: 'cart',
                })
            }

            const product = products?.find(product => product?.productId === activePlanId)
            onPurchase(product)

            return activePlanId
        })
    }, [products])

    useEffect(() => {
        if (isPaymentInProgress) actions.setPaymentInProgress(false)

        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            subscription_type: ['piece'],
            funnel_type: 'intentional',
            landing_name: 'Pro Credit Balance landing',
            funnel_source: source,
            have_quiz: 'no',
        })

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                subscription_type: ['piece'],
                funnel_type: 'intentional',
                landing_name: 'Pro Credit Balance landing',
                funnel_source: source,
                have_quiz: 'no',
            })
        }
    }, [])

    const buttonText = translate('native.screen_tour.start_now_text')

    const { onContentSizeChange, scrollHandler, scrollOffset, contentHeight, isNeedToShowShadow } =
        useAnimatedScrollShadow()

    return (
        <View style={styles.container}>
            <Reanimated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
                onScroll={scrollHandler}
                scrollEventThrottle={30}
                onContentSizeChange={onContentSizeChange}
            >
                <BackButton />
                <FeaturesCarouselComponent topInset={insets?.top} />
                <View style={styles.scrollContentContainer}>
                    <CreditsInfoComponent />
                    <SubscribePlanComponent
                        activeSubscribePlan={activeSubscribePlan}
                        onPress={onChangeSubscribePlan}
                        subscribePlans={products as unknown as TProductInApp[]}
                    />
                </View>

                {isPaymentInProgress && <Loader />}
            </Reanimated.ScrollView>
            <BuyButton
                onBuyPress={onPressStartTrial}
                buttonText={buttonText}
                customStyleContainer={globalStyles.pt12}
                contentHeight={contentHeight}
                isNeedToShowShadow={isNeedToShowShadow}
                shadowOpacity={scrollOffset}
            />
        </View>
    )
}

export default CreditsLandingContainer
