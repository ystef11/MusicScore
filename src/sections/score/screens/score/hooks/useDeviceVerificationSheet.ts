import { useCallback, useEffect, useRef, useState } from 'react'
import { Linking } from 'react-native'

import { NativeBottomSheetRef } from '@mu-native/ds'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { appEventsEmitter, type TDeviceVerificationSheetPayload } from '@mu-native/system'

import reportEvent from '../../../../../App/Utils/Analytics'

export const DEVICE_VERIFICATION_HELP_URL =
    'https://help.musescore.com/en/articles/8535950-bug-your-device-hasn-t-been-verified-by-google-play'

function sheetParams(payload: TDeviceVerificationSheetPayload) {
    return {
        'params.key': ['source', 'cause'],
        'params.str_value': [payload.source, payload.cause ?? ''],
        'params.value': [0, 0],
    }
}

/**
 * The attestation wrapper carries the App Check text as its cause; its own
 * message is internal wording that says nothing about why the retry failed.
 */
function failureText(error: unknown) {
    const { cause, message } = (error ?? {}) as { cause?: unknown; message?: unknown }
    if (typeof cause === 'string') return cause

    return typeof message === 'string' ? message : ''
}

function retryResultParams(
    payload: TDeviceVerificationSheetPayload,
    isSuccess: boolean,
    error?: unknown,
) {
    return {
        'params.key': ['source', 'cause', 'success'],
        'params.str_value': [payload.source, payload.cause ?? '', failureText(error)],
        'params.value': [0, 0, isSuccess ? 1 : 0],
    }
}

export function useDeviceVerificationSheet() {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [payload, setPayload] = useState<TDeviceVerificationSheetPayload | undefined>()
    const [isRetrying, setIsRetrying] = useState(false)
    // A dismiss the retry asked for must not look like the user leaving.
    const isDismissedByRetry = useRef(false)

    useEffect(() => {
        if (payload) {
            sheetRef.current?.present()
            reportEvent(RT_EVENTS.SCORE_DEVICE_VERIFICATION_SHEET_SHOW, sheetParams(payload))
        }
        return appEventsEmitter.on('presentDeviceVerificationSheet', next => {
            isDismissedByRetry.current = false
            setIsRetrying(false)
            setPayload(next)
        })
    }, [payload])

    const onRetry = useCallback(async () => {
        if (!payload?.retry) return

        reportEvent(RT_EVENTS.SCORE_DEVICE_VERIFICATION_RETRY_CLICK, sheetParams(payload))
        setIsRetrying(true)
        try {
            await payload.retry()
            reportEvent(
                RT_EVENTS.SCORE_DEVICE_VERIFICATION_RETRY_RESULT,
                retryResultParams(payload, true),
            )
            isDismissedByRetry.current = true
            sheetRef.current?.dismiss()
        } catch (error) {
            reportEvent(
                RT_EVENTS.SCORE_DEVICE_VERIFICATION_RETRY_RESULT,
                retryResultParams(payload, false, error),
            )
            setIsRetrying(false)
        }
    }, [payload])

    const onLearnMore = useCallback(() => {
        if (payload) {
            reportEvent(RT_EVENTS.SCORE_DEVICE_VERIFICATION_LEARN_MORE_CLICK, sheetParams(payload))
        }
        Linking.openURL(DEVICE_VERIFICATION_HELP_URL)
    }, [payload])

    const onDismiss = useCallback(() => {
        const byRetry = isDismissedByRetry.current
        isDismissedByRetry.current = false
        setIsRetrying(false)
        setPayload(undefined)
        if (byRetry || !payload) return

        reportEvent(RT_EVENTS.SCORE_DEVICE_VERIFICATION_SHEET_DISMISS, sheetParams(payload))
        payload.onDismiss()
    }, [payload])

    return { payload, isRetrying, sheetRef, onRetry, onLearnMore, onDismiss }
}
