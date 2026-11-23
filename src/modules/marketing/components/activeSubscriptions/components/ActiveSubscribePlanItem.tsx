import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, colors, globalStyles, layoutHelpers } from '@mu-native/ds'
import { type TSubscriptionsTheme } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'

import type { TCurrentSubscription, TSubscription } from '../../../types/marketingTypes'
import BuyButton from '../../buyButton/BuyButtonComponent'
// TODO если будет раскатка экспа перенести компоненты на уровень выше
import BadgeComponent from '../../subscribePlan/components/components/BadgeComponent'
import { FeatureListComponent } from '../../subscribePlan/components/components/FeatureListComponent'
import TextFirstLine from '../../subscribePlan/components/components/TextFirstLineComponent'

const styles = StyleSheet.create({
    extraContainer: {
        marginVertical: 8,
        paddingHorizontal: layoutHelpers.isSmallScreenDevice ? 8 : 16,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(10),
        paddingBottom: 12,
        borderRadius: 2,
        backgroundColor: colors.transparent,
        borderStyle: 'solid',
        justifyContent: 'center',
        borderWidth: 1,
    },
    customButtonContainerStyle: {
        position: 'relative',
        paddingHorizontal: 0,
        backgroundColor: colors.transparent,
    },
    customButtonDisabledStyle: {
        backgroundColor: brandColors.colorBackgroundDisabled,
        borderRadius: 60,
    },
    customButtonActiveStyle: {
        borderRadius: 60,
    },
    highlightedActiveContainer: {
        borderWidth: 2,
        borderColor: brandColors.accentPrimary,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(16),
    },
})

const dynamicStyles = {
    getContainerPlanStyle: ({
        currentBorderColor,
        currentBackgroundColor,
        isHighlighted,
    }: {
        currentBorderColor: string
        currentBackgroundColor: string
        isHighlighted: boolean
    }) => [
        styles.extraContainer,
        {
            borderColor: currentBorderColor,
            backgroundColor: currentBackgroundColor,
        },
        isHighlighted && styles.highlightedActiveContainer,
    ],
}

type TSubscriptionItemProps = {
    onPressPlan?: (plan: TCurrentSubscription | TSubscription) => void
    index: number
    subscription: TCurrentSubscription | TSubscription
    subscriptionsTheme: TSubscriptionsTheme
    isActive: boolean
    isHighlightActive?: boolean
}

export const ActiveSubscribePlanItemComponent = memo(
    ({
        index,
        subscription,
        onPressPlan,
        isActive,
        subscriptionsTheme,
        isHighlightActive = false,
    }: TSubscriptionItemProps) => {
        if (!subscription) return null

        const {
            featureColorText,
            borderColorActive,
            textColor = colors.text900,
            badgeText: badgeTextColor,
        } = subscriptionsTheme.PROFILE

        const onPressPlanButton = () => {
            onPressPlan?.(subscription)
        }

        const featureList =
            'customFeatureList' in subscription
                ? subscription?.customFeatureList
                : subscription.featureList

        return (
            <View style={globalStyles.fullWidth}>
                {isActive && (
                    <BadgeComponent
                        text={translate('native.marketing.your_plan')}
                        backgroundColor={brandColors.accentPrimary}
                        textColor={badgeTextColor}
                        isBigBadge={isHighlightActive}
                    />
                )}
                {'customPlanName' in subscription && index === 0 && (
                    <BadgeComponent
                        text={translate('native.marketing.your_personal_offer')}
                        backgroundColor={brandColors.accentPrimary}
                        textColor={badgeTextColor}
                        isBigBadge={false}
                    />
                )}
                <View
                    style={dynamicStyles.getContainerPlanStyle({
                        currentBorderColor: borderColorActive,
                        currentBackgroundColor: brandColors.backgroundInactive,
                        isHighlighted: isHighlightActive && isActive,
                    })}
                >
                    {isActive && (
                        <TextFirstLine
                            font="f13w600"
                            color={brandColors.statusSuccess}
                            dateText={translate('native.marketing.plan_active')}
                            style={globalStyles.mt4}
                        />
                    )}
                    <TextFirstLine
                        font="f17w600"
                        color={textColor}
                        style={globalStyles.paddingTop4}
                        dateText={
                            'customPlanName' in subscription
                                ? subscription.customPlanName
                                : subscription.planName
                        }
                    />
                    <FeatureListComponent
                        isShowFeatures
                        featureList={featureList}
                        featureColorText={featureColorText}
                        colorCheckFeatures={brandColors.statusSuccess}
                    />
                    {!!onPressPlan && (
                        <BuyButton
                            textAboveButton=""
                            onBuyPress={onPressPlanButton}
                            buttonText={
                                isActive
                                    ? translate('native.subscriptions.manage')
                                    : translate('native.marketing.continue')
                            }
                            customStyleContainer={styles.customButtonContainerStyle}
                            customButtonStyle={[
                                isActive
                                    ? styles.customButtonDisabledStyle
                                    : styles.customButtonActiveStyle,
                                globalStyles.mb0,
                            ]}
                            customButtonTextStyle={{
                                color: isActive
                                    ? brandColors.contentPrimary
                                    : brandColors.backgroundDefault,
                            }}
                            customBottomInset={0}
                        />
                    )}
                </View>
            </View>
        )
    },
)
