import React, { memo, useState } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { AppText } from '../../components/AppText/AppText'
import Icon, { IconSource } from '../../components/Icon/Icon'
import { brandColors } from '../../constants/new/brandColors.ts'
import { BrandsThemeFontKey } from '../../constants/new/fonts.ts'
import {
    OPACITY_DISABLED,
    OPACITY_PRESSED,
    OPACITY_PROCESSING,
} from '../../constants/new/opacity.ts'
import { BrandAppLoader } from '../BrandAppLoader/BrandAppLoader'
import { CommonTouchable } from '../CommonTouchable.tsx'

export type FloatButtonSize = 'large' | 'small'

export interface FloatButtonProps {
    testID?: string
    title?: string
    onPress?: () => void
    onLongPress?: () => void
    style?: StyleProp<ViewStyle>
    disabled?: boolean
    isLoading?: boolean
    haptic?: boolean
    endIcon?: IconSource
    size?: FloatButtonSize
}

const Heights: Record<FloatButtonSize, number> = {
    large: 48,
    small: 44,
}

const IconSizes: Record<FloatButtonSize, number> = {
    large: 20,
    small: 16,
}

const TitleFont: Record<FloatButtonSize, BrandsThemeFontKey> = {
    large: 'f15w600',
    small: 'f14w500',
}

const CONTENT_COLOR = brandColors.exceptionConstantLight
const EXPAND_DURATION = 300
const titleFadeIn = FadeIn.duration(EXPAND_DURATION)

function getOpacity(pressed: boolean, disabled?: boolean, isLoading?: boolean): number {
    if (disabled) return OPACITY_DISABLED
    if (isLoading) return OPACITY_PROCESSING
    if (pressed) return OPACITY_PRESSED
    return 1
}

export const FloatButton: React.FC<FloatButtonProps> = memo(props => {
    const [pressed, setPressed] = useState(false)
    const size = props.size ?? 'large'
    const height = Heights[size]
    const iconSize = IconSizes[size]
    const iconPadding = (height - iconSize) / 2
    const opacity = getOpacity(pressed, props.disabled, props.isLoading)
    const { title } = props

    const onPress = () => {
        if (props.isLoading || props.disabled) return
        props.onPress?.()
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    height,
                    minWidth: height,
                    borderRadius: height / 2,
                    opacity,
                },
                props.style,
            ]}
        >
            <CommonTouchable
                testID={props.testID}
                isHapticEnabled={props.haptic}
                activeOpacity={1}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
                onPress={onPress}
                onLongPress={props.onLongPress}
                style={[
                    styles.touchable,
                    {
                        paddingStart: iconPadding,
                        paddingEnd: iconPadding,
                    },
                ]}
            >
                {!!title && (
                    <Animated.View entering={titleFadeIn} style={styles.titleWrapper}>
                        <AppText
                            font={TitleFont[size]}
                            rawText={title}
                            rawColor={CONTENT_COLOR}
                            numberOfLines={1}
                            ellipsizeMode="clip"
                        />
                    </Animated.View>
                )}
                {props.isLoading && <BrandAppLoader size="s" color={CONTENT_COLOR} />}
                {!props.isLoading && props.endIcon && (
                    <Icon source={props.endIcon} size={iconSize} tint={CONTENT_COLOR} />
                )}
            </CommonTouchable>
        </Animated.View>
    )
})
FloatButton.displayName = 'FloatButton'

const styles = StyleSheet.create({
    container: {
        backgroundColor: brandColors.colorActionFloatDefault,
        overflow: 'hidden',
    },
    touchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleWrapper: {
        paddingRight: 8,
    },
})
