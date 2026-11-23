import { isNetworkError, isResponse } from '@mu-native/api'
import { translate } from '@mu-native/locale'

import { isGoogleSignInNetworkError } from './googleSignInFailure'

/**
 * The provider has already returned a token by the time these failures happen,
 * so the user is past the system sheet and is looking at a screen that appears
 * to do nothing. Until MUP-14303 every one of them was silent: the thunks call
 * `handleError`, which has no handler registered for any status and only logs.
 */

type TAlert = { messageTitle: string; message: string }

const readServerMessage = async (error: unknown): Promise<string> => {
    if (!isResponse(error)) return ''

    try {
        const body = await error.clone().json()
        const message = body?.message || body?.error?.message || body?.fields?.at(0)?.message

        return typeof message === 'string' ? message : ''
    } catch {
        return ''
    }
}

/** Show failures from both the Google chooser and the service token exchange. */
export const socialLoginAlert = async (error: unknown): Promise<TAlert> => {
    const native = error as { code?: unknown; message?: unknown } | null
    const code = String(native?.code ?? '')
    const title = translate('native.new_concept.common.error_title')
    if (code === '10' || code === 'DEVELOPER_ERROR') {
        return { messageTitle: title, message: 'Google отклонил конфигурацию этой сборки (код 10). В настройках Google OAuth должны быть зарегистрированы пакет com.musescore.client и SHA-1 сертификата, которым подписан APK.' }
    }
    if (isNetworkError(error) || isGoogleSignInNetworkError(error)) {
        return {
            messageTitle: translate('native.alerts.connection_error.title'),
            message: translate('native.alerts.connection_error.message'),
        }
    }
    const serverMessage = await readServerMessage(error)
    if (isResponse(error)) {
        return { messageTitle: title, message: serverMessage || `Сервер отклонил вход (HTTP ${error.status}).` }
    }
    const detail = typeof native?.message === 'string' ? native.message : ''
    return { messageTitle: title, message: detail || `Не удалось завершить вход через Google${code ? ` (код ${code})` : ''}.` }
}
