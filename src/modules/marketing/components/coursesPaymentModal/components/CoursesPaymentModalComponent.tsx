import { memo, useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { marketingTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    Loader,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useWindowDimensions } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import { findByProductId } from '../../../helpers/findByProductId'
import {
    billingThunks,
    BuyButton,
    getSaleSubscriptionsLearn,
    marketingConstants,
    marketingStoreChunk,
    PaymentLayerCloseBlockComponent,
    SubscribePlanComponent,
    subscriptionsRtHelpers,
    TProductId,
    TSubscription,
} from '../../../index'
import BillingInfoComponent from '../../billingPlansInfo/BillingInfoComponent'
import { indexOfFirstItemInColumn, indexOfLastItemInColumn } from '../constants'

const imagesArrayFirstLine = [
    icons.coursesCarousel_1,
    icons.coursesCarousel_3,
    icons.coursesCarousel_4,
    icons.coursesCarousel_2,
    icons.coursesCarousel_9,
]

const imagesArraySecondLine = [
    icons.coursesCarousel_6,
    icons.coursesCarousel_7,
    icons.coursesCarousel_5,
    icons.coursesCarousel_8,
    icons.coursesCarousel_10,
]

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    paymentModalContainer: {
        width: '100%',
        height: '100%',
        zIndex: 10000,
        backgroundColor: colors.white,
    },
    contentContainerScroll: {
        paddingBottom: platform.isTablet ? '16%' : '6%',
        minHeight: '100%',
    },
    itemImageLandscape: {
        width: getResponsiveSizeExtended(198),
    },
    firstItemImageFirstCarousel: {
        width: 100,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
        marginLeft: platform.isTablet ? 0 : '18%',
    },
    firstItemImageSecondCarousel: {
        width: 180,
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
    },
    lastItemImageFirstCarousel: {
        width: 104,
        marginRight: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },
    lastItemImageSecondCarousel: {
        width: 24,
        marginRight: 0,
        borderBottomRightRadius: 0,
        borderTopRightRadius: 0,
    },
    subscribePlanContainer: {
        alignSelf: 'center',
        minHeight: 200,
    },
    plansContainer: {
        padding: layout.marginMd,
        alignSelf: 'center',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        minHeight: '40%',
    },
    itemImageCarousel: {
        width: layoutHelpers.getResponsiveSizeExtended(210),
        height: layoutHelpers.getResponsiveSizeExtended(120),
        marginRight: layoutHelpers.getResponsiveSizeExtended(2),
    },
    firstItemImageFirstCarouselExp: {
        marginLeft: 0,
    },
    carouselSecondContainer: {
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        width: '100%',
    },
    textTitleStyle: {
        marginVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
        maxWidth: layoutHelpers.getResponsiveSizeExtended(360),
        alignSelf: 'center',
    },
    courseButtonContainer: { position: 'relative', borderTopWidth: 0 },
    paymentCloseContainer: {
        backgroundColor: brandColors.overlyModal,
        borderRadius: 25,
        left: layoutHelpers.getResponsiveSizeExtended(10),
    },
    tintCloseIconColor: { tintColor: brandColors.backgroundDefault },
})

const dynamicStyles = {
    getImageStyleFirstLine: (isLandscape: boolean, index: number) =>
        StyleSheet.flatten([
            styles.itemImageCarousel,
            isLandscape && styles.itemImageLandscape,
            index === indexOfFirstItemInColumn && styles.firstItemImageFirstCarousel,
            index === indexOfLastItemInColumn && styles.lastItemImageFirstCarousel,
            styles.firstItemImageFirstCarouselExp,
        ]),
    getImageStyleSecondLine: (isLandscape: boolean, index: number) =>
        StyleSheet.flatten([
            styles.itemImageCarousel,
            isLandscape && styles.itemImageLandscape,
            index === indexOfFirstItemInColumn && styles.firstItemImageSecondCarousel,
            index === indexOfLastItemInColumn && styles.lastItemImageSecondCarousel,
            styles.firstItemImageFirstCarouselExp,
        ]),
}

const imageWidthContent = 228 * 4 + 180 + 104 + 16 * 5

type TPaymentModalProps = {
    onHideModal: () => void
}

