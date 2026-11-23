import { ReactElement, useEffect, useRef } from 'react'
import {
    ScrollView,
    type ScrollViewInstance,
    StyleSheet,
    useWindowDimensions,
    View,
    ViewStyle,
} from 'react-native'
import Animated, { AnimatedStyle, LinearTransition } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    DividerComponent,
    globalStyles,
    layout,
    layoutHelpers,
    NativeBottomSheet,
    SheetFooter,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useIsLandscape } from '@mu-native/system'

import { useShowBenefitsExperiment } from '../../../../sections/marketing/screens/tourInstall/hooks/useShowBenefitsExperiment.ts'
import { PieceSaleComponent, useUgPlanLineup4IterationExperiment } from '../../index.ts'
import {
    TInAppForShow,
    TPlanTypeTourInstall,
    type TProductId,
    TScreenName,
    TStockLandingPlanType,
    type TSubscription,
} from '../../types/marketingTypes.ts'
import BillingInfoComponent from '../billingPlansInfo/BillingInfoComponent.tsx'
import { MuseLogoComponent } from '../MuseLogo/MuseLogoComponent.tsx'
import PlanSwitcher from '../planSwitcher/PlanSwitcher.tsx'
import SubscribePlanComponent from '../subscribePlan/SubscriptionsPlanContainer.tsx'

import { FeaturesCarouselComponent } from './components/CarouselReviewComponent.tsx'
import { MuseTitleComponent } from './components/MuseTitleComponent.tsx'
import { MuseTextComponent } from './components/MuseTrustTextComponent.tsx'
import { SocialProofComponent } from './components/SocialProofComponent'
import { BenefitsPaymentLayerContainer } from './containers/BenefitsPaymentLayerContainer.tsx'
import { TourMorePlansContainer } from './containers/TourMorePlansContainer.tsx'
import { useScrollPositionEvents } from './hooks/useScrollPositionEvents'
import { PromoCodeContainer } from './PromoCodeContainer.tsx'

const styles = StyleSheet.create({
    customHeaderBottomSheet: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        height: 20,
        backgroundColor: brandColors.backgroundDefault,
    },
    containerPlanStyle: {
        justifyContent: 'center',
        alignSelf: 'center',
    },
    scrollViewContainer: {
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
        zIndex: 10,
    },
    longLanding: {
        width: '100%',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(100),
    },
    contentPlanContainer: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(24),
        alignSelf: 'center',
    },
    secondSubscriptionBlock: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(24),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(20),
    },
    itemFeatureContainer: {
        width: '100%',
        backgroundColor: colors.white,
        borderColor: colors.colorBorder,
        borderWidth: 1,
        borderRadius: 1,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    mt32: {
        marginTop: layoutHelpers.getResponsiveSizeExtended(32),
    },
    benefitContainer: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(32),
        backgroundColor: brandColors.additionalDefaultSubdued,
    },
    socialProofContainer: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        backgroundColor: brandColors.additionalDefaultSubdued,
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(16),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(32),
    },
    subscriptionTabletLayout: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 60,
    },
})

const renderCustomHeader = () => <View style={styles.customHeaderBottomSheet} />

// MUM-31610: адаптивный планшетный лейаут раскатан только на Android
const isTabletLayout = platform.isTablet && platform.isAndroid

type TTourLongPaymentLayerPlansComponentProps = {
    tourSaleAppText: string
    isActiveSwitcher: boolean
    currentSubscriptionsGroup: TStockLandingPlanType | TPlanTypeTourInstall
    onChangeSubscribePlan: (planId: string) => void
    activeSubscribePlan: TProductId
    switcherTourActiveColor: string
    isShowSwitcher: boolean
    onChangeSubscriptionsSwitcher: () => void
    animatedViewSwitcher: AnimatedStyle<ViewStyle>
    animatedViewSubscriptions: AnimatedStyle<ViewStyle>
    updatedSubscriptions: TSubscription[]
    setIsUserScrollDown?: () => void
    isNeedToShowTimer: boolean
    isScrollToTop: boolean
    isShowMorePlansComponent?: boolean
    isWebUpgrade?: boolean
    isShowTopScoreBlock?: boolean
    isActiveScore?: boolean
    creditBalance?: number
    inAppInfo?: TInAppForShow
    imageInAppUri?: string
    isHidePlanName?: boolean
    isTour?: boolean
    currentScreen: TScreenName
    footer?: ReactElement
    headerBottom?: number
    /** overrides the group's discount in the title, e.g. " 88% OFF" */
    saleValue?: string
}

