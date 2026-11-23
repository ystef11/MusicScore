import React, { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, Text, TextInput, type TextInputInstance, View } from 'react-native'

import { colors, CommonTouchable, icons, KeyboardSpacer, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation, useAppRoute, Screen } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import { Button } from '../../../../App/profileScreens/users/components/Button'
import reportEvent from '../../../../App/Utils/Analytics'
import { TCreateAccountParams, useCreateAccount } from '../../hooks/useCreateAccount'
import { authStoreChunk } from '../../store/authStoreChunk'
import { useSetNavigationHeader } from '../useSetNavigationHeader'

import { passwordStrongType, validatePasswordRules } from './password.validates'
import { PasswordRulesView, PasswordRuleTypes } from './PasswordRulesView'

/* eslint-disable import/no-relative-packages */

const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: colors.white100,
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    textInputWrapper: {
        height: 44,
        borderWidth: 1,
        borderColor: colors.bottomSheetGray,
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
    },

    textInput: {
        flex: 1,
        paddingHorizontal: 12,
    },

    textIconWrapper: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    secureIcon: {
        width: 20,
        height: 20,
    },

    label: {
        marginBottom: 4,
        color: colors.text900,
    },

    flexOne: {
        flex: 1,
    },
})

const enoughToStrong = ['strong', 'normal']
export const AuthPasswordScreen: React.FC = () => {
    const params = useAppRoute<{ email: string; username: string }>()
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const [password, setPassword] = useState('')
    const [isSecured, setSecured] = useState(true)
    const passwordRef = useRef<TextInputInstance>(null)

    const [isLoading, authMethods] = useValues([
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getAuthMethods,
    ])
    const [validates, setValidates] = useState<Record<PasswordRuleTypes, boolean>>({
        passwordLength: false,
        passwordNumber: false,
        passwordLowerCase: false,
        passwordSpecialCharacters: false,
        passwordUpperCase: false,
    })
    const enoughStrongPassword = enoughToStrong.includes(passwordStrongType(validates))

    const { onCreateAccountPress } = useCreateAccount()
    useSetNavigationHeader(translate('native.screen_new_account.password_screen_header'))

    useEffect(() => {
        setTimeout(() => {
            passwordRef.current?.focus()
        }, 500)
    }, [])

    const onPasswordChange = (text: string) => {
        setValidates(validatePasswordRules(text))
        setPassword(text)
    }

    const onContinuePress = () => {
        if (!enoughStrongPassword) return
        reportEvent(MetricaEvents.LANDING_SIGN_UP_PASSWORD_CONTINUE_CLICK)
        const data: TCreateAccountParams = {
            type: 'email',
            password,
            ...params,
        }
        if (authMethods.isLegallyConsentAvailable && authMethods.consentScreenType) {
            reportEvent(MetricaEvents.LANDING_SIGN_UP_PASSWORD_CONTINUE_CLICK_SUCCESS)
            navigation.navigate(Screen.KoreanPrivacyComplianceScreen, data)
        } else {
            onCreateAccountPress(data)
        }
    }

    return (
        <View style={styles.base}>
            <Text style={styles.label}>{translate('native.screen_new_account.pass')}</Text>
            <View style={styles.textInputWrapper}>
                <TextInput
                    ref={passwordRef}
                    onChangeText={onPasswordChange}
                    value={password}
                    style={styles.textInput}
                    autoCorrect={false}
                    autoCapitalize="none"
                    secureTextEntry={isSecured}
                    placeholder={translate('native.screen_new_account.password_placeholder')}
                    returnKeyType="done"
                    onSubmitEditing={onContinuePress}
                    placeholderTextColor={colors.text400}
                />
                <CommonTouchable
                    activeOpacity={0.8}
                    style={styles.textIconWrapper}
                    onPress={() => setSecured(!isSecured)}
                >
                    <Image
                        source={isSecured ? icons.visibilityOff : icons.visibilityOn}
                        style={styles.secureIcon}
                    />
                </CommonTouchable>
            </View>
            <PasswordRulesView isEmptyPassword={password.length === 0} validates={validates} />
            <View style={styles.flexOne} />
            <Button
                label={translate('native.screen_new_account.continue')}
                onPress={onContinuePress}
                isLoading={isLoading}
                disabled={!enoughStrongPassword}
            />
            <KeyboardSpacer defaultBottomSpacing={insets.bottom} openedSpacing={8} />
        </View>
    )
}
