import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { AppText, colors, CommonTouchable, layoutHelpers, replacerText } from '@mu-native/ds'
import { type TSubscriptionsTheme } from '@mu-native/dynamic-decor'

import type {
    TProductId,
    TProductInApp,
    TScreenName,
    TSubscription,
} from '../../../types/marketingTypes'

const STRIP_TINT_ALPHA = '25'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strip: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(3),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
    },
    stripText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(11),
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: layoutHelpers.getResponsiveSizeExtended(12),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(14),
    },
    titleBlock: {
        flexShrink: 1,
    },
    subtitle: {
        marginTop: layoutHelpers.getResponsiveSizeExtended(2),
    },
    priceBlock: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
})

type TUgLineupPlanItemProps = {
    subscription: TSubscription | TProductInApp
    isActive: boolean
    onChangeSubscribePlan: (productId: TProductId) => void
    currentScreen: TScreenName
    subscriptionsTheme: TSubscriptionsTheme
}

const UgLineupPlanItem = ({
    subscription,
    isActive,
    onChangeSubscribePlan,
    currentScreen,
    subscriptionsTheme,
}: TUgLineupPlanItemProps) => {
    const {
        borderColorActive,
        activeBackground,
        disabledBackground,
        disabledBorderColor,
        textColor = colors.text900,
        badgeText: badgeTextColor,
        textLine2Color,
    } = subscriptionsTheme[currentScreen] || subscriptionsTheme.PROFILE

    if (!subscription?.ugPlanLineup) return null

    const { productId, ugPlanLineup } = subscription
    const { title, subtitle, badgeText, pricePerMonth, priceSuffix } = ugPlanLineup

    const stripBackgroundColor = isActive
        ? borderColorActive
        : `${borderColorActive}${STRIP_TINT_ALPHA}`
    const stripTextColor = isActive ? badgeTextColor : borderColorActive

    const onChangePlan = () => {
        onChangeSubscribePlan(productId)
    }

    return (
        <CommonTouchable
            activeOpacity={1}
            onPress={onChangePlan}
            style={[
                styles.container,
                {
                    borderColor: isActive ? borderColorActive : disabledBorderColor,
                    backgroundColor: isActive ? activeBackground : disabledBackground,
                },
            ]}
        >
            {!!badgeText && (
                <View style={[styles.strip, { backgroundColor: stripBackgroundColor }]}>
                    <Text style={[styles.stripText, { color: stripTextColor }]}>{badgeText}</Text>
                </View>
            )}
            <View style={styles.content}>
                <View style={styles.titleBlock}>
                    <AppText
                        adaptiveSize
                        numberOfLines={2}
                        font="f17w600"
                        style={{ color: textColor }}
                        rawText={title}
                    />
                    {!!subtitle && (
                        <AppText
                            adaptiveSize
                            font="f15w400"
                            style={[styles.subtitle, { color: textLine2Color }]}
                            rawText={replacerText({ text: subtitle })}
                        />
                    )}
                </View>
                <View style={styles.priceBlock}>
                    <AppText
                        adaptiveSize
                        font="f15w400"
                        style={{ color: textColor }}
                        rawText={pricePerMonth}
                    />
                    <AppText
                        adaptiveSize
                        font="f13w400"
                        style={{ color: textLine2Color }}
                        rawText={` ${priceSuffix}`}
                    />
                </View>
            </View>
        </CommonTouchable>
    )
}

export default memo(UgLineupPlanItem)
