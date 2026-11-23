import { memo, useEffect, useLayoutEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    colors,
    layoutHelpers,
    LinearGradient,
    RootViewScreenComponent,
    RootViewTabletLayoutComponent,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BenefitsComponent,
    billingThunks,
    BuyButton,
    marketingStoreChunk,
    PaymentLoaderContainer,
    sources,
    subscriptionsRtHelpers,
    useProductInApp,
} from '@mu-native/marketing'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import { NavHeader } from '../../../../../App/Components/NavHeader/NavHeader'
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'

const styles = StyleSheet.create({
    scoreImage: {
        width: platform.isTablet ? layoutHelpers.getResponsiveSizeExtended(340) : '100%',
        height: layoutHelpers.getResponsiveSizeExtended(550),
        borderTopWidth: 1,
        borderColor: colors.gray200,
        alignSelf: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
    linearWhite: {
        width: '100%',
        height: layoutHelpers.getResponsiveSizeExtended(50),
    },
    benefitsContainer: {
        marginTop: layoutHelpers.getResponsiveSizeExtended(-150),
        zIndex: 1,
        width: '100%',
    },
    benefits: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        backgroundColor: colors.white,
        paddingBottom: 40,
    },
    textButButtonStyle: {
        textTransform: 'none',
    },
})

const scoreBenefits = [
    translate('native.marketing.full_view_score_title'),
    translate('native.marketing.download_pdf'),
]
const gradientColors = ['rgba(255, 255, 255, 0.6)', colors.white]

export const ScoreSaleContainer = memo(() => {
    const navigation = useAppNavigation()
    const { score } = useAppRoute<{ score: MSScoreT }>()
    const { productInApp } = useProductInApp(score)

    const actions = useActions({
        setSource: marketingStoreChunk.actions.setSource,
        requestPurchaseThunk: billingThunks.requestPurchaseThunk,
        setInAppForSale: marketingStoreChunk.actions.setInAppForSale,
    })

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return <NavHeader noNotifications />
            },
        })
    }, [])

    useEffect(() => {
        actions.setInAppForSale(score)
        actions.setSource(sources.pdfPieceSale)

        reportEvent(
            MetricaEvents.LANDING_PLANS_VIEW,
            // @ts-ignore
            subscriptionsRtHelpers.getRtParamsBySource({ source: sources.pdfPieceSale }),
        )

        return () => {
            reportEvent(
                MetricaEvents.LANDING_PLANS_CLOSE,
                // @ts-ignore
                subscriptionsRtHelpers.getRtParamsBySource({ source: sources.pdfPieceSale }),
            )
        }
    }, [])

    const onBuyInAppItem = () => {
        if (productInApp?.productId) {
            reportEvent(MetricaEvents.LANDING_CHECKOUT_VIEW, {
                subscription_purchase: subscriptionsRtHelpers.getSubscriptionPurchaseByProductId(
                    productInApp.productId,
                ),
                ...subscriptionsRtHelpers.getCheckoutPlanRtParams(productInApp.productId),
                ...subscriptionsRtHelpers.getRtParamsBySource({ source: sources.pdfPieceSale }),
            })
            actions.requestPurchaseThunk({
                subscription: productInApp,
                source: sources.pdfPieceSale,
                callback: () => {
                    navigation.goBack()
                    navigation.navigate('ScreenOrders')
                },
            })
        }
    }

    return (
        <RootViewScreenComponent>
            <RootViewTabletLayoutComponent>
                {!!score?.largePreviewUrl && (
                    <Animated.Image
                        entering={FadeIn.duration(600)}
                        resizeMode="contain"
                        source={{ uri: score.largePreviewUrl }}
                        style={styles.scoreImage}
                    />
                )}
                <View style={styles.benefitsContainer}>
                    <LinearGradient style={styles.linearWhite} colors={gradientColors} />
                    <BenefitsComponent
                        style={styles.benefits}
                        subscriptionBenefits={scoreBenefits}
                    />
                </View>
                <BuyButton
                    onBuyPress={onBuyInAppItem}
                    customButtonTextStyle={styles.textButButtonStyle}
                    buttonText={translate(
                        productInApp?.displayPrice
                            ? 'native.marketing.buy_this_score'
                            : 'native.buyThisScore',
                        { price: productInApp?.displayPrice || '' },
                    )}
                />
                <PaymentLoaderContainer />
            </RootViewTabletLayoutComponent>
        </RootViewScreenComponent>
    )
})
