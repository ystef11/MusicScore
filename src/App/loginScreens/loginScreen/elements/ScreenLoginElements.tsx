import React, { memo } from 'react'
import { StyleSheet, Text, type TextInputInstance, View, ViewStyle } from 'react-native'

import {
    AppText,
    brandColors,
    colors,
    CommonTouchable,
    globalStyles,
    icons,
    InputWithIcon,
} from '@mu-native/ds'
import { LocaleKey, translate } from '@mu-native/locale'

import { FULL_WIDTH_PERCENT } from '../../../constants/styles'

type LoginInputProps = {
    login: string
    isError: boolean
    setLogin: (login: string) => void
    clearLogin: () => void
    onSubmitEditing: () => void
    onFocus?: () => void
    onBlur?: () => void
    placeholder: LocaleKey
    testID?: string
    isBrandStyle?: boolean
    inputRef?: React.RefObject<TextInputInstance>
    borderFocused?: string
    backgroundInputColor?: string
    borderColor?: string
}
export const LoginInput = memo(
    ({
        login,
        setLogin,
        clearLogin,
        isError,
        onSubmitEditing,
        onFocus,
        onBlur,
        placeholder,
        isBrandStyle = false,
        ...props
    }: LoginInputProps) => {
        // @ts-ignore
        const placeholderString = translate(placeholder)
        return (
            <View style={styles.inputContainer}>
                <InputWithIcon
                    value={login}
                    placeholder={placeholderString}
                    onChangeText={setLogin}
                    keyboardType="email-address"
                    onIconPress={isError ? clearLogin : undefined}
                    source={isError ? icons.closeMd : undefined}
                    error={isError}
                    backgroundInputColor={colors.gray}
                    returnKeyType="next"
                    onSubmitEditing={onSubmitEditing}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    {...props}
                />
            </View>
        )
    },
)

LoginInput.displayName = 'LoginInput'
type PasswordInputProps = {
    password: string
    isError: boolean
    isShownPassword: boolean
    setPassword: (password: string) => void
    showPassword: () => void
    onSubmitEditing?: () => void
    inputRef: React.RefObject<TextInputInstance>
    testID: string
    onFocus?: () => void
    borderFocused?: string
    backgroundInputColor?: string
    borderColor?: string
}
export const PasswordInput = memo(
    ({
        password,
        setPassword,
        showPassword,
        isShownPassword,
        isError,
        onSubmitEditing,
        onFocus,
        inputRef,
        testID,
        ...props
    }: PasswordInputProps) => (
        <View style={styles.inputContainer}>
            <InputWithIcon
                testID={testID}
                inputRef={inputRef}
                value={password}
                placeholder={translate('native.screen_login.pass_placeholder')}
                onChangeText={setPassword}
                onIconPress={showPassword}
                source={isShownPassword ? icons.visibilityOn : icons.visibilityOff}
                secureTextEntry={!isShownPassword}
                error={isError}
                backgroundInputColor={colors.gray}
                returnKeyType="done"
                onSubmitEditing={onSubmitEditing}
                onFocus={onFocus}
                {...props}
            />
        </View>
    ),
)
PasswordInput.displayName = 'LoginInput'
type LinkProps = {
    onPress: () => void
    containerStyle?: ViewStyle
}
export const ForgotPasswordLink = memo(({ onPress, containerStyle }: LinkProps) => (
    <View style={[styles.forgotPasswordLink, containerStyle]}>
        <CommonTouchable onPress={onPress}>
            <AppText
                font="f13w500"
                brandColor="accentPrimary"
                adaptiveSize
                rawText={translate('native.screen_login.forgot_button_title')}
                style={globalStyles.mb24}
            />
        </CommonTouchable>
    </View>
))
ForgotPasswordLink.displayName = 'ForgotPasswordLink'
export const CreateAccountLink = ({ onPress }: Pick<LinkProps, 'onPress'>) => (
    <CommonTouchable onPress={onPress}>
        <Text style={styles.createAccountMotiveText}>
            {translate('native.screen_login.create_account_motive')}
        </Text>
    </CommonTouchable>
)
CreateAccountLink.displayName = 'CreateAccountLink'

const styles = StyleSheet.create({
    createAccountMotiveText: {
        fontSize: 16,
        lineHeight: 20,
        color: brandColors.accentPrimary,
        fontWeight: '500',
    },
    forgotPasswordLink: {
        marginBottom: 8,
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        width: FULL_WIDTH_PERCENT,
        marginVertical: 4,
    },
})
