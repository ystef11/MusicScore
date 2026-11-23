import React from 'react'
import { Image, StyleProp, StyleSheet, TextInputProps, View, ViewStyle } from 'react-native'

import { colors } from '../constants/colors'
import { CommonTouchable } from '../elements/CommonTouchable'

import { Input } from './Input/Input'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderWidth: 1,
        borderRadius: 4,
        borderColor: colors.transparent,
    },
    iconContainer: {
        marginRight: 12,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'cover',
    },
})
type Props = {
    source?: { uri: string }
    error?: boolean
    borderColor?: string
    onIconPress?: () => void
    backgroundInputColor?: string
    inputRef?: any
    onFocus?: () => void
    onBlur?: () => void
    onSubmitEditing?: () => void
    testID?: string
    borderFocused?: string
} & Pick<
    TextInputProps,
    'placeholder' | 'value' | 'onChangeText' | 'keyboardType' | 'returnKeyType' | 'secureTextEntry'
>

const IconComponent = ({ source, onIconPress }: Pick<Props, 'onIconPress' | 'source'>) => (
    <CommonTouchable onPress={onIconPress} style={styles.iconContainer}>
        <Image source={source!} style={styles.icon} resizeMode="contain" />
    </CommonTouchable>
)

const resetStyle: ViewStyle = {
    borderColor: colors.transparent,
}
const errorStyle: ViewStyle = {
    borderColor: colors.error,
}

export const InputWithIcon = ({
    onBlur,
    onFocus,
    error,
    borderColor,
    borderFocused = colors.blue600,
    backgroundInputColor,
    onIconPress,
    source,
    ...props
}: Props) => {
    const [focused, setFocused] = React.useState(false)

    const onBlurAction = () => {
        setFocused(false)
        onBlur?.()
    }

    const onFocusAction = () => {
        setFocused(true)
        onFocus?.()
    }

    const containerStyles: StyleProp<ViewStyle>[] = [styles.container]
    if (error) {
        containerStyles.push(errorStyle)
    } else if (borderColor) {
        containerStyles.push({ borderColor })
    }

    if (backgroundInputColor) {
        containerStyles.push({ backgroundColor: backgroundInputColor })
    }
    if (!error && focused) {
        containerStyles.push({ borderColor: borderFocused })
    }

    return (
        <View style={containerStyles}>
            <Input
                {...props}
                onBlur={onBlurAction}
                onFocus={onFocusAction}
                style={resetStyle}
                onSubmitEditing={props.onSubmitEditing}
            />
            {!!source && <IconComponent source={source} onIconPress={onIconPress} />}
        </View>
    )
}
