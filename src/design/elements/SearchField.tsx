import { forwardRef, type ReactNode, useState } from 'react'
import {
    StyleProp,
    StyleSheet,
    TextInput,
    type TextInputInstance,
    TextInputProps,
    View,
    ViewStyle,
} from 'react-native'

import { cancelCircle } from '@mu-native/icons/cancelCircle'
import { search } from '@mu-native/icons/search'

import Icon from '../components/Icon/Icon'
import { brandColors } from '../constants/new/brandColors.ts'
import { brandFontsStyles } from '../constants/new/fonts.ts'

import { BrandAppLoader } from './BrandAppLoader/BrandAppLoader'
import { CommonTouchable } from './CommonTouchable.tsx'

export type SearchFieldProps = {
    onClear?: () => void
    /**
     * Rendered at the trailing edge. The clear button takes its place while the
     * field is focused with a value (without a trailing button, the clear button
     * shows for any non-empty value, focused or not).
     */
    trailingButton?: ReactNode
    isLoading?: boolean
    style?: StyleProp<ViewStyle>
    value?: string
    placeholder?: string
    autoFocus?: boolean
    testID?: string
    returnKeyType?: TextInputProps['returnKeyType']
    onChangeText?: TextInputProps['onChangeText']
    onFocus?: TextInputProps['onFocus']
    onBlur?: TextInputProps['onBlur']
    onSubmitEditing?: TextInputProps['onSubmitEditing']
    onEndEditing?: TextInputProps['onEndEditing']
}

export const SearchField = forwardRef<TextInputInstance, SearchFieldProps>((props, ref) => {
    const {
        onClear,
        trailingButton,
        isLoading,
        style,
        value,
        placeholder,
        autoFocus,
        testID,
        onChangeText,
        onFocus,
        onBlur,
        onSubmitEditing,
        onEndEditing,
        returnKeyType = 'search',
    } = props
    const [isFocused, setIsFocused] = useState(false)

    const hasValue = !!value
    const showClear = hasValue && !!onClear && (isFocused || !trailingButton)

    return (
        <View style={[styles.container, isFocused && styles.containerFocused, style]}>
            {isLoading ? (
                <BrandAppLoader size="s" />
            ) : (
                <Icon source={search} tint={brandColors.contentPrimary} />
            )}
            <TextInput
                ref={ref}
                disableFullscreenUI
                autoCorrect={false}
                spellCheck={false}
                placeholderTextColor={brandColors.contentSecondary}
                returnKeyType={returnKeyType}
                value={value}
                placeholder={placeholder}
                autoFocus={autoFocus}
                testID={testID}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmitEditing}
                onEndEditing={onEndEditing}
                style={styles.input}
                onFocus={e => {
                    setIsFocused(true)
                    onFocus?.(e)
                }}
                onBlur={e => {
                    setIsFocused(false)
                    onBlur?.(e)
                }}
            />
            {showClear && (
                <CommonTouchable
                    testID={testID ? `${testID} clear` : undefined}
                    onPress={onClear}
                    style={styles.clearButton}
                >
                    <Icon source={cancelCircle} tint={brandColors.contentTertiary} />
                </CommonTouchable>
            )}
            {!showClear && trailingButton}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 100,
        borderColor: brandColors.formDefault,
        backgroundColor: brandColors.backgroundDefault,
        paddingLeft: 12,
    },
    containerFocused: {
        borderColor: brandColors.formActive,
    },
    input: {
        flex: 1,
        paddingLeft: 12,
        paddingVertical: 0,
        color: brandColors.contentPrimary,
        ...brandFontsStyles.f15w400,
    },
    clearButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
