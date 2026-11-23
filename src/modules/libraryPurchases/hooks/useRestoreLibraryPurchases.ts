import { useCallback, useEffect, useState } from 'react'

import { APIStatusCodes, isResponse } from '@mu-native/api'
import { showAlertNotification } from '@mu-native/ds'
import {
    emailVerificationStoreChunk,
    useLoadEmailVerificationStoreChunk,
} from '@mu-native/email-verification'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import Sentry from '../../../App/Utils/Sentry'
import { restoreLibraryPurchasesRequest } from '../api/restoreLibraryPurchasesApi'
import {
    libraryPurchasesStoreChunk,
    RESTORE_CHECK_WINDOW_MS,
} from '../store/libraryPurchasesStoreChunk'
import { useLoadLibraryPurchasesStoreChunk } from '../store/useLoadLibraryPurchasesStoreChunk'

/** How often the purchased list is re-queried while a check is pending on-screen. */
const RESTORE_POLL_INTERVAL_MS = 30 * 1000

type TParams = {
    /**
     * Current purchased-list total (server-side count). While a check is
     * pending, an increase over the total recorded at the tap means the
     * restore delivered — the success toast is shown and the spinner stops
     * early. Pass it only when the value reflects the purchased list.
     */
    currentCount?: number
    /**
     * Refetches the purchased list. Called after the backend accepts the
     * resync (`status: queued`) and then every `RESTORE_POLL_INTERVAL_MS`
     * while the check window is active and this surface stays mounted — the
     * resync has no completion signal, so this is what makes the success
     * toast fire for a user waiting on the screen.
     */
    refreshPurchasedList?: () => void | Promise<void>
}

/**
 * Trigger for the SMP/SMD "Restore purchase" flow, backed by
 * POST /v2/library/resync (MUP-13967). The resync is queued with no SLA, so
 * after a tap the "Checking for purchases" state stays on for
 * `RESTORE_CHECK_WINDOW_MS` — the pending state lives in the store and
 * survives leaving/revisiting the screen. Delivery is detected by the
 * purchased-list total growing (poll while on-screen, plus the screens' own
 * focus / pull-to-refresh refetches).
 */
export const useRestoreLibraryPurchases = ({
    currentCount,
    refreshPurchasedList,
}: TParams = {}) => {
    useLoadLibraryPurchasesStoreChunk()
    useLoadEmailVerificationStoreChunk()

    const { startRestoreCheck, finishRestoreCheck } = useActions({
        startRestoreCheck: libraryPurchasesStoreChunk.actions.startRestoreCheck,
        finishRestoreCheck: libraryPurchasesStoreChunk.actions.finishRestoreCheck,
    })
    const [requestedAt, countAtRequest, isNeedVerifyEmail] = useValues([
        libraryPurchasesStoreChunk.props.getRestoreRequestedAt,
        libraryPurchasesStoreChunk.props.getPurchasedCountAtRequest,
        emailVerificationStoreChunk.props.getIsNeedVerifyEmail,
    ])

    // The backend matches external purchases by verified email, and a resync
    // for an unverified account burns the hourly limit while doing nothing —
    // hide the restore UI until the email is confirmed (backend memo, MUP-13967).
    const isRestoreAvailable = isNeedVerifyEmail !== true

    const isRestoring = requestedAt != null && Date.now() - requestedAt < RESTORE_CHECK_WINDOW_MS

    // Re-render when the check window lapses so the spinner turns back into the link.
    const [, setWindowLapsedTick] = useState(0)
    useEffect(() => {
        if (requestedAt == null) return undefined
        const remainingMs = requestedAt + RESTORE_CHECK_WINDOW_MS - Date.now()
        if (remainingMs <= 0) return undefined
        const timer = setTimeout(() => setWindowLapsedTick(tick => tick + 1), remainingMs)
        return () => clearTimeout(timer)
    }, [requestedAt])

    // New purchases landed while checking → success toast, stop the spinner early.
    useEffect(() => {
        if (!isRestoring || currentCount == null || countAtRequest == null) return
        if (currentCount > countAtRequest) {
            finishRestoreCheck()
            showAlertNotification({
                title: translate('native.orders.restore_purchase_toast'),
                position: 'bottom',
            })
        }
    }, [currentCount, countAtRequest, isRestoring, finishRestoreCheck])

    // The queued resync never reports back — while the user waits on this
    // surface, re-query the list so a delivered score is noticed (and the
    // toast above fires) without requiring a manual pull-to-refresh.
    useEffect(() => {
        if (!isRestoring || !refreshPurchasedList) return undefined
        const interval = setInterval(() => {
            refreshPurchasedList()
        }, RESTORE_POLL_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [isRestoring, refreshPurchasedList])

    const restorePurchases = useCallback(async () => {
        if (isRestoring) return
        startRestoreCheck({ requestedAt: Date.now(), purchasedCount: currentCount ?? null })

        try {
            await restoreLibraryPurchasesRequest()
            await refreshPurchasedList?.()
        } catch (error) {
            // The trigger failed — bring the link back so the user can retry.
            finishRestoreCheck()
            if (isResponse(error) && error.status === APIStatusCodes.rateLimit) {
                // Resync is limited to 1 request per sliding hour — expected, not an error.
                showAlertNotification({
                    title: translate('native.alertNotifications.tooManyRequests'),
                    position: 'bottom',
                })
                return
            }
            Sentry.sendMessage('restoreLibraryPurchasesError', error)
        }
    }, [isRestoring, currentCount, refreshPurchasedList, startRestoreCheck, finishRestoreCheck])

    return { isRestoring, isRestoreAvailable, restorePurchases }
}
