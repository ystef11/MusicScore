import { memo } from 'react'
import { Text, TextProps, TextStyle } from 'react-native'

import { colors } from '../../constants/colors'
import { brandColors, BrandThemeColorKey } from '../../constants/new/brandColors'
import { brandFontsStyles, BrandsThemeFontKey } from '../../constants/new/fonts'
import { layoutHelpers } from '../../helpers/layout'

type TBaseProps = {
    brandColor?: BrandThemeColorKey
    oldColor?: keyof typeof colors
    rawColor?: string
    font?: BrandsThemeFontKey
    adaptiveSize?: boolean
    textAlign?: TextStyle['textAlign']
    textTransform?: TextStyle['textTransform']
    decorationLine?: TextStyle['textDecorationLine']
    lineHeight?: number
    // Native Text props actually used at call sites, typed identically to
    // react-native's TextProps. Kept explicit (instead of `& TextProps`) so the
    // public API / Storybook autodocs surface only what AppText really supports.
    children?: TextProps['children']
    style?: TextProps['style']
    numberOfLines?: TextProps['numberOfLines']
    ellipsizeMode?: TextProps['ellipsizeMode']
    testID?: TextProps['testID']
    nativeID?: TextProps['nativeID']
    onPress?: TextProps['onPress']
    onTextLayout?: TextProps['onTextLayout']
    minimumFontScale?: TextProps['minimumFontScale']
    adjustsFontSizeToFit?: TextProps['adjustsFontSizeToFit']
}

type TRawProps = {
    readonly rawText?: string | number
    readonly pointerEvents?: 'none'
} & TBaseProps

type TProps = TRawProps

export const AppText = memo(
    ({
        font,
        brandColor,
        oldColor,
        rawColor,
        textAlign,
        textTransform,
        adaptiveSize,
        children,
        lineHeight,
        decorationLine,
        style,
        rawText = '',
        numberOfLines,
        ellipsizeMode,
        testID,
        nativeID,
        onPress,
        onTextLayout,
        minimumFontScale,
        adjustsFontSizeToFit,
        pointerEvents,
    }: TProps) => {
        let color: string | undefined
        if (brandColor) color = brandColors[brandColor]
        if (oldColor) color = colors[oldColor]
        if (rawColor) color = rawColor
        if (!color) color = brandColors.contentPrimary
        const baseStyle: TextStyle = {
            color,
            textAlign,
            textTransform,
            ...(lineHeight && { lineHeight: layoutHelpers.getResponsiveSizeExtended(lineHeight) }),
            textDecorationLine: decorationLine,
            ...(font && {
                fontFamily: brandFontsStyles[font].fontFamily,
                fontSize: adaptiveSize
                    ? layoutHelpers.getResponsiveSizeExtended(brandFontsStyles[font].fontSize ?? 10)
                    : brandFontsStyles[font].fontSize,
            }),
        }
        return (
            <Text
                numberOfLines={numberOfLines}
                ellipsizeMode={ellipsizeMode}
                testID={testID}
                nativeID={nativeID}
                onPress={onPress}
                onTextLayout={onTextLayout}
                minimumFontScale={minimumFontScale}
                adjustsFontSizeToFit={adjustsFontSizeToFit}
                pointerEvents={pointerEvents}
                style={[baseStyle, style]}
            >
                {rawText}
                {children}
            </Text>
        )
    },
)
