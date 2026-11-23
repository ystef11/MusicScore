import { PropsWithChildren } from 'react'
import { ImageSourcePropType, ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native'

export type TButtonProps = {
    loading?: boolean
    text?: string
    icon?: ImageSourcePropType
    disabled?: boolean
    inactive?: boolean
    isHapticEnabled?: boolean
    onPress?: () => void
    onLongPress?: () => void
    size?: 'small' | 'medium' | 'large'
    style?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
    iconStyle?: StyleProp<ImageStyle>
    pressedStyle?: StyleProp<ViewStyle>
}

export type TInternalButtonProps = Omit<TButtonProps, 'style'> & {
    stateStyles?: {
        default?: {
            container?: StyleProp<ViewStyle>
            icon?: StyleProp<ImageStyle>
            text?: StyleProp<TextStyle>
        }
        pressed?: {
            container?: StyleProp<ViewStyle>
            icon?: StyleProp<ImageStyle>
            text?: StyleProp<TextStyle>
        }
        inactive?: {
            container?: StyleProp<ViewStyle>
            icon?: StyleProp<ImageStyle>
            text?: StyleProp<TextStyle>
        }
    }
}

export type TCircleButtonTheme =
    | 'default'
    | 'selected'
    | 'contrast'
    | 'tinted'
    | 'blackWithOpacity'
    | 'highlight'
    | 'highlightSelected'
    | 'outline'
    | 'newBranded'
    | 'actionSecondary'

export type TCircleButtonProps = {
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    selected?: boolean
    progress?: number | null
    testID?: string
    addShadow?: boolean
    style?: StyleProp<ViewStyle>
    theme?: TCircleButtonTheme
    onPress?: () => void
    children?: PropsWithChildren['children']
}
