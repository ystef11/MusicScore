import { NativeModules, Platform } from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'

import { store } from '@mu-native/common'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { ensureNetwork } from '@mu-native/system'
import { firebase } from '@react-native-firebase/app-check'

import reportEvent from '../../../App/Utils/Analytics'
import SentryUtils from '../../../App/Utils/Sentry'
import { isResponse } from '../api'
import { apiRequest } from '../contracts/apiRequest'
import { commonContracts } from '../contracts/commonContracts'
import { deviceCheckContracts } from '../contracts/deviceCheckContracts'
import {
    createAttestationError,
    isAttestationVerdict,
    TAutoRetryListener,
    withAppCheckRetry,
} from '../helpers/appCheckAttestation'
import { apiStoreChunk } from '../index'

export const updateTimestampService = () => {
    return apiRequest(commonContracts.hello)
}

let didTryToRegenerateKeyId = false
let attestRequest: Promise<boolean> | null = null

const { AppAttestModule } = NativeModules as {
    AppAttestModule: {
        isSupported(): Promise<boolean>
        generateKey(): Promise<string>
        attestKey(keyId: string, challenge: string): Promise<string>
    }
}

async function iosAppAttestFallback(): Promise<boolean> {
    console.log('[ApiServices.iosAppAttestFallback]')

    const { f: nonce } = await apiRequest(deviceCheckContracts.nonce)
    const keyId = await AppAttestModule.generateKey()
    const attestation = await AppAttestModule.attestKey(keyId, nonce)

    const e = await apiRequest(deviceCheckContracts.verifyAppAttest, {
        payload: { c: attestation, k: keyId, h: nonce },
    })

    reportEvent('Dev: check a nonce request', { status: 200 })
    store.dispatch(apiStoreChunk.actions.setF(e.t))
    store.dispatch(apiStoreChunk.actions.setReconnectCount(0))
    reportEvent('Dev: check a attestation', { f: e.t })
    reportEvent('Dev: check a token request', { status: 200 })
    reportEvent('Dev: check a Finished')
    return true
}

const readErrorText = (error: unknown): string => {
    const { cause, message } = (error ?? {}) as { cause?: unknown; message?: unknown }
    if (typeof cause === 'string') return cause
    if (typeof message === 'string') return message
    return isResponse(error) ? `status: ${error.status}` : ''
}

/**
 * One event per attestation that needed more than one attempt, so the retry
 * lists above can be tuned on data rather than on Sentry titles.
 * `source` says who retried: App Check token minting or the backend check.
 */
export const reportAttestationAutoRetry =
    (source: 'appCheck' | 'backend'): TAutoRetryListener =>
    ({ attempts, success, error }) => {
        reportEvent(RT_EVENTS.SCORE_DEVICE_VERIFICATION_AUTO_RETRY, {
            'params.key': ['source', 'cause', 'attempts', 'success'],
            'params.str_value': [source, readErrorText(error), '', ''],
            'params.value': [0, 0, attempts, success ? 1 : 0],
        })
    }

// ios device attestation
const baseCheck = async (): Promise<boolean> => {
    try {
        await ensureNetwork()
        // forceRefresh stays on: the backend rejects a reused `jti` as a replay,
        // so a cached token would never pass /app/d/i.
        const { token } = await withAppCheckRetry(
            () => firebase.appCheck().getToken(true),
            reportAttestationAutoRetry('appCheck'),
        )
        if (!token || token.length === 0) {
            throw new Error("attestation didn't pass")
        }
        const response = await apiRequest(deviceCheckContracts.verifyAppCheck, {
            payload: { s: token },
        })
        console.log('🍓[ApiServices.iosA.firebase.api.call]', response.t)
        store.dispatch(apiStoreChunk.actions.setF(response.t))
        store.dispatch(apiStoreChunk.actions.setReconnectCount(0))
        return true
    } catch (e: any) {
        console.log('🍓[ApiServices.iosA.error]', e)
        if (!isAttestationVerdict(e)) SentryUtils.sendMessage('firebaseAppCheckFailed', e)
        if (isResponse(e) && e.status === 403) {
            // try to regenerate keyId only once per session
            if (!didTryToRegenerateKeyId) {
                didTryToRegenerateKeyId = true
                return baseCheck()
            }
            throw e
        }
        if (Platform.OS === 'ios') return iosAppAttestFallback()
        const cause = isResponse(e) ? `status: ${e.status}` : (e?.message ?? String(e))
        const fallbackError = createAttestationError(cause)
        // Исходная ошибка уже отправлена выше как firebaseAppCheckFailed —
        // не дублируем её в Sentry на верхних этажах (например, в openScore).
        // Исключение: Response < 500 (например, 422 — сервер отклонил
        // integrity-токен) sendMessage у источника отбрасывает, и тогда
        // единственным сигналом остаётся обёртка с cause `status: NNN`.
        if (!isResponse(e) || e.status >= 500) {
            ;(fallbackError as Error & { sentryReported?: boolean }).sentryReported = true
        }
        throw fallbackError
    }
}

const { df } = LaunchArguments.value<{ df?: string }>()

/**
 * Single-flight для аттестации устройства: параллельные вызовы attestApp()
 * (логин, открытие партитуры, onPassAttestation при device.attestation_failed
 * сразу у нескольких запросов на старте) ждут один общий процесс аттестации
 * вместо того, чтобы каждый независимо запускать App Check / App Attest и
 * перезаписывать токен `f` последним ответом (а заодно ловить 429 от сервера).
 */
export function attestApp(): Promise<boolean> {
    if (df) {
        store.dispatch(apiStoreChunk.actions.setF(df))
        store.dispatch(apiStoreChunk.actions.setReconnectCount(0))
        return Promise.resolve(true)
    }
    if (!attestRequest) {
        didTryToRegenerateKeyId = false
        attestRequest = baseCheck().finally(() => {
            attestRequest = null
        })
    }
    return attestRequest
}
