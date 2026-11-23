import { createExtendedStoreChunk } from '@ug/store'

/** The 429 body carries no unblock time — the backend throttle is 10 minutes. */
export const RESEND_FALLBACK_BLOCK_MS = 10 * 60 * 1000

type TEmailVerificationState = {
    /**
     * Backend `is_need_verify_email`: true = show the verify toast.
     * null = unknown (not fetched yet / guest).
     */
    isNeedVerifyEmail: boolean | null
    isSendingVerificationEmail: boolean
    /**
     * Epoch ms until which the backend blocks another activation email
     * (`block_expires` of the last successful send; the limit is shared with
     * the website). While in the future, the toast shows the "link sent"
     * line instead of the tappable action. null = no known block.
     */
    resendBlockedUntil: number | null
}

// Deliberately not persisted: the flag is refetched on every launch/auth
// change, and persisting it would leak state across account switches.
export const emailVerificationStoreChunk = createExtendedStoreChunk<TEmailVerificationState>({
    storeKey: 'emailVerification',
    treeKey: 'modules',
})({
    persist: [],
    initialState: {
        isNeedVerifyEmail: null,
        isSendingVerificationEmail: false,
        resendBlockedUntil: null,
    },
    actions: {
        setIsNeedVerifyEmail: (isNeedVerifyEmail: boolean | null) => ({ isNeedVerifyEmail }),
        setIsSendingVerificationEmail: (isSendingVerificationEmail: boolean) => ({
            isSendingVerificationEmail,
        }),
        setResendBlockedUntil: (resendBlockedUntil: number | null) => ({ resendBlockedUntil }),
    },
})
