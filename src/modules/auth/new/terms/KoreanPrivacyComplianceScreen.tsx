import React, { useCallback, useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'

import { colors, openInAppBrowser, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants } from '@mu-native/marketing'
import { useAppRoute } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import { Button } from '../../../../App/profileScreens/users/components/Button'
import reportEvent from '../../../../App/Utils/Analytics'
import { TCreateAccountParams, useCreateAccount } from '../../hooks/useCreateAccount'
import { authStoreChunk } from '../../store/authStoreChunk'
import { useSetNavigationHeader } from '../useSetNavigationHeader'

import { CheckBlock } from './CheckableBlock'

/* eslint-disable import/no-relative-packages */

const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: colors.white100,
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    flexOne: {
        flex: 1,
    },

    sectionTitle: {
        height: 48,
        lineHeight: 48,
        color: colors.gray500,
        textTransform: 'uppercase',
    },

    topRadius: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },

    bottomRadius: {
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },

    radius: {
        borderRadius: 8,
    },
})

const required = [10, 11, 14]
const all = [10, 11, 12, 13, 14]
const fieldAnalyticsNameMap: Record<number, string> = {
    '-1': 'all',
    10: 'service',
    11: 'personal_info',
    12: 'opt_info',
    13: 'marketing',
    14: 'age',
}

function includes(left: number[], right: number[]): boolean {
    // eslint-disable-next-line no-restricted-syntax
    for (const r of right) {
        if (!left.includes(r)) return false
    }
    return true
}

export const KoreanPrivacyComplianceScreen = React.memo(() => {
    const params = useAppRoute<TCreateAccountParams>()
    const insets = useAppSafeArea({ bottom: 16 })
    const [consents, setConsents] = useState<number[]>([])
    const [isLoading] = useValues([authStoreChunk.props.getIsLoginLoading])
    const { onCreateAccountPress } = useCreateAccount()
    useSetNavigationHeader(translate('native.screen_new_account.consent_screen_header'))

    const onAgreeAllPress = (id: number) => {
        const eventParams = {
            'params.key': ['field_terms'],
            'params.value': [0],
            'params.str_value': [fieldAnalyticsNameMap[id]],
        }
        if (id === -1) {
            if (consents.length === 5) {
                reportEvent(MetricaEvents.LANDING_SIGN_UP_TERMS_UNSELECT_CLICK, eventParams)
                setConsents([])
            } else {
                reportEvent(MetricaEvents.LANDING_SIGN_UP_TERMS_SELECT_CLICK, eventParams)
                setConsents([10, 11, 12, 13, 14])
            }
            return
        }
        if (consents.includes(id)) {
            reportEvent(MetricaEvents.LANDING_SIGN_UP_TERMS_UNSELECT_CLICK, eventParams)
            setConsents(consents.filter(c => c !== id))
        } else {
            reportEvent(MetricaEvents.LANDING_SIGN_UP_TERMS_SELECT_CLICK, eventParams)
            setConsents([...consents, id])
        }
    }

    const onCreatePress = () => {
        reportEvent(MetricaEvents.LANDING_SIGN_UP_CREATE_ACCOUNT_CLICK)
        const consent = all.map(id => ({ type: id, value: consents.includes(id) ? 1 : 0 }))
        onCreateAccountPress(params, consent)
    }

    const goToTerms = useCallback(() => {
        openInAppBrowser(marketingConstants.termsLink)
    }, [])

    const goToPolicy = useCallback(() => {
        openInAppBrowser(marketingConstants.requiredPrivacyLink)
    }, [])

    const goToOptionalPolicy = useCallback(() => {
        openInAppBrowser(marketingConstants.optionalPrivacyLink)
    }, [])

    return (
        <View style={styles.base}>
            <StatusBar barStyle="dark-content" />
            <ScrollView style={styles.flexOne}>
                <CheckBlock
                    label={translate('native.screen_new_account.agree_to_all')}
                    type={-1}
                    onToggle={onAgreeAllPress}
                    checked={consents.length === 5}
                    style={styles.radius}
                />
                <Text style={styles.sectionTitle}>
                    {translate('native.screen_new_account.required')}
                </Text>
                <CheckBlock
                    label={translate('native.screen_new_account.terms_of_use_label')}
                    externalLabel={translate('native.screen_new_account.terms_of_use')}
                    type={10}
                    onToggle={onAgreeAllPress}
                    checked={consents.includes(10)}
                    drawSeparator
                    style={styles.topRadius}
                    onExternalPress={goToTerms}
                />
                <CheckBlock
                    label={translate('native.screen_new_account.privacy_policy_required')}
                    externalLabel={translate('native.screen_new_account.see_details')}
                    type={11}
                    onToggle={onAgreeAllPress}
                    checked={consents.includes(11)}
                    drawSeparator
                    onExternalPress={goToPolicy}
                />
                <CheckBlock
                    label={translate('native.screen_new_account.age_confirm')}
                    type={14}
                    onToggle={onAgreeAllPress}
                    checked={consents.includes(14)}
                    style={styles.bottomRadius}
                />
                <Text style={styles.sectionTitle}>
                    {translate('native.screen_new_account.recommended')}
                </Text>
                <CheckBlock
                    label={translate('native.screen_new_account.receive_marketing')}
                    type={13}
                    onToggle={onAgreeAllPress}
                    checked={consents.includes(13)}
                    drawSeparator
                    style={styles.topRadius}
                />
                <CheckBlock
                    label={translate('native.screen_new_account.privacy_policy_optional')}
                    type={12}
                    externalLabel={translate('native.screen_new_account.see_details')}
                    onToggle={onAgreeAllPress}
                    checked={consents.includes(12)}
                    style={styles.bottomRadius}
                    onExternalPress={goToOptionalPolicy}
                />
            </ScrollView>

            <Button
                label={translate('native.screen_new_account.register_button_title')}
                style={{ marginBottom: insets.bottom }}
                isLoading={isLoading}
                disabled={!includes(consents, required)}
                onPress={onCreatePress}
            />
        </View>
    )
})
