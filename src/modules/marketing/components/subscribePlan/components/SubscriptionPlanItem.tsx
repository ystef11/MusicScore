import { memo } from 'react'
import { StyleSheet, TextStyle, TouchableOpacity } from 'react-native'
import Reanimated, { LinearTransition } from 'react-native-reanimated'

import { brandColors, colors, globalStyles, layoutHelpers } from '@mu-native/ds'
import { type TSubscriptionsTheme } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import { marketingConstants } from '@mu-native/marketing'

import type {
    TProductId,
    TProductInApp,
    TScreenName,
    TSubscription,
} from '../../../types/marketingTypes'
import { getNamedPersonalOfferTitle } from '../../../constants/subsriptionBillingConstants'
import BuyButton from '../../buyButton/BuyButtonComponent'

import BadgeComponent from './components/BadgeComponent'
import CheckCorner from './components/CheckCornerComponent'
import { FeatureListComponent } from './components/FeatureListComponent'
import TextFirstLine from './components/TextFirstLineComponent'
import TextSecondLine from './components/TextSecondLineComponent'

const styles = StyleSheet.create({
    subscriptionItemStyle: {
        maxWidth: 500,
    },
    extraContainer: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        borderRadius: 2,
        borderStyle: 'solid',
        justifyContent: 'center',
        borderWidth: 2,
    },
    hidden: { overflow: 'hidden' },
    customButtonStyle: {
        position: 'relative',
        paddingHorizontal: 0,
        backgroundColor: colors.transparent,
    },
    creditsLabelStyle: {
        borderTopWidth: 1,
        marginTop: layoutHelpers.getResponsiveSizeExtended(8),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(8),
    },
})

const dynamicStyles = {
    getFirstLineStyle: (isNeedToShowBadge: boolean) => ({
        paddingTop: isNeedToShowBadge ? layoutHelpers.getResponsiveSizeExtended(4) : 0,
    }),
    getTextLineStyles: (
        currentScreen: TScreenName,
        isActive: boolean,
        color: string,
    ): TextStyle => ({
        textDecorationLine:
            currentScreen === 'ANNIVERSARY_SCREEN' && !isActive ? 'line-through' : 'none',
        color,
    }),
    getContainerPlanStyle: ({
        currentBorderColor,
        currentBackgroundColor,
        isHiddenStyle,
    }: {
        currentBorderColor: string
        currentBackgroundColor: string
        isHiddenStyle: boolean
    }) => [
        styles.extraContainer,
        {
            borderColor: currentBorderColor,
            backgroundColor: currentBackgroundColor,
        },
        isHiddenStyle && styles.hidden,
    ],
}

type TSubscriptionItemProps = {
    onChangeSubscribePlan: (productId: TProductId) => void
    index: number
    subscription: TSubscription | TProductInApp
    isActive: boolean
    subscriptionsLength: number
    currentScreen: TScreenName
    username?: string
    subscriptionsTheme: TSubscriptionsTheme
    isNeedToShowTimer: boolean
    isLandscapeLayout?: boolean
    isLandscape: boolean
    isBilledAnnuallyExp?: boolean
}

