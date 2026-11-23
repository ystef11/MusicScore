import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import {
    PasswordRulesView,
    PasswordRuleTypes,
    passwordStrongType,
    validatePasswordRules,
} from '@mu-native/auth'
import { brandColors, colors, CommonTouchable, icons, InputWithIcon } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type EmailInputProps = {
    email: string
    error: boolean
    setEmail: (email: string) => void
    clearEmail: () => void
    onSubmitEditing: () => void
    inputRef?: (ref: TextInput | null | undefined) => void
    onFocus?: () => void
    onBlur?: () => void
    placeholder?: string
    testID?: string
}
export const EmailInput = ({
    inputRef,
    email,
    setEmail,
    clearEmail,
    error,
    onSubmitEditing,
    onFocus,
    onBlur,
    placeholder,
    testID,
}: EmailInputProps) => {
    return (
        <View style={styles.inputContainer}>
            <InputWithIcon
                inputRef={inputRef}
                value={email}
                placeholder={placeholder || translate('native.screen_new_account.email')}
                onChangeText={setEmail}
                keyboardType="email-address"
                onIconPress={error ? clearEmail : undefined}
                source={error && email ? icons.iconCloseSecond : undefined}
                error={error}
                returnKeyType="next"
                onSubmitEditing={onSubmitEditing}
                onFocus={onFocus}
                onBlur={onBlur}
                testID={testID}
                borderFocused={brandColors.additionalDefault}
                backgroundInputColor={brandColors.backgroundDefault}
                borderColor={brandColors.contentTertiary}
            />
        </View>
    )
}
type PasswordInputProps = {
    password: string
    isShownPassword: boolean
    setPassword: (password: string, isStrong: boolean) => void
    showPassword: () => void
    onSubmitEditing: () => void
    inputRef: (ref: TextInput | null | undefined) => void
    onFocus: () => void
    onBlur: () => void
    testID?: string
}
const enoughToStrong = ['strong', 'normal']
export const PasswordInput = ({
    inputRef,
    password,
    showPassword,
    setPassword,
    onBlur,
    onFocus,
    isShownPassword,
    onSubmitEditing,
    testID = 'Password input',
}: PasswordInputProps) => {
    const [validates, setValidates] = React.useState<Record<PasswordRuleTypes, boolean>>({
        passwordLength: false,
        passwordNumber: false,
        passwordLowerCase: false,
        passwordSpecialCharacters: false,
        passwordUpperCase: false,
    })

    const onPasswordChange = (text: string) => {
        const _validates = validatePasswordRules(text)
        setValidates(_validates)
        const enoughStrongPassword = enoughToStrong.includes(passwordStrongType(_validates))
        setPassword(text, enoughStrongPassword)
    }

    return (
        <View style={styles.inputContainer}>
            <InputWithIcon
                inputRef={inputRef}
                value={password}
                placeholder={translate('native.screen_new_account.pass')}
                onChangeText={onPasswordChange}
                onIconPress={showPassword}
                source={isShownPassword ? icons.visibilityOn : icons.visibilityOff}
                secureTextEntry={!isShownPassword}
                returnKeyType="done"
                backgroundInputColor={colors.gray}
                onSubmitEditing={onSubmitEditing}
                onFocus={onFocus}
                onBlur={onBlur}
                testID={testID}
            />

            <PasswordRulesView
                isEmptyPassword={password.length === 0}
                validates={validates}
                style={styles.passwordRules}
            />
        </View>
    )
}

type LinkProps = {
    onPress: () => void
}
export const SignInLink = ({ onPress }: LinkProps) => (
    <CommonTouchable onPress={onPress} accessible>
        <Text style={styles.signInMotiveText}>{translate('native.screen_new_account.title')}</Text>
    </CommonTouchable>
)

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',
        marginVertical: 4,
    },

    signInMotiveText: {
        fontSize: 16,
        lineHeight: 20,
        color: brandColors.colorActionPrimaryDefault,
        fontWeight: '500',
    },

    passwordRules: {
        marginTop: 4,
        alignItems: 'center',
    },
})
