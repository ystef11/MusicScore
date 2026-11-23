import { memo } from 'react'
import { Image, ImageStyle, StyleSheet, Text, View } from 'react-native'

import { platform } from '@mu-native/common'
import { brandColors, CommonTouchable, layout, layoutHelpers, BrandAppLoader } from '@mu-native/ds'

import {
    COLOR_ACTIVE,
    COLOR_BLACK,
    COLOR_BORDER_LIGHT,
    COLOR_DISABLE,
    COLOR_GREY_900,
    COLOR_LINK,
    COLOR_PRACTICE_MODE,
    COLOR_WHITE,
    FULL_WIDTH_PERCENT,
    MARGIN_MD,
    MARGIN_XM,
} from '../constants/styles'
import { isAndroid, isSmallScreenIos } from '../Utils/Platform'

const colorSchemes = {
    active: {
        color: COLOR_WHITE,
    },
    disable: {
        backgroundColor: COLOR_DISABLE,
        color: brandColors.contentInactive,
    },
    fb: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_GREY_900,
        borderColor: 'black',
    },
    apple: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_GREY_900,
        borderColor: 'black',
    },
    google: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_GREY_900,
        borderColor: 'black',
    },
    email: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_GREY_900,
        borderColor: 'black',
    },
    common: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_BLACK,
        borderColor: COLOR_WHITE,
    },
    commonLink: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_LINK,
        borderColor: COLOR_WHITE,
    },
    commonWithBorder: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_LINK,
        borderColor: COLOR_BORDER_LIGHT,
    },
    practiceMode: {
        backgroundColor: COLOR_WHITE,
        color: COLOR_PRACTICE_MODE,
        borderColor: COLOR_WHITE,
    },
    flatWhite: {
        backgroundColor: 'transparent',
        color: COLOR_WHITE,
        borderColor: 'transparent',
    },
}

type gradientXY = {
    x: number
    y: number
}
type Props = {
    text: string
    capitalize?: boolean
    scheme?:
        | 'active'
        | 'email'
        | 'apple'
        | 'google'
        | 'fb'
        | 'common'
        | 'commonLink'
        | 'disable'
        | 'commonWithBorder'
        | 'practiceMode'
    onPress: (...args: Array<any>) => any
    isLoading?: boolean
    compact?: boolean
    padding20?: boolean
    iconSource?: any
    style?: any
    textStyle?: any
    numberOfLines?: number
    disabled?: boolean
    height?: number
    testID?: string
}

const leftPaddingStyles = {
    paddingLeft: 14,
}

const Button = ({
    onPress,
    capitalize,
    text,
    scheme = 'active',
    iconSource = null,
    isLoading = false,
    compact = false,
    padding20,
    style = {},
    textStyle,
    testID,
    numberOfLines,
    disabled,
    height,
}: Props) => {
    const isAuthButton = ['fb', 'apple', 'google', 'email'].includes(scheme)
    const { color, ...schemeButtonStyles } = colorSchemes[scheme]
    const compactButtonStyles = {
        width: null,
    }
    const stylesPadding = padding20 ? styles.container2 : styles.container
    const iconStyle = isAuthButton
        ? {
              position: 'absolute',
              left: MARGIN_XM,
          }
        : styles.icon
    const titleStyle = isAuthButton ? styles.authTitle : styles.title
    const textTransform = capitalize ? 'uppercase' : undefined

    return (
        <CommonTouchable
            testID={testID}
            disabled={disabled}
            onPress={onPress}
            style={stylesPadding}
        >
            <View
                style={[
                    styles.button,
                    isAuthButton ? styles.authButton : null,
                    compact ? compactButtonStyles : null,
                    iconSource && !isAuthButton ? leftPaddingStyles : null,
                    schemeButtonStyles,
                    style,
                    scheme === 'disable' && styles.disableBg,
                    Boolean(height) && { height },
                ]}
            >
                {iconSource && <Image source={iconSource} style={iconStyle as ImageStyle} />}
                {isLoading ? (
                    <BrandAppLoader size="s" color={color} />
                ) : (
                    <Text
                        style={[
                            titleStyle,
                            {
                                color,
                                textTransform,
                            },
                            textStyle,
                        ]}
                        numberOfLines={numberOfLines}
                    >
                        {text}
                    </Text>
                )}
            </View>
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(MARGIN_XM),
        paddingHorizontal: MARGIN_MD,
        maxWidth: layout.maxTabletWidth,
        borderRadius: 8,
        borderWidth: 0,
        backgroundColor: COLOR_ACTIVE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    container2: {
        width: FULL_WIDTH_PERCENT,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    title: {
        fontWeight: '500',
        textAlign: 'center',
        fontSize: platform.isTablet ? 16 : 14,
        lineHeight: layoutHelpers.getResponsiveSizeExtended(20),
    },
    authButton: {
        paddingVertical: 0,
        borderWidth: StyleSheet.hairlineWidth,
        height: 48,
    },
    authTitle: {
        fontSize: isSmallScreenIos() ? 17 : 19,
        lineHeight: 24,
        fontWeight: isAndroid ? 'normal' : '300',
        top: 1,
    },
    icon: {
        marginRight: MARGIN_MD,
        tintColor: COLOR_LINK,
    },
    container: {
        width: FULL_WIDTH_PERCENT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disableBg: { backgroundColor: brandColors.colorBackgroundDisabled },
})

export default memo(Button)