const SubscriptionItem = ({
    onChangeSubscribePlan,
    index,
    subscription,
    isActive,
    subscriptionsLength,
    currentScreen,
    username,
    subscriptionsTheme,
    isNeedToShowTimer,
    isLandscapeLayout = false,
    isLandscape,
    isBilledAnnuallyExp = false,
}: TSubscriptionItemProps) => {
    const isTourMorePlans = currentScreen === 'TOUR_MORE_PLANS'
    const isProfileScreen = currentScreen === 'PROFILE'
    const { productId, summary = '', customPlanName, badgeText, planName = '' } = subscription

    const summaryExp = 'summaryExp' in subscription ? subscription.summaryExp : ''
    const summaryText = isBilledAnnuallyExp && summaryExp ? summaryExp : summary

    if (!subscription) return null

    const {
        featureColorText,
        borderColorActive,
        activeBackground,
        disabledBackground,
        disabledBorderColor,
        textColor = colors.text900,
        textColorActiveByIndex,
        badgeText: badgeTextColor,
        textLine2Color,
    } = subscriptionsTheme[currentScreen] || subscriptionsTheme.TOUR_INSTALL

    const textColorActive = textColorActiveByIndex?.[
        String(index) as keyof typeof textColorActiveByIndex
    ] as string
    const currentBackgroundColor = isActive ? activeBackground : disabledBackground
    const currentBorderColor = isActive ? borderColorActive : disabledBorderColor
    const isLastChance = currentScreen === 'LAST_CHANCE'
    const profileActiveFeatures = isProfileScreen ? isActive : false
    const isShowFeature = isProfileScreen
        ? profileActiveFeatures
        : productId === marketingConstants.instantOneSubscriptionId &&
          currentScreen !== 'TOUR_INSTALL'
    const profileTitle =
        isTourMorePlans || isProfileScreen || currentScreen === 'ANNIVERSARY_SCREEN'
            ? customPlanName
            : ''
    const text = profileTitle || planName
    const textProduct =
        (username && !profileTitle && getNamedPersonalOfferTitle(productId, username)) || text

    const onChangePlan = () => {
        onChangeSubscribePlan(productId)
    }
    const isNeedToShowBadge =
        ((!!badgeText && !isProfileScreen) || isLastChance) && !isTourMorePlans
    const isPersonalOfferBadge = isProfileScreen && index === 0
    const showBadge = isNeedToShowBadge || isPersonalOfferBadge

    return (
        <Reanimated.View
            style={[isLandscapeLayout && styles.subscriptionItemStyle, globalStyles.fullWidth]}
            layout={LinearTransition.duration(500)}
        >
            <TouchableOpacity activeOpacity={1} onPress={onChangePlan}>
                {showBadge && (
                    <BadgeComponent
                        text={
                            isPersonalOfferBadge
                                ? translate('native.marketing.your_personal_offer')
                                : badgeText
                        }
                        backgroundColor={
                            isPersonalOfferBadge ? brandColors.accentPrimary : borderColorActive
                        }
                        textColor={badgeTextColor}
                        isShowTimer={!isPersonalOfferBadge && (isNeedToShowTimer || isLastChance)}
                        isBigBadge={false}
                    />
                )}
                <Reanimated.View
                    layout={LinearTransition.duration(500)}
                    style={dynamicStyles.getContainerPlanStyle({
                        currentBorderColor,
                        currentBackgroundColor,
                        isHiddenStyle: isProfileScreen,
                    })}
                >
                    <TextFirstLine
                        color={isActive ? textColorActive || textColor : textColor}
                        dateText={textProduct}
                        style={dynamicStyles.getFirstLineStyle(showBadge)}
                    />
                    {!!summaryText && (
                        <TextSecondLine
                            text={summaryText}
                            customStyle={dynamicStyles.getTextLineStyles(
                                currentScreen,
                                isActive,
                                textLine2Color,
                            )}
                        />
                    )}
                    {!!subscription.creditsCount && (
                        <TextSecondLine
                            text={translate('native.marketing.free_official_scores_downloads', {
                                count: subscription.creditsCount,
                            })}
                            font="f13w600"
                            customStyle={styles.creditsLabelStyle}
                        />
                    )}
                    <FeatureListComponent
                        isShowFeatures={isShowFeature || isTourMorePlans}
                        featureList={
                            isProfileScreen || isTourMorePlans
                                ? subscription?.customFeatureList
                                : subscription?.featureList
                        }
                        featureColorText={featureColorText}
                        colorCheckFeatures={brandColors.statusSuccess}
                    />
                    {isProfileScreen && isActive && !isTourMorePlans && (
                        <BuyButton
                            textAboveButton=""
                            onBuyPress={onChangePlan}
                            buttonText={translate('native.marketing.continue')}
                            customStyleContainer={styles.customButtonStyle}
                            customButtonStyle={globalStyles.mb0}
                            customBottomInset={0}
                        />
                    )}
                    {!isTourMorePlans && (
                        <CheckCorner color={borderColorActive} opacity={isActive ? 1 : 0} />
                    )}
                </Reanimated.View>
            </TouchableOpacity>
        </Reanimated.View>
    )
}

export default memo(SubscriptionItem)
