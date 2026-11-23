import React, { memo } from 'react'
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import { colors, icons, renderTaggedText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { passwordStrongType } from './password.validates'

export type PasswordRuleTypes =
    | 'passwordLowerCase'
    | 'passwordUpperCase'
    | 'passwordNumber'
    | 'passwordSpecialCharacters'
    | 'passwordLength'

type Props = {
    readonly isEmptyPassword: boolean
    readonly validates: Record<PasswordRuleTypes, boolean | undefined>
    readonly style?: StyleProp<ViewStyle>
}

const styles = StyleSheet.create({
    validationItem: {
        minHeight: 22,
        marginBottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },

    text: {
        fontSize: 12,
        color: colors.contentInactive,
    },

    checkIcon: {
        width: 9,
        height: 9,
        marginEnd: 4,
    },

    mb8: {
        marginBottom: 8,
    },
})

const PasswordRuleView: React.FC<{
    title: string
    isValid: boolean
}> = props => {
    return (
        <View style={styles.validationItem}>
            <Image
                source={props.isValid ? icons.iosCheck : icons.minusMd}
                style={[
                    styles.checkIcon,
                    {
                        tintColor: props.isValid
                            ? colors.accentMonetization
                            : colors.contentInactive,
                    },
                ]}
            />
            <Text style={styles.text}>{props.title}</Text>
        </View>
    )
}

const passwordTypeColorMap = {
    weak: colors.contentError,
    normal: colors.contentWarning,
    strong: colors.accentMonetization,
} as const

const passwordStrengthLineKeys = {
    weak: 'native.screen_new_account.password_strength_line.weak',
    normal: 'native.screen_new_account.password_strength_line.normal',
    strong: 'native.screen_new_account.password_strength_line.strong',
} as const

export const PasswordRulesView: React.FC<Props> = memo(props => {
    const { validates } = props
    const passwordStrongKey = passwordStrongType(props.validates)
    const color = passwordTypeColorMap[passwordStrongKey]

    let title: React.ReactNode
    if (props.isEmptyPassword) {
        title = (
            <Text style={[styles.text, styles.mb8]}>
                {translate('native.screen_new_account.password_rules_title')}
            </Text>
        )
    } else {
        title = (
            <Text style={[styles.text, styles.mb8]}>
                {renderTaggedText(translate(passwordStrengthLineKeys[passwordStrongKey]), {
                    color: <Text style={{ color }} />,
                })}
            </Text>
        )
    }

    return (
        <View style={props.style} pointerEvents="none">
            {title}
            {validates.passwordLength !== undefined && (
                <PasswordRuleView
                    title={translate('native.screen_new_account.password_rules_length')}
                    isValid={validates.passwordLength}
                />
            )}

            {validates.passwordLowerCase !== undefined && (
                <PasswordRuleView
                    title={translate('native.screen_new_account.password_rules_lowercase_letters')}
                    isValid={validates.passwordLowerCase}
                />
            )}
            {validates.passwordUpperCase !== undefined && (
                <PasswordRuleView
                    title={translate('native.screen_new_account.password_rules_uppercase_letters')}
                    isValid={validates.passwordUpperCase}
                />
            )}
            {validates.passwordNumber !== undefined && (
                <PasswordRuleView
                    title={translate('native.screen_new_account.password_rules_numbers')}
                    isValid={validates.passwordNumber}
                />
            )}
            {validates.passwordSpecialCharacters !== undefined && (
                <PasswordRuleView
                    title={translate('native.screen_new_account.password_rules_special_characters')}
                    isValid={validates.passwordSpecialCharacters}
                />
            )}
        </View>
    )
})
