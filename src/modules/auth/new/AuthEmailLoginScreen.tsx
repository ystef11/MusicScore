import { useEffect, useRef, useState } from 'react'
import { StatusBar, StyleSheet, Text, TextInput, type TextInputInstance, View } from 'react-native'

import { colors, KeyboardSpacer, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { Button } from '../../../App/profileScreens/users/components/Button'
import reportEvent from '../../../App/Utils/Analytics'
import { authServices } from '../services/authServices'

import { isEmailValid } from './emailValidator'
import { useSetNavigationHeader } from './useSetNavigationHeader'

/* eslint-disable import/no-relative-packages */

const styles = StyleSheet.create({
    textInput: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.bottomSheetGray,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
    },

    label: {
        marginBottom: 4,
        color: colors.text900,
    },

    flexOne: {
        flex: 1,
    },

    base: {
        flex: 1,
        backgroundColor: colors.white100,
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    error: {
        color: colors.redError,
        marginBottom: 12,
        marginTop: -8,
    },
})

export const AuthEmailLoginScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea({ bottom: 16 })

    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [emailError, setEmailError] = useState<string | undefined>(undefined)
    const [usernameError, setUsernameError] = useState<string | undefined>(undefined)
    const [validating, setValidating] = useState(false)

    const emailRef = useRef<TextInputInstance>(null)
    const usernameRef = useRef<TextInputInstance>(null)
    const isDisabledContinue =
        !isEmailValid(email) || username.trim().length === 0 || !!emailError || !!usernameError

    useSetNavigationHeader(translate('native.screen_new_account.email_screen_header'))

    useEffect(() => {
        setTimeout(() => {
            emailRef.current?.focus()
        }, 500)
    }, [])

    const onContinuePress = async () => {
        if (isDisabledContinue) return

        reportEvent(MetricaEvents.LANDING_SIGN_UP_CLICK, { value: 'to_password' })
        setValidating(true)
        try {
            const [emailExists, usernameExists] = await Promise.all([
                authServices.checkEmail({ email }),
                authServices.checkUsername({ username }),
            ])

            if (emailExists) {
                setEmailError(translate('native.screen_new_account.email_taken_error', { email }))
            }

            if (usernameExists) {
                setUsernameError(
                    translate('native.screen_new_account.username_taken_error', { username }),
                )
            }

            if (emailExists || usernameExists) {
                reportEvent(MetricaEvents.LANDING_SIGN_UP_CLICK_ERROR, {
                    value: 'to_password',
                    'params.key': ['error'],
                    'params.value': [0],
                    'params.str_value': [emailExists ? 'email_exists' : 'username_exists'],
                })
                return
            }

            reportEvent(MetricaEvents.LANDING_SIGN_UP_CLICK_SUCCESS, { value: 'to_password' })
            navigation.navigate('AuthPasswordScreen', { email, username })
        } finally {
            setValidating(false)
        }
    }

    const onNextPress = () => {
        usernameRef.current?.focus()
    }

    const onHandleFocus = (value: string) => () => {
        reportEvent(MetricaEvents.LANDING_LOG_IN_CLICK, {
            value,
            ui: 'modal-short',
        })
    }

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <View style={styles.base}>
                <Text style={styles.label}>{translate('native.screen_new_account.email')}</Text>
                <TextInput
                    ref={emailRef}
                    onChangeText={value => {
                        setEmail(value)
                        setEmailError(undefined)
                    }}
                    value={email}
                    onSubmitEditing={onNextPress}
                    style={styles.textInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    returnKeyType="next"
                    placeholder={translate('native.screen_new_account.email_placeholder')}
                    placeholderTextColor={colors.text400}
                    onFocus={onHandleFocus('email_field')}
                />
                {!!emailError && <Text style={styles.error}>{emailError}</Text>}
                <Text style={styles.label}>{translate('native.screen_new_account.user')}</Text>
                <TextInput
                    ref={usernameRef}
                    onChangeText={value => {
                        setUsername(value)
                        setUsernameError(undefined)
                    }}
                    value={username}
                    style={styles.textInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    placeholder={translate('native.screen_new_account.username_placeholder')}
                    onSubmitEditing={onContinuePress}
                    placeholderTextColor={colors.text400}
                    onFocus={onHandleFocus('username')}
                />
                {!!usernameError && <Text style={styles.error}>{usernameError}</Text>}
                <View style={styles.flexOne} />
                <Button
                    label={translate('native.screen_new_account.continue')}
                    disabled={isDisabledContinue}
                    onPress={onContinuePress}
                    isLoading={validating}
                />
                <KeyboardSpacer defaultBottomSpacing={insets.bottom} openedSpacing={8} />
            </View>
        </>
    )
}
