import { memo, useState } from 'react'
import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native'

import { attention } from '@mu-native/icons/attention'

import Icon from '../../components/Icon/Icon'
import { layout } from '../../constants/layout.ts'
import { brandColors } from '../../constants/new/brandColors.ts'
import { brandFontsStyles } from '../../constants/new/fonts.ts'
import { OPACITY_DISABLED } from '../../constants/new/opacity.ts'

type Props = {
    error?: boolean
    disabled?: boolean
    style?: StyleProp<ViewStyle>
    inputStyle?: StyleProp<TextStyle>
    value?: string
    placeholder?: string
    multiline?: boolean
    numberOfLines?: number
    maxLength?: number
    testID?: string
    onChangeText?: TextInputProps['onChangeText']
    onFocus?: TextInputProps['onFocus']
    textAlignVertical?: TextInputProps['textAlignVertical']
}

export const FormTextInput = memo(
    ({
        error = false,
        disabled,
        style,
        inputStyle,
        value,
        placeholder,
        multiline,
        numberOfLines,
        maxLength,
        testID,
        onChangeText,
        onFocus,
        textAlignVertical,
    }: Props) => {
        const [isFocused, setIsFocused] = useState(false)

        return (
            <View
                style={[
                    styles.container,
                    isFocused && styles.containerFocused,
                    error && styles.containerError,
                    disabled && styles.containerDisabled,
                    style,
                ]}
            >
                <TextInput
                    editable={!disabled}
                    placeholderTextColor={brandColors.contentInactive}
                    value={value}
                    placeholder={placeholder}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    testID={testID}
                    textAlignVertical={textAlignVertical}
                    onChangeText={onChangeText}
                    style={[styles.input, error && styles.inputWithIcon, inputStyle]}
                    onFocus={e => {
                        setIsFocused(true)
                        onFocus?.(e)
                    }}
                    onBlur={() => {
                        setIsFocused(false)
                    }}
                />
                {error && (
                    <Icon
                        source={attention}
                        size={16}
                        tint={brandColors.statusError}
                        style={styles.errorIcon}
                    />
                )}
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: brandColors.formDefault,
        borderRadius: 1,
        backgroundColor: brandColors.backgroundDefault,
        flexDirection: 'row',
        alignItems: 'center',
    },
    containerFocused: {
        borderColor: brandColors.formActive,
    },
    containerError: {
        borderColor: brandColors.statusError,
    },
    containerDisabled: {
        opacity: OPACITY_DISABLED,
    },
    input: {
        flex: 1,
        padding: layout.marginXm,
        color: brandColors.contentPrimary,
        ...brandFontsStyles.f15w400,
    },
    inputWithIcon: {
        paddingRight: 0,
    },
    errorIcon: {
        marginRight: layout.marginXm,
    },
})
