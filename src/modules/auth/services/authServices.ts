import { LaunchArguments } from 'react-native-launch-arguments'

import {
    apiRequest,
    authContracts,
    commonContracts,
    userContracts,
    type TOauthProvider,
} from '@mu-native/api'
import { device } from '@mu-native/common'

import { AuthConsent } from '../store/authStoreChunk.ts'

export class RefreshTokenExpiredError extends Error {
    message = 'Expired refresh token.'
}

const deviceParams = () => ({ device_id: device.uniqueId })

const oAuth = (
    token: string,
    provider: TOauthProvider,
    consent?: AuthConsent,
    with_required_consents?: 0,
) =>
    apiRequest(authContracts.oauth, {
        params: deviceParams(),
        payload: {
            access_token: token,
            provider,
            consent: consent ? JSON.stringify(consent) : undefined,
            with_required_consents,
        },
    })

const checkSocialUser = async (
    token: string,
    provider: TOauthProvider,
): Promise<{ type: 'error'; message: string; code: number } | { type: 'success' }> => {
    try {
        await apiRequest(authContracts.oauthUserCheck, {
            params: deviceParams(),
            payload: { access_token: token, provider },
        })
        return { type: 'success' }
    } catch (e: any) {
        if (e.toString().includes('Not authorized')) {
            return { type: 'error', message: 'Not authorized.', code: 401 }
        }
        const error = e as any
        let message = error instanceof Error ? error.message : ''
        if (typeof error?.clone === 'function') {
            try { const body = await error.clone().json(); message = body?.message || body?.error?.message || message } catch { /* Use HTTP status below. */ }
        }
        return { type: 'error', message: message || `Ошибка проверки аккаунта (HTTP ${error.status ?? 422}).`, code: error.status ?? 422 }
    }
}

const launchArgCookie = LaunchArguments.value<{ extraCookies: string }>()

// E2E runs pass a cookie that lifts the login rate limit.
const extraCookieHeaders = () =>
    launchArgCookie?.extraCookies
        ? [{ title: 'Cookie', get: () => launchArgCookie.extraCookies }]
        : []

const auth = (
    userName: string,
    password: string,
    recaptchaToken: string | null,
    f?: string | null,
) =>
    apiRequest(authContracts.login, {
        params: deviceParams(),
        payload: {
            field: userName,
            password,
            capcha: recaptchaToken || undefined,
            f: f || undefined,
        },
        headerParams: extraCookieHeaders(),
    })

const createAccount = ({
    username,
    email,
    password,
    capcha,
    consent,
    type,
    with_required_consents,
}: {
    username?: string
    email: string
    password?: string
    capcha?: string
    consent?: AuthConsent
    type?: 'email' | undefined
    with_required_consents?: 0
}) =>
    apiRequest(authContracts.register, {
        params: deviceParams(),
        headerParams: extraCookieHeaders(),
        payload: {
            username,
            email,
            password,
            capcha,
            type,
            consent: consent ? JSON.stringify(consent) : undefined,
            with_required_consents,
        },
    })

/** True when the address is already registered (200); a free address is a 404. */
const checkEmail = async (data: { email: string }): Promise<boolean> => {
    try {
        await apiRequest(authContracts.emailCheck, {
            params: { ...deviceParams(), email: data.email },
        })
        return true
    } catch (e) {
        return false
    }
}

/** True when the name is already taken (200); a free name is a 404. */
const checkUsername = async (data: { username: string }): Promise<boolean> => {
    try {
        await apiRequest(authContracts.usernameCheck, {
            params: { ...deviceParams(), username: data.username },
        })
        return true
    } catch {
        return false
    }
}

const refreshToken = async (refreshToken: string) => {
    try {
        return await apiRequest(authContracts.refresh, {
            payload: { refresh_token: refreshToken, device_id: device.uniqueId },
        })
    } catch (e: any) {
        if (e.status === 401) {
            throw new RefreshTokenExpiredError()
        }
        throw e
    }
}

const requestRecapture = () => apiRequest(authContracts.captcha)

const subscribeNotifications = (oldToken: string | null, newToken: string) => {
    if (oldToken) {
        return apiRequest(userContracts.refreshPush, {
            payload: { old_push_token: oldToken, new_push_token: newToken },
        })
    }
    return apiRequest(userContracts.subscribePush, { payload: { push_token: newToken } })
}

const getAuthMethodsAvailable = () => apiRequest(commonContracts.hello)

const authMobWeb = (secret: string) =>
    apiRequest(authContracts.quick, { params: deviceParams(), payload: { secret } })

export const authServices = {
    oAuth,
    auth,
    createAccount,
    requestRecapture,
    refreshToken,
    subscribeNotifications,
    getAuthMethodsAvailable,
    checkSocialUser,
    checkEmail,
    checkUsername,
    authMobWeb,
}
