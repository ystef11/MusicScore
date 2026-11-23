import { Platform } from 'react-native'
import { useCallback } from 'react'

import { showApiAlertError } from '@mu-native/api'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import SentryUtils from '../../../App/Utils/Sentry'
import { NavigationService, Screen } from '../../navigation/index'
import { socialLoginAlert } from '../helpers/socialLoginAlert'
import { authStoreChunk } from '../store/authStoreChunk'
import { authThunks } from '../store/authThunks'
import { CANCELLED, fetchAppleToken, fetchFacebookToken, fetchGoogleToken } from '../store/social'
import { statusCodes } from '@react-native-google-signin/google-signin'
import { TSocialButtonSource } from '../types/authTypes'

export function useSocialAuth(source: TSocialButtonSource) {
    const [{ isLegallyConsentAvailable, consentScreenType }] = useValues([
        authStoreChunk.props.getAuthMethods,
    ])
    const actions = useActions({
        setLoading: authStoreChunk.actions.setIsLoginLoading,
        createAccount: authThunks.createAccount,
        googleLogin: authThunks.googleLogin,
        googleWebLogin: authThunks.googleWebLogin,
        appleLogin: authThunks.appleLogin,
        facebookLogin: authThunks.facebookLogin,
        setStep: authStoreChunk.actions.setStep,
        setPendingMethod: authStoreChunk.actions.setPendingAuthMethod,
        handleClose: authThunks.closeAuthModal,
    })
    const isKorean = isLegallyConsentAvailable && consentScreenType === 'korean'

    const openConsentScreen = useCallback(
        (social: 'google' | 'facebook' | 'apple', token: string) => {
            actions.handleClose()
            NavigationService.navigate(Screen.AuthStackScreen, {
                screen: Screen.KoreanPrivacyComplianceScreen,
                params: { type: 'social', social, token },
            })
        },
        [],
    )

    const clickEvent = {
        login: MetricaEvents.LANDING_LOG_IN_CLICK,
        sign_up: MetricaEvents.LANDING_SIGN_UP_CLICK,
    }[source]
    const onGoogleLoginPress = useCallback(async () => {
        try {
            reportEvent(clickEvent, { value: 'google', ui: 'modal-short' })
            actions.setPendingMethod('google')
            actions.setLoading(true)
            if (Platform.OS === 'android') { await actions.googleWebLogin(); return }
            const response = await fetchGoogleToken(isKorean)
            if (response.type === 'error') {
                if (response.message !== CANCELLED) showApiAlertError(response)
                return
            }
            if (isKorean && response.isNewUser) {
                openConsentScreen('google', response.token)
                return
            }
            await actions.googleLogin({ token: response.token })
        } catch (error) {
            const code = String((error as { code?: unknown } | null)?.code ?? '')
            if (code === String(statusCodes.SIGN_IN_CANCELLED)) return
            showApiAlertError(await socialLoginAlert(error))
            SentryUtils.sendMessage('googleLogin', error)
        } finally {
            actions.setLoading(false)
            actions.setPendingMethod(null)
        }
    }, [actions, clickEvent, isKorean, openConsentScreen])

    const onAppleLoginPress = useCallback(async () => {
        try {
            reportEvent(clickEvent, { value: 'apple', ui: 'modal-short' })
            actions.setPendingMethod('apple')
            actions.setLoading(true)
            const response = await fetchAppleToken()
            if (response.type === 'error') {
                if (response.message !== CANCELLED) showApiAlertError(response)
                return
            }
            if (isKorean && response.isNewUser) {
                openConsentScreen('apple', response.token)
                return
            }
            await actions.appleLogin({ token: response.token })
        } catch (error) {
            SentryUtils.sendMessage('appleLogin', error)
        } finally {
            actions.setLoading(false)
            actions.setPendingMethod(null)
        }
    }, [])

    const onFacebookLoginPress = useCallback(async () => {
        try {
            reportEvent(clickEvent, { value: 'facebook', ui: 'modal-short' })
            actions.setPendingMethod('facebook')
            actions.setLoading(true)
            const response = await fetchFacebookToken()
            if (response.type === 'error') {
                if (response.message !== CANCELLED) showApiAlertError(response)
                return
            }
            if (isKorean && response.isNewUser) {
                openConsentScreen('facebook', response.token)
                return
            }
            await actions.facebookLogin({ token: response.token })
        } catch (error) {
            SentryUtils.sendMessage('facebookLogin', error)
        } finally {
            actions.setLoading(false)
            actions.setPendingMethod(null)
        }
    }, [])

    return { onGoogleLoginPress, onFacebookLoginPress, onAppleLoginPress }
}
