import { memo } from 'react'
import { ImageSourcePropType, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import { brandColors, colors, Icon, layout, layoutHelpers, replacerText } from '@mu-native/ds'
import { cancelCircle } from '@mu-native/icons/cancelCircle'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    benefitsContainer: {
        width: '100%',
        flexDirection: 'column',
    },
    benefitsItemWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    textBenefit: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        fontWeight: '400',
        color: colors.text900,
        alignSelf: 'center',
        marginLeft: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
        maxWidth: '90%',
    },
})

const iconSize = layoutHelpers.getResponsiveSizeExtended(24)

const getDefaultBenefits = () => [
    translate('native.marketing.benefits.official_scores'),
    translate('native.marketing.benefits.download_print_community'),
    translate('native.marketing.advanced_tools'),
    translate('native.marketing.benefits.one_subscription_all_devices'),
    translate('native.marketing.benefits.offline_access'),
]

const getMainContainerStyle = (marginBottom: number) => [
    styles.benefitsContainer,
    { marginBottom: layoutHelpers.getResponsiveSizeExtended(marginBottom) },
]

type BenefitsProps = {
    iconCheckSource?: ImageSourcePropType
    subscriptionBenefits?: string[]
    marginBottom?: number
    style?: StyleProp<ViewStyle>
    textColor?: string
    indexCustomIcon?: number
    customStyle?: StyleProp<ViewStyle>
}

const BenefitsComponent = ({
    iconCheckSource,
    subscriptionBenefits = getDefaultBenefits(),
    marginBottom = 40,
    style,
    textColor = colors.text900,
    indexCustomIcon = 0,
    customStyle,
}: BenefitsProps) => (
    <View style={[getMainContainerStyle(marginBottom), style]}>
        {subscriptionBenefits.map((text, index) => (
            <View
                style={[styles.benefitsItemWrapper, customStyle]}
                key={`id - ${index.toString()}`}
            >
                <Icon
                    source={
                        !!indexCustomIcon && indexCustomIcon === index
                            ? cancelCircle
                            : checkmarkCircle
                    }
                    tint={
                        !!indexCustomIcon && indexCustomIcon === index
                            ? brandColors.statusError
                            : brandColors.statusSuccess
                    }
                    size={iconSize}
                />
                <Text style={[styles.textBenefit, { color: textColor }]}>
                    {replacerText({ text })}
                </Text>
            </View>
        ))}
    </View>
)

export default memo(BenefitsComponent)