export const TourLongPaymentLayerPlansComponent = ({
    tourSaleAppText,
    isActiveSwitcher,
    currentSubscriptionsGroup,
    updatedSubscriptions,
    onChangeSubscribePlan,
    activeSubscribePlan,
    animatedViewSubscriptions,
    isShowSwitcher,
    onChangeSubscriptionsSwitcher,
    switcherTourActiveColor,
    animatedViewSwitcher,
    setIsUserScrollDown,
    isNeedToShowTimer,
    isScrollToTop,
    isShowMorePlansComponent = platform.isIos,
    isWebUpgrade = false,
    isShowTopScoreBlock,
    isHidePlanName = false,
    isActiveScore = false,
    creditBalance,
    inAppInfo,
    imageInAppUri,
    isTour = false,
    currentScreen,
    footer,
    headerBottom,
    saleValue,
}: TTourLongPaymentLayerPlansComponentProps) => {
    const { onLayoutBlocks, onScroll } = useScrollPositionEvents()
    const { height } = useWindowDimensions()
    const sheetHeight = headerBottom
        ? height - headerBottom
        : height * (platform.isAndroid ? 0.97 : 0.94)
    const collapsedHeight = Math.min(height * 0.86, sheetHeight)
    const scrollRef = useRef<ScrollViewInstance>(null)

    useEffect(() => {
        if (isScrollToTop) {
            scrollRef.current?.scrollTo({
                y: 0,
                animated: true,
            })
        }
    }, [isScrollToTop])

    const isPromoCode = platform.isAndroid && isNeedToShowTimer

    const isLandscape = useIsLandscape()

    const isLandscapeLayout = isLandscape && isTabletLayout
    const { isUgPlanLineup4Iteration: isUgPlanLineup4IterationVariation } =
        useUgPlanLineup4IterationExperiment()
    const isUgPlanLineup = isUgPlanLineup4IterationVariation

    const { variation: variationBenefits } = useShowBenefitsExperiment(false)

    const isUgPlanLineupTour = isTour && isUgPlanLineup

    const isHideBenefits = (variationBenefits === 3 && isTour) || isUgPlanLineupTour

    const ScrollViewContent = (
        <ScrollView
            style={globalStyles.flex1FullWidth}
            onScroll={onScroll}
            contentContainerStyle={isTour ? styles.scrollViewContainer : styles.longLanding}
            onScrollEndDrag={setIsUserScrollDown}
            ref={scrollRef}
        >
            {isShowTopScoreBlock && !!inAppInfo && (
                <PieceSaleComponent
                    contentContainerStyle={globalStyles.horizontalPadding20}
                    isActiveScore={isActiveScore}
                    setActiveSubscribePlan={onChangeSubscribePlan}
                    inAppInfo={inAppInfo}
                    imageInAppUri={imageInAppUri}
                    creditBalance={creditBalance}
                />
            )}
            {isShowTopScoreBlock && <DividerComponent />}
            {!isPromoCode && !isUgPlanLineupTour && (
                <MuseLogoComponent
                    subscriptionName={isHidePlanName ? undefined : currentSubscriptionsGroup}
                />
            )}
            {!isLandscapeLayout &&
                (isPromoCode ? (
                    <PromoCodeContainer />
                ) : (
                    <MuseTitleComponent
                        currentSubscriptionsGroup={currentSubscriptionsGroup}
                        tourSaleAppText={tourSaleAppText}
                        isHideSaleText={isUgPlanLineupTour}
                        saleValue={saleValue}
                    />
                ))}
            <View style={styles.contentPlanContainer}>
                <Animated.View
                    layout={LinearTransition.duration(500)}
                    onLayout={onLayoutBlocks({ value: 'plans', item_id: 1 })}
                    style={[
                        isLandscapeLayout && styles.subscriptionTabletLayout,
                        animatedViewSubscriptions,
                    ]}
                >
                    {isLandscapeLayout && (
                        <View style={globalStyles.justifyContentCenter}>
                            <MuseTitleComponent
                                currentSubscriptionsGroup={currentSubscriptionsGroup}
                                tourSaleAppText={tourSaleAppText}
                                saleValue={saleValue}
                            />
                        </View>
                    )}
                    <SubscribePlanComponent
                        subscribePlans={updatedSubscriptions}
                        activeSubscribePlan={activeSubscribePlan}
                        onPress={onChangeSubscribePlan}
                        currentScreen={currentScreen}
                        isNeedToShowTimer={isNeedToShowTimer && !isPromoCode}
                        containerStyle={styles.containerPlanStyle}
                        isWebUpgrade={isWebUpgrade}
                        isLandscapeLayout={isLandscapeLayout}
                    />
                </Animated.View>
                {isShowSwitcher && (
                    <Animated.View
                        layout={LinearTransition.duration(500)}
                        style={animatedViewSwitcher}
                    >
                        <PlanSwitcher
                            customTitle={
                                currentSubscriptionsGroup === 'learning' ||
                                currentSubscriptionsGroup === 'learningLite'
                                    ? translate('native.screen_sft.switcher_title')
                                    : ''
                            }
                            colorText={brandColors.contentPrimary}
                            backgroundColor={colors.gray300}
                            activeColor={switcherTourActiveColor}
                            isActiveOffScores={isActiveSwitcher}
                            changeSubscriptions={onChangeSubscriptionsSwitcher}
                        />
                    </Animated.View>
                )}
                <Animated.View layout={LinearTransition.duration(500)}>
                    <MuseTextComponent isLandscape={isLandscapeLayout} />
                </Animated.View>
                <Animated.View
                    layout={LinearTransition.duration(500)}
                    onLayout={onLayoutBlocks({ value: 'social_proof', item_id: 2 })}
                >
                    <FeaturesCarouselComponent />
                </Animated.View>
            </View>
            {!isHideBenefits && (
                <Animated.View
                    layout={LinearTransition.duration(500)}
                    onLayout={onLayoutBlocks({ value: 'benefits', item_id: 3 })}
                    style={styles.benefitContainer}
                >
                    <BenefitsPaymentLayerContainer
                        isLandscapeLayout={isLandscapeLayout}
                        currentSubscriptionsGroup={currentSubscriptionsGroup}
                    />
                </Animated.View>
            )}
            {!isUgPlanLineupTour && (
                <Animated.View
                    layout={LinearTransition.duration(500)}
                    onLayout={onLayoutBlocks({ value: 'store_reviews', item_id: 4 })}
                    style={styles.socialProofContainer}
                >
                    <View style={[styles.itemFeatureContainer, isHideBenefits && styles.mt32]}>
                        <SocialProofComponent />
                    </View>
                </Animated.View>
            )}
            {!isUgPlanLineupTour && (
                <Animated.View
                    layout={LinearTransition.duration(500)}
                    onLayout={onLayoutBlocks({ value: 'plans', item_id: 5 })}
                    style={styles.secondSubscriptionBlock}
                >
                    <AppText
                        textAlign="center"
                        font="f24w600"
                        rawText={translate('native.screen_tour.choose_subs')}
                        style={globalStyles.mb4}
                        adaptiveSize
                    />
                    <AppText
                        font="f15w400"
                        brandColor="contentSecondary"
                        rawText={translate('native.screen_tour.secured', {
                            storeName: platform.isAndroid ? 'Play Market' : 'App Store',
                        })}
                        textAlign="center"
                        adaptiveSize
                        style={globalStyles.mb32}
                    />
                    {!isShowMorePlansComponent && (
                        <Animated.View style={animatedViewSubscriptions}>
                            <SubscribePlanComponent
                                subscribePlans={updatedSubscriptions}
                                activeSubscribePlan={activeSubscribePlan}
                                onPress={onChangeSubscribePlan}
                                currentScreen={currentScreen}
                                containerStyle={styles.containerPlanStyle}
                                isWebUpgrade={isWebUpgrade}
                                isLandscapeLayout={isLandscapeLayout}
                            />
                        </Animated.View>
                    )}
                    {isShowMorePlansComponent && (
                        <TourMorePlansContainer
                            activeSubscribePlan={activeSubscribePlan}
                            onChangeSubscribePlan={onChangeSubscribePlan}
                            isLandscapeLayout={isLandscapeLayout}
                        />
                    )}
                    {isShowSwitcher && !isShowMorePlansComponent && (
                        <Animated.View layout={LinearTransition.duration(500)}>
                            <PlanSwitcher
                                colorText={brandColors.contentPrimary}
                                backgroundColor={colors.gray300}
                                activeColor={switcherTourActiveColor}
                                isActiveOffScores={isActiveSwitcher}
                                changeSubscriptions={onChangeSubscriptionsSwitcher}
                                customTitle={
                                    currentSubscriptionsGroup === 'learning' ||
                                    currentSubscriptionsGroup === 'learningLite'
                                        ? translate('native.screen_sft.switcher_title')
                                        : ''
                                }
                            />
                        </Animated.View>
                    )}
                </Animated.View>
            )}
            <Animated.View layout={LinearTransition.duration(500)}>
                {!isWebUpgrade && (
                    <BillingInfoComponent
                        currentSubscriptionsGroup={currentSubscriptionsGroup}
                        customStyles={globalStyles.horizontalPadding20}
                    />
                )}
            </Animated.View>
        </ScrollView>
    )

    if (!isTour) return ScrollViewContent

    return (
        <>
            <NativeBottomSheet
                inline
                presentOnMount
                hideHandle
                enablePanDownToClose={false}
                overlayOpacity={0}
                radius={12}
                maxHeight={sheetHeight}
                rootViewStyle={{ height: sheetHeight }}
                applyMaxHeightToMinHeight
                collapsedHeight={collapsedHeight}
                maxWidth={
                    platform.isTablet && !isTabletLayout
                        ? layout.maxWidthTabletContainer
                        : undefined
                }
            >
                {renderCustomHeader()}
                {ScrollViewContent}
            </NativeBottomSheet>
            {!!footer && <SheetFooter>{footer}</SheetFooter>}
        </>
    )
}
