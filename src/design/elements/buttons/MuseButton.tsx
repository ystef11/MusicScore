import React, { memo, useState } from 'react'
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common/constants/platform'

import { AppText } from '../../components/AppText/AppText'
import Icon, { IconSource } from '../../components/Icon/Icon'
import { brandColors, BrandThemeColorKey } from '../../constants/new/brandColors.ts'
import { BrandsThemeFontKey } from '../../constants/new/fonts.ts'
import { OPACITY_DISABLED, OPACITY_PRESSED } from '../../constants/new/opacity.ts'
import { BrandAppLoader } from '../BrandAppLoader/BrandAppLoader'
import { CommonTouchable } from '../CommonTouchable.tsx'

function hexToRgba(hex: string, alpha = 1) {
    if (hex === 'transparent') return hex
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) {
        hex = hex
            .split('')
            .map(ch => ch + ch)
            .join('')
    }

    const bigint = parseInt(hex, 16)
    // eslint-disable-next-line no-bitwise
    const r = (bigint >> 16) & 255
    // eslint-disable-next-line no-bitwise
    const g = (bigint >> 8) & 255
    // eslint-disable-next-line no-bitwise
    const b = bigint & 255

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Available button visual variants
 * - `primary`: Brand colored button with light text
 * - `secondary`: Light button with dark text
 * - `secondaryMultilayer`: Multilayer variant of secondary button
 * - `tertiary`: Transparent button with underlined text
 */
export type MuseButtonType =
    | 'primary'
    | 'secondary'
    | 'secondaryMultilayer'
    | 'tertiaryDefault'
    | 'tertiaryUnderlined'

/**
 * Available button sizes
 * - `large`: 44px height with 20px icons
 * - `small`: 36px height with 16px icons
 */
export type MuseButtonSize = 'large' | 'small' | 'tablet'

/**
 * Props for the MuseButton component
 *
 * @example
 * ```tsx
 * // Primary button with icon
 * <MuseButton
 *   title="Save"
 *   startIcon={checkmark}
 *   onPress={() => console.log('Saved')}
 * />
 *
 * // Secondary loading button
 * <MuseButton
 *   type="secondary"
 *   title="Loading..."
 *   isLoading={true}
 * />
 *
 * // Small tertiary button
 * <MuseButton
 *   type="tertiary"
 *   size="small"
 *   title="Cancel"
 *   onPress={handleCancel}
 * />
 * ```
 */
export interface MuseButtonProps {
    /** Test identifier for automated testing */
    testID?: string

    /** Button label text. If not provided, button will be icon-only */
    title?: string

    /** Callback fired when button is pressed */
    onPress?: () => void

    /** Callback fired when button is long pressed */
    onLongPress?: () => void

    /** Additional styles to apply to the button container */
    style?: StyleProp<ViewStyle>

    /** If true, button is disabled and cannot be interacted with */
    disabled?: boolean

    /** If true, shows loading spinner and disables interaction */
    isLoading?: boolean

    /** If true, enables haptic feedback on press */
    haptic?: boolean

    /** Icon to display before the title */
    startIcon?: IconSource

    /** Custom tint color for the start icon */
    startIconTint?: BrandThemeColorKey

    /** Visual variant of the button. Defaults to 'primary' */
    type?: MuseButtonType

    /** Size of the button. Defaults to 'large' */
    size?: MuseButtonSize

    /**
     * Custom color for the button text.
     * If not provided, the default color will be based on the button type.
     */
    titleColor?: BrandThemeColorKey

    /** Case transform for the title; use instead of changing the case of translated text */
    titleTransform?: TextStyle['textTransform']

    /** If false, disables adaptive font scaling for the title. Defaults to true */
    adaptiveTextSize?: boolean
}

const Sizes: Record<MuseButtonSize, number> = {
    tablet: 54,
    large: 44,
    small: 36,
}
const Radius: Record<MuseButtonSize, number> = {
    large: 100,
    small: 100,
    tablet: 100,
}
const IconSize: Record<MuseButtonSize, number> = {
    large: 20,
    small: 16,
    tablet: 24,
}
const TitleFont: Record<MuseButtonSize, BrandsThemeFontKey> = {
    large: 'f15w500',
    small: 'f14w500',
    tablet: 'f18w500',
}

const Color: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'exceptionConstantLight',
    secondary: 'exceptionInverseLight',
    secondaryMultilayer: 'exceptionInverseLight',
    tertiaryUnderlined: 'actionsControlDefault',
    tertiaryDefault: 'actionsControlDefault',
}

const PressedColor: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'exceptionConstantLight',
    secondary: 'exceptionInverseLight',
    secondaryMultilayer: 'exceptionInverseLight',
    tertiaryUnderlined: 'actionsControlDefault',
    tertiaryDefault: 'actionsControlDefault',
}

const DisabledColor: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'exceptionConstantLight',
    secondary: 'contentInactive',
    secondaryMultilayer: 'contentInactive',
    tertiaryUnderlined: 'contentInactive',
    tertiaryDefault: 'contentInactive',
}

const BackgroundColor: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'accentPrimary',
    secondary: 'actionSecondary',
    secondaryMultilayer: 'exceptionMultilayer',
    tertiaryUnderlined: 'transparent',
    tertiaryDefault: 'transparent',
}

const BackgroundPressedColor: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'accentPrimary',
    secondary: 'actionSecondary',
    secondaryMultilayer: 'actionSecondary',
    tertiaryUnderlined: 'transparent',
    tertiaryDefault: 'transparent',
}

