import { APIStatusCodes, isResponse } from '@mu-native/api'
import { getIsAuthorized } from '@mu-native/auth'
import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import Sentry from '../../../App/Utils/Sentry'
import { fetchUserMeRequest, resendVerificationEmailRequest } from '../api/emailVerificationApi'

import {
    emailVerificationStoreChunk,
    RESEND_FALLBACK_BLOCK_MS,
} from './emailVerificationStoreChunk'

type TDispatch = (...args: Array<any>) => any
type TGetState = (...args: Array<any>) => any

/**
 * Refresh `is_need_verify_email` for the current account from GET /user/me.
 * The backend owns the semantics (never activated OR changed address and not
 * confirmed; bans/deletions/consents excluded) — the client just mirrors the
 * flag. For guests it resets to "unknown" so the toast never shows.
 */
export const checkEmailVerificationStatusThunk = () => {
    return async (dispatch: TDispatch, getState: TGetState) => {
        if (!getIsAuthorized(getState())) {
            dispatch(emailVerificationStoreChunk.actions.setIsNeedVerifyEmail(null))
            return
        }

        try {
            const response = await fetchUserMeRequest()
            dispatch(
                emailVerificationStoreChunk.actions.setIsNeedVerifyEmail(
                    Boolean(response?.is_need_verify_email),
                ),
            )
        } catch (error) {
            Sentry.sendMessage('checkEmailVerificationStatusError', error)
        }
    }
}

/**
 * Resend the activation email (POST /v2/user/notification/email-activation).
 * A known block (`block_expires`, limit shared with the website) is what
 * switches the toast to its dismissible "link sent" confirmation.
 */
export const resendVerificationEmailThunk = () => {
    return async (dispatch: TDispatch, getState: TGetState) => {
        const state = getState()
        if (emailVerificationStoreChunk.props.getIsSendingVerificationEmail(state)) return

        // The action line is inactive while a block is known — safety no-op.
        const blockedUntil = emailVerificationStoreChunk.props.getResendBlockedUntil(state)
        if (blockedUntil != null && Date.now() < blockedUntil) return

        dispatch(emailVerificationStoreChunk.actions.setIsSendingVerificationEmail(true))
        try {
            const response = await resendVerificationEmailRequest()
            dispatch(
                emailVerificationStoreChunk.actions.setResendBlockedUntil(
                    response?.block_expires
                        ? response.block_expires * 1000
                        : Date.now() + RESEND_FALLBACK_BLOCK_MS,
                ),
            )
        } catch (error) {
            const status = isResponse(error) ? error.status : undefined

            if (status === APIStatusCodes.forbidden) {
                // Nothing to confirm (already verified / banned / deleted) —
                // our flag is stale: re-sync it, which also hides the toast.
                await dispatch(checkEmailVerificationStatusThunk())
                return
            }
            if (status === APIStatusCodes.rateLimit) {
                // A letter went out <10 min ago (possibly from the website).
                // The body has no unblock time — assume the full throttle.
                dispatch(
                    emailVerificationStoreChunk.actions.setResendBlockedUntil(
                        Date.now() + RESEND_FALLBACK_BLOCK_MS,
                    ),
                )
                return
            }
            if (status === APIStatusCodes.validationError) {
                // Sending failed on the backend — keep the action tappable.
                showAlertNotification({
                    title: translate('native.alertNotifications.tooManyRequests'),
                })
                return
            }
            Sentry.sendMessage('resendVerificationEmailError', error)
        } finally {
            dispatch(emailVerificationStoreChunk.actions.setIsSendingVerificationEmail(false))
        }
    }
}
