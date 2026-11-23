import { Platform } from 'react-native'
import { AccessToken, AuthenticationToken, LoginManager } from 'react-native-fbsdk-next'
import SparkMD5 from 'spark-md5'

import appleAuth, {
    AppleAuthError,
    AppleAuthRequestOperation,
    AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication'
import { translate } from '@mu-native/locale'
import { checkConnection } from '@mu-native/system'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import { deviceId } from '../../../App/Utils/Platform'
import { authServices } from '../services/authServices'

type TSocialResponse =
    | { type: 'error'; message: string; messageTitle?: string }
    | { type: 'success'; isNewUser?: boolean; token: string }

export const CANCELLED = 'cancelled'

const cancelled: TSocialResponse = { type: 'error', message: CANCELLED }

async function checkSocialUser(
    accessToken: string,
    type: 'google' | 'facebook' | 'apple',
): Promise<TSocialResponse> {
    const response = await authServices.checkSocialUser(accessToken, type)

    // user is not created
    if (response.type === 'error' && response.code === 403) {
        return { type: 'success', isNewUser: true, token: accessToken }
    }

    // some other error
    if (response.type === 'error') {
        return { type: 'error', message: response.message }
    }

    // user registered just login
    return { type: 'success', isNewUser: false, token: accessToken }
}

export async function fetchGoogleToken(checkRegistration = true): Promise<TSocialResponse> {
    reportEvent(MetricaEvents.GOOGLE_LOGIN_CLICK)
    checkConnection()
    GoogleSignin.configure()
    await GoogleSignin.hasPlayServices()
    // signIn() resolves with `cancelled` instead of throwing, and getTokens() rejects without a user
    const signInResponse = await GoogleSignin.signIn()
    if (signInResponse.type === CANCELLED) return cancelled

    const { accessToken } = await GoogleSignin.getTokens()
    if (!accessToken) {
        return { type: 'error', message: 'no token Provided' }
    }

    return checkRegistration
        ? checkSocialUser(accessToken, 'google')
        : { type: 'success', token: accessToken }
}

export async function fetchAppleToken(): Promise<TSocialResponse> {
    reportEvent(MetricaEvents.APPLE_LOGIN_CLICK)
    checkConnection()

    let identityToken: string | null
    try {
        ;({ identityToken } = await appleAuth.performRequest({
            requestedOperation: AppleAuthRequestOperation.LOGIN,
            requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
        }))
    } catch (error) {
        const { code } = (error as { code?: string }) ?? {}
        if (code === AppleAuthError.CANCELED) return cancelled
        // 1000 is Apple's "unknown": no stack, nothing to act on. Show the alert
        // instead of letting it escape as an unhandled rejection (MUP-14232).
        // It is a catch-all — no Apple ID on the device, Sign in with Apple
        // restricted, an abandoned prompt — and checkConnection above has already
        // alerted an offline user, so the copy must not blame the connection.
        // The title alone says all we know; a "please try again" body needs a new
        // key in the translation project (MUP-14276).
        if (code === AppleAuthError.UNKNOWN) {
            return {
                type: 'error',
                messageTitle: translate('native.new_concept.common.error_title'),
                message: '',
            }
        }
        throw error
    }

    if (!identityToken) {
        return { type: 'error', message: 'no token provided' }
    }
    return checkSocialUser(identityToken, 'apple')
}

export async function fetchFacebookToken(): Promise<TSocialResponse> {
    reportEvent(MetricaEvents.FB_LOGIN_CLICK)
    checkConnection()

    LoginManager.logOut()
    let nonce: string | undefined
    if (Platform.OS === 'ios') nonce = SparkMD5.hash(deviceId)
    const result = await LoginManager.logInWithPermissions(
        ['public_profile', 'email'],
        undefined,
        nonce,
    )

    if (result.isCancelled) {
        reportEvent(MetricaEvents.FB_LOGIN_CANCEL)
        return cancelled
    }

    if (!result.grantedPermissions?.includes('email')) {
        return {
            type: 'error',
            messageTitle: translate('native.screen_login.email_required_error_title'),
            message: translate('native.screen_login.email_required_error_text'),
        }
    }

    if (Platform.OS === 'ios') {
        const result = await AuthenticationToken.getAuthenticationTokenIOS()
        if (!result?.authenticationToken) return { type: 'error', message: 'no token provided' }
        return checkSocialUser(result.authenticationToken, 'facebook')
    }
    const data = await AccessToken.getCurrentAccessToken()
    if (!data?.accessToken) return { type: 'error', message: 'no token provided' }
    return checkSocialUser(data.accessToken, 'facebook')
}