const BackgroundDisabledColor: Record<MuseButtonType, BrandThemeColorKey> = {
    primary: 'accentPrimary',
    secondary: 'actionSecondary',
    secondaryMultilayer: 'actionSecondary',
    tertiaryUnderlined: 'transparent',
    tertiaryDefault: 'transparent',
}

type IconProps = Pick<
    MuseButtonProps,
    'startIcon' | 'startIconTint' | 'type' | 'isLoading' | 'disabled' | 'size'
> & { pressed: boolean }
const ButtonIcon: React.FC<IconProps> = props => {
    if (props.isLoading) return null
    const type = props.type ?? 'primary'
    const size = props.size ?? (platform.isTablet ? 'tablet' : 'large')
    let iconColor = brandColors[Color[type]]
    if (props.disabled) {
        iconColor = hexToRgba(brandColors[DisabledColor[type]], OPACITY_DISABLED)
    } else if (props.pressed) {
        iconColor = hexToRgba(brandColors[PressedColor[type]], OPACITY_PRESSED)
    }
    if (props.startIconTint) {
        iconColor = brandColors[props.startIconTint]
    }
    const icon = props.startIcon
    if (!icon) return null
    return <Icon source={icon} size={IconSize[size]} tint={iconColor} />
}

type LoadingProps = Pick<MuseButtonProps, 'type' | 'isLoading'>
const Loading: React.FC<LoadingProps> = props => {
    if (!props.isLoading) return null
    return <BrandAppLoader size="s" color={brandColors[Color[props.type ?? 'primary']]} />
}

type TextProps = Pick<
    MuseButtonProps,
    'type' | 'title' | 'size' | 'disabled' | 'titleColor' | 'titleTransform' | 'adaptiveTextSize'
> & {
    pressed: boolean
}
const Text: React.FC<TextProps> = props => {
    if (!props.title) return null
    const type = props.type ?? 'primary'
    const size = props.size ?? (platform.isTablet ? 'tablet' : 'large')
    let titleColor = brandColors[Color[type]]
    if (props.disabled) {
        titleColor = brandColors[DisabledColor[type]]
    } else if (props.pressed) {
        titleColor = hexToRgba(brandColors[PressedColor[type]], 0.6)
    }
    if (props.titleColor) {
        titleColor = brandColors[props.titleColor]
    }
    const fontFamily = TitleFont[size]

    return (
        <AppText
            font={fontFamily}
            rawText={props.title}
            rawColor={titleColor}
            numberOfLines={1}
            ellipsizeMode="tail"
            adaptiveSize={props.adaptiveTextSize ?? true}
            textTransform={props.titleTransform}
            decorationLine={type === 'tertiaryUnderlined' ? 'underline' : undefined}
        />
    )
}

/**
 * MuseButton - A versatile button component with multiple visual variants and states
 *
 * @description
 * MuseButton is a customizable button component that supports:
 * - Four visual variants (primary, secondary, secondaryMultilayer, tertiary)
 * - Two sizes (large, small)
 * - Loading state with spinner
 * - Disabled state
 * - Optional icon display
 * - Haptic feedback
 * - Press state animations
 *
 * @remarks
 * The button automatically handles press states with visual feedback (60% opacity).
 * When loading or disabled, the button prevents interaction.
 * Tertiary buttons display underlined text.
 * Icon-only buttons (no title) are automatically sized to square dimensions.
 *
 * @example
 * ```tsx
 * // Basic primary button
 * <MuseButton title="Continue" onPress={handleContinue} />
 *
 * // Secondary button with icon
 * <MuseButton
 *   type="secondary"
 *   title="Delete"
 *   startIcon={trashBin}
 *   onPress={handleDelete}
 * />
 *
 * // Small icon-only button
 * <MuseButton
 *   size="small"
 *   startIcon={settings}
 *   onPress={handleSettings}
 * />
 *
 * // Disabled button
 * <MuseButton
 *   title="Submit"
 *   disabled={!isValid}
 *   onPress={handleSubmit}
 * />
 * ```
 */
export const MuseButton: React.FC<MuseButtonProps> = memo(props => {
    const [pressed, setPressed] = useState(false)
    const type = props.type ?? 'primary'
    const size = props.size ?? (platform.isTablet ? 'tablet' : 'large')
    let backgroundColor = brandColors[BackgroundColor[type]]
    if (props.disabled) {
        backgroundColor = brandColors[BackgroundDisabledColor[type]]
        backgroundColor = hexToRgba(backgroundColor, 0.4)
    }
    if (!props.disabled && pressed) {
        backgroundColor = brandColors[BackgroundPressedColor[type]]
        backgroundColor = hexToRgba(backgroundColor, 0.6)
    }

    const onPress = () => {
        if (props.isLoading || props.disabled === true) return
        props.onPress?.()
    }

    return (
        <CommonTouchable
            testID={props.testID}
            isHapticEnabled={props.haptic}
            activeOpacity={1}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={onPress}
            onLongPress={props.onLongPress}
            style={[
                styles.container,
                {
                    backgroundColor,
                    borderRadius: Radius[size],
                    height: Sizes[size],
                    minWidth: Sizes[size],
                    paddingHorizontal: props.title ? 16 : 0,
                },
                props.style,
            ]}
        >
            <ButtonIcon {...props} pressed={pressed} />
            <Loading {...props} />
            <Text {...props} pressed={pressed} />
        </CommonTouchable>
    )
})
MuseButton.displayName = 'MuseButton'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        columnGap: 4,
        overflow: 'hidden',
    },
})
