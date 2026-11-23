import { memo } from 'react'
import { View, Text, StyleSheet, TextStyle } from 'react-native'
import Reanimated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { colors, layoutHelpers, replacerText, brandColors, Icon } from '@mu-native/ds'
import { cancelCircle } from '@mu-native/icons/cancelCircle'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { close } from '@mu-native/icons/close'

const { getResponsiveSizeExtended } = layoutHelpers

const featureIconSize = 20
const styles = StyleSheet.create({
    featurePlan: {
        width: '100%',
        alignSelf: 'flex-start',
        marginTop: getResponsiveSizeExtended(10),
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    featureWrapper: { width: '100%', overflow: 'hidden' },
    lineRow: {
        flexDirection: 'row',
        width: '100%',
        maxWidth: '100%',
        marginBottom: platform.isTablet ? 14 : 4,
        paddingLeft: platform.isTablet ? 5 : 0,
        paddingTop: platform.isTablet ? 3 : 0,
        alignItems: 'flex-start',
    },
    backgroundCircle: {
        height: getResponsiveSizeExtended(featureIconSize),
        width: getResponsiveSizeExtended(featureIconSize),
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: platform.isTablet ? 0 : getResponsiveSizeExtended(4),
    },
    lineText: {
        fontWeight: '400',
        fontSize: getResponsiveSizeExtended(14),
        lineHeight: 20,
        paddingRight: 14,
        alignSelf: 'center',
        marginLeft: getResponsiveSizeExtended(8),
        color: colors.white,
    },
    lineIcon: {
        height: getResponsiveSizeExtended(featureIconSize),
        width: getResponsiveSizeExtended(featureIconSize),
        tintColor: colors.green500,
    },
})

const dynamicStyles = {
    lineTextWithColor: (featureColorText = ''): TextStyle => ({
        ...styles.lineText,
        ...(featureColorText ? { color: featureColorText } : undefined),
    }),
}

type FeatureListProps = {
    isShowFeatures: boolean
    featureList: { title: string; isDisabled: boolean }[]
    featureColorText?: string
    colorCheckFeatures?: string
    redIconFeature?: boolean
}

export const FeatureListComponent = memo(
    ({
        isShowFeatures,
        featureList,
        featureColorText = '',
        colorCheckFeatures = '',
        redIconFeature = false,
    }: FeatureListProps) => {
        if (!isShowFeatures || !featureList?.length) return null

        return (
            <Reanimated.View entering={FadeIn} exiting={FadeOut} style={styles.featureWrapper}>
                <View style={styles.featurePlan}>
                    {featureList.map(({ title, isDisabled }) => (
                        <View style={styles.lineRow} key={title}>
                            {!redIconFeature && (
                                <Icon
                                    tint={isDisabled ? colors.gray500 : colorCheckFeatures}
                                    source={isDisabled ? cancelCircle : checkmarkCircle}
                                    size={layoutHelpers.getResponsiveSizeExtended(featureIconSize)}
                                />
                            )}
                            {redIconFeature && (
                                <Icon
                                    source={close}
                                    tint={brandColors.statusError}
                                    size={layoutHelpers.getResponsiveSizeExtended(featureIconSize)}
                                />
                            )}
                            <Text
                                style={dynamicStyles.lineTextWithColor(
                                    isDisabled ? colors.gray500 : featureColorText,
                                )}
                            >
                                {replacerText({ text: title })}
                            </Text>
                        </View>
                    ))}
                </View>
            </Reanimated.View>
        )
    },
)