const CoursesPaymentModalComponent = ({ onHideModal }: TPaymentModalProps) => {
    const [isPaymentInProgress, subscriptions, contentFields] = useValues([
        marketingStoreChunk.props.getIsPaymentInProgress,
        getSaleSubscriptionsLearn,
        marketingStoreChunk.props.getContentFields,
    ])
    const { requestPurchaseThunk, setSource } = useActions({
        setSource: marketingStoreChunk.actions.setSource,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
    })

    const opacityModal = useSharedValue(0)

    const [activeSubscribePlanId, setActiveSubscriptionPlan] = useState(
        marketingConstants.instantLearnSubscriptionId,
    )
    const { height, width } = useWindowDimensions()
    // для больших планшетов в гориз. режиме картинки нужно растягивать
    const isLandscape = height < width && width > imageWidthContent

    const onPurchase = async (
        subscription: TSubscription,
        callback: (...args: Array<any>) => any,
    ) => {
        reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
            ui: marketingConstants.sources.coursesLanding,
            ...subscriptionsRtHelpers.getCheckoutPlanRtParams(subscription?.productId),
            subscription_type: ['learn'],
            subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                subscription?.productId,
            ),
            funnel_type: 'intentional',
            landing_name: 'Course',
            funnel_source: marketingConstants.sources.coursesLanding,
        })

        requestPurchaseThunk({
            subscription,
            source: marketingConstants.sources.coursesLanding,
            callback,
        })
    }

    const onChangeSubscribePlan = (activeSubscribePlan: TProductId) => {
        if (activeSubscribePlanId === activeSubscribePlan) {
            const subscription = subscriptions?.find(
                subscription => subscription?.productId === activeSubscribePlan,
            ) as TSubscription
            onPurchase(subscription, () => {
                onHideModal()
            })
        } else {
            setActiveSubscriptionPlan(activeSubscribePlan)
            reportEvent(MetricaEvents.LANDING_PLAN_CHANGE, {
                productId: activeSubscribePlan,
                ui: marketingConstants.sources.coursesLanding,
                subscription_type: ['learn'],
                funnel_type: 'intentional',
                landing_name: 'Course',
                funnel_source: marketingConstants.sources.coursesLanding,
            })
        }
    }

    useEffect(() => {
        opacityModal.value = withTiming(1, {
            duration: 800,
        })

        setSource(marketingConstants.sources.coursesLanding)

        const plansRtParams = {
            ui: marketingConstants.sources.coursesLanding,
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                ['learn'],
                subscriptions,
            ),
            funnel_type: 'intentional',
            landing_name: 'Course',
            funnel_source: marketingConstants.sources.coursesLanding,
        }
        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, plansRtParams)

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, plansRtParams)
        }
    }, [])

    const onButItemPress = () => {
        const subscription = findByProductId(subscriptions, activeSubscribePlanId) as TSubscription
        onPurchase(subscription, () => {
            onHideModal()
        })
    }

    const subscription = subscriptions.find(
        subscription => subscription?.productId === activeSubscribePlanId,
    )
    const textAboveButton = subscription?.textAboveButton

    const viewOpacity = useAnimatedStyle(() => ({
        opacity: opacityModal.value,
    }))

    return (
        <Reanimated.View
            style={[styles.paymentModalContainer, viewOpacity]}
            testID={marketingTestIds.coursesPaymentModal}
        >
            <PaymentLayerCloseBlockComponent
                onClose={onHideModal}
                closeIconStyle={styles.tintCloseIconColor}
                containerStyle={styles.paymentCloseContainer}
            />
            <ScrollView
                style={globalStyles.fullWidth}
                contentContainerStyle={styles.contentContainerScroll}
            >
                <View style={styles.carouselSecondContainer}>
                    {imagesArrayFirstLine.map((item, index) => (
                        <Image
                            style={dynamicStyles.getImageStyleFirstLine(isLandscape, index)}
                            key={`course - ${index.toString()}`}
                            source={item}
                            resizeMode="cover"
                        />
                    ))}
                </View>
                <View style={styles.carouselSecondContainer}>
                    {imagesArraySecondLine.map((item, index) => (
                        <Image
                            style={dynamicStyles.getImageStyleSecondLine(isLandscape, index)}
                            key={`course - ${index.toString()}`}
                            source={item}
                            resizeMode="cover"
                        />
                    ))}
                </View>
                <View style={styles.plansContainer}>
                    <AppText
                        adaptiveSize
                        font="f20w600"
                        textAlign="center"
                        style={styles.textTitleStyle}
                    >
                        {translate('native.marketing.courses_payment.title_count', {
                            count: contentFields.coursesCount,
                        })}
                    </AppText>
                    <SubscribePlanComponent
                        activeSubscribePlan={activeSubscribePlanId}
                        subscribePlans={subscriptions}
                        onPress={onChangeSubscribePlan}
                        currentScreen="FLOATING"
                        containerStyle={styles.subscribePlanContainer}
                    />
                    <BuyButton
                        customStyleContainer={styles.courseButtonContainer}
                        onBuyPress={onButItemPress}
                        textAboveButton={
                            textAboveButton || translate('native.screen_tour.free_cancel')
                        }
                        buttonText={translate('native.screen_tour.start_now_text')}
                    />
                    <BillingInfoComponent />
                </View>
            </ScrollView>

            {isPaymentInProgress && <Loader />}
        </Reanimated.View>
    )
}

export default memo(CoursesPaymentModalComponent)
