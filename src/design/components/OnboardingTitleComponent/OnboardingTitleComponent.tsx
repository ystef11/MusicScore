import { memo } from 'react'
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common/constants/platform'

import { colors } from '../../constants/colors'
import { design } from '../../constants/design'
import { layout } from '../../constants/layout'
import { brandColors } from '../../constants/new/brandColors.ts'
import { layoutHelpers } from '../../helpers/layout'
import { AppText } from '../AppText/AppText'

const styles = StyleSheet.create({
    textContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        zIndex: 10,
        alignSelf: 'center',
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
    },
    titleContainer: {
        borderColor: brandColors.contentPrimary,
    },
    textTitle: {
        maxWidth: platform.isTablet ? 500 : '100%',
    },
    textSubtitle: {
        color: colors.text900,
        fontFamily: design.fontFamilyMuseSansRegular,
        marginVertical: layoutHelpers.getResponsiveSizeExtended(12),
        maxWidth: platform.isTablet ? 500 : '100%',
    },
    subTitleBorder: {
        borderBottomWidth: 1,
        borderColor: colors.text900,
    },
})

type TourUpdateTitleProps = {
    title: string
    subTitle?: string
    color?: string
    contentStyle?: StyleProp<ViewStyle>
    titleStyle?: StyleProp<TextStyle>
    subTitleStyle?: StyleProp<TextStyle>
    isSubTitleBorder?: boolean
    borderWidth?: number
    paddingVerticalTitle?: number
    titleContainerStyle?: StyleProp<ViewStyle>
}
export const OnboardingTitleComponent = memo(
    ({
        title,
        subTitle,
        color = brandColors.contentPrimary,
        contentStyle,
        titleStyle,
        subTitleStyle,
        isSubTitleBorder,
        borderWidth = 0.5,
        paddingVerticalTitle = 12,
        titleContainerStyle,
    }: TourUpdateTitleProps) => (
        <View style={[styles.textContainer, contentStyle]}>
            <View
                style={[
                    styles.titleContainer,
                    {
                        borderColor: color,
                        borderBottomWidth: borderWidth,
                        borderTopWidth: borderWidth,
                        paddingVertical: paddingVerticalTitle,
                    },
                    titleContainerStyle,
                ]}
            >
                <AppText
                    font="f56w400Accent"
                    rawText={title}
                    brandColor="contentPrimary"
                    style={[styles.textTitle, titleStyle, { color }]}
                />
            </View>
            {!!subTitle && (
                <AppText
                    font="f16w400"
                    rawText={subTitle}
                    adaptiveSize
                    brandColor="contentPrimary"
                    style={[styles.textSubtitle, { color }, subTitleStyle]}
                />
            )}
            {!!isSubTitleBorder && <View style={[styles.subTitleBorder, { borderColor: color }]} />}
        </View>
    ),
)
