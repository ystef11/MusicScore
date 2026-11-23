import { Alert } from 'react-native'

import { ApiErrorCodes, isAttestationFailure, responseCode } from '@mu-native/api'
import { platform } from '@mu-native/common'
import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'
import { appEventsEmitter } from '@mu-native/system'

import { showAlertNotification } from '../Elements/NewAlertNotifications'
import SentryUtils from '../Utils/Sentry'

export type TScoreErrorPopupOptions<T = unknown> = {
    /** Re-runs the operation that failed, without showing a popup of its own. */
    retry?: () => Promise<T>
    onDismiss?: () => void
    source?: string
}

/**
 * Resolves with the retry's result once a retry succeeds, and with undefined
 * once the user leaves the sheet — so the caller can carry on as if the
 * operation had never failed.
 */
function showDeviceVerificationSheet<T>(error: any, options?: TScoreErrorPopupOptions<T>) {
    const { retry, onDismiss = NavigationService.goBack, source = 'unknown' } = options ?? {}
    const { cause } = error ?? {}

    return new Promise<T | undefined>(resolve => {
        appEventsEmitter.emit('presentDeviceVerificationSheet', {
            retry:
                retry &&
                (async () => {
                    const result = await retry()
                    resolve(result)
                    return result
                }),
            onDismiss: () => {
                resolve(undefined)
                onDismiss()
            },
            source,
            cause: typeof cause === 'string' ? cause : undefined,
        })
    })
}

async function showTryAgainPopup(
    code: string | undefined,
    status: string | undefined,
    onGoBack: () => void,
) {
    let message = translate('native.alerts.try_again.description')
    if (status) message += `\nstatus: ${status}`
    if (code) message += `\ncode: ${code}`
    const id = await presentAlert({
        rawTitle: translate('native.alerts.try_again.title'),
        rawMessage: message,
        buttons: [{ rawText: translate('native.sets.go_back'), style: 'default', id: 'goBack' }],
    })
    if (id === 'goBack') onGoBack()
}

const REPEAT_WINDOW_MS = 10_000

let lastReport: { key: string; at: number } | undefined

/**
 * Score Info asks for the score twice in a row — its own info, then the preview
 * through openScore — and a broken answer fails both the same way, so every such
 * open arrived in Sentry twice.
 */
const isRepeatedReport = (error: any) => {
    const key = `${error?.message}|${error?.cause}|${error?.status}`
    const now = Date.now()
    const isRepeated = lastReport?.key === key && now - lastReport.at < REPEAT_WINDOW_MS
    lastReport = { key, at: now }
    return isRepeated
}

export async function showFetchScoreInfoErrorsPopup<T = unknown>(
    error: any,
    options?: TScoreErrorPopupOptions<T>,
): Promise<T | undefined> {
    if (!isRepeatedReport(error)) SentryUtils.sendMessage('openScore', error)
    if (error instanceof Error && (error as any).webScoreFailure) {
        return new Promise<T | undefined>(resolve => {
            Alert.alert(translate('native.score.error_opening_file'), error.message, [
                { text: translate('native.sets.go_back'), style: 'cancel', onPress: () => {
                    ;(options?.onDismiss || NavigationService.goBack)()
                    resolve(undefined)
                } },
                ...(options?.retry ? [{ text: translate('native.actions.retry'), onPress: async () => {
                    try { resolve(await options.retry!()) }
                    catch (nextError) { resolve(await showFetchScoreInfoErrorsPopup(nextError, options)) }
                } }] : []),
            ], {cancelable: false})
        })
    }
    const code = await responseCode(error)
    const status = error.status?.toString() ?? '888'

    // 422 на пустой параметр f (аттестационный токен), code device.attestation_failed;
    // Отдельно — отказ самой аттестации: attestApp() вызывается изнутри
    // onPassAttestation, и его ошибка заменяет исходный 422, так что code сюда
    // уже не доходит. Для юзера это то же самое: устройство не проходит проверку.
    if (
        platform.isAndroid &&
        (code === ApiErrorCodes.deviceAttestationFailed || isAttestationFailure(error))
    ) {
        return showDeviceVerificationSheet(error, options)
    }
    // 403, когда приходит GET-параметр usage = 'offline' и текущий юзер не зарегистрирован или не имеет про-доступа, дефолтный code global.forbidden;
    if (code === 'global.forbidden') {
        showAlertNotification({ text: translate('native.score.error_forbidden') })
        NavigationService.goBack()
        return
    }
    // 429, когда слишком много запросов (там несколько разных лимитов, кратко- и долгосрочные), дефолтный code global.too_many_requests;
    if (code === 'global.too_many_requests') {
        showAlertNotification({ text: translate('native.alertNotifications.tooManyRequests') })
        NavigationService.goBack()
        return
    }

    // 404, когда скор не найден (дефолтный код global.not_found);
    if (code === 'global.not_found') {
        showAlertNotification({ text: translate('native.new_search.not_found') })
        NavigationService.goBack()
        return
    }

    // 403, когда скор официальный, а у юзера нет Pro Plus, code user.pro_plus_subscription_required
    if (code === 'user.pro_plus_subscription_required') {
        NavigationService.navigate(Screen.screenLongLanding, {
            isOfficialScore: true,
        })
        return
    }

    // 403, когда скор запрещён к показу в стране юзера, code score.country_blocked;
    if (code === 'score.country_blocked') {
        Alert.alert(translate('native.score.error_country_blocked'), undefined, [
            {
                text: translate('native.actions.okay'),
                onPress: NavigationService.goBack,
            },
        ])
        return
    }

    if ('message' in error) {
        let { message } = error
        if (message === 'User did not share') return
        if (message === 'downloadFile2') message = translate('native.score.error_download_file')
        if (message === ApiErrorCodes.globalErrorParseResponse)
            message = translate('native.score.error_cannot_open')
        if ('code' in error) {
            message = `${message}\ncode: ${error.code}`
        }
        if (code !== ApiErrorCodes.unknown) message = `${message}\ncode: ${code}`
        const id = await presentAlert({
            rawTitle: translate('native.alerts.error_title'),
            rawMessage: message,
            cancelable: false,
            buttons: [
                { rawText: translate('native.actions.close'), style: 'default', id: 'close' },
            ],
        })
        if (id === 'close') NavigationService.goBack()
        return
    }

    showTryAgainPopup(code, status, NavigationService.goBack)
}
