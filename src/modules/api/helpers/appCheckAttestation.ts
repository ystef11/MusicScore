/**
 * Attestation always asks App Check for a fresh token: the backend rejects a
 * reused `jti` as a replay, so the network and the attestation providers are on
 * the critical path of every call. Anything transient on that path — no route to
 * Google, a captive portal answering with HTML, Play Integrity asking us to back
 * off or its service dying mid-call — used to end the attestation on the first
 * try (MUP-14196). On Android that means the score does not open at all.
 */

/**
 * Both lists below hold only conditions that a later attempt can plausibly
 * resolve. A rejected integrity verdict is not one of them: retrying cannot
 * change the answer, and hiding it would hide a real failure.
 *
 * Wording that names its own source — Play Integrity states the code it failed
 * with, so it reads correctly without any further context.
 */
const SELF_EVIDENT_SIGNATURES = [
    // Play Integrity CLIENT_TRANSIENT_ERROR, verbatim: "Retry with an
    // exponential backoff."
    'CLIENT_TRANSIENT_ERROR',
    'transient error on the calling device',
    // Play Integrity NETWORK_ERROR / GOOGLE_SERVER_UNAVAILABLE. The latter is
    // worded two ways depending on the Play Services build.
    'unable to obtain integrity details',
    'Google server is unavailable',
    'Unknown internal Google server error',
    // Play Integrity INTERNAL_ERROR, which Google's own guidance is to retry.
    'Integrity API error (-100)',
    // Play Integrity TOO_MANY_REQUESTS: transient for Sentry's purposes, but
    // see RATE_LIMIT_SIGNATURES for why it is not retried.
    'Integrity API error (-8)',
]

/**
 * Wording common enough to appear in unrelated failures, so it only counts
 * alongside the App Check marker below.
 */
const AMBIGUOUS_SIGNATURES = [
    // okhttp could not reach firebaseappcheck.googleapis.com.
    'Failed to connect to',
    'Unable to resolve host',
    'Software caused connection abort',
    'Connection reset',
    'Connection timed out',
    'unexpected end of stream',
    // DeviceCheck exchange rate limit — our own attestations queued up.
    'Too many attempts',
    // A captive portal or an ISP interstitial answered with a page, not JSON.
    '<!DOCTYPE',
    // The Play Integrity service process died while we were bound to it.
    'Binder has died',
    // Firebase's own wording for a failed request to its backend. The
    // surrounding Foundation text is localised to the device language, this
    // part is not.
    'API request error',
    // Firebase App Check's backend answering 500 / 503 (Android wording).
    'Internal error encountered',
    'The service is currently unavailable',
]

/**
 * Transient, but a retry within seconds is exactly what the provider asked us
 * not to do: it burns the quota further and, in the 2.14.49 data, recovered 3
 * users out of 46. These stay out of Sentry like any transient failure, but
 * the attestation gives up on the first attempt and lets the user decide.
 */
const RATE_LIMIT_SIGNATURES = ['Too many attempts', 'TOO_MANY_REQUESTS']

const readText = (error: unknown): string => {
    if (!error) return ''
    if (typeof error === 'string') return error

    const { message, cause } = error as { message?: unknown; cause?: unknown }

    return [message, cause].filter(part => typeof part === 'string').join(' ')
}

/** `@react-native-firebase/app-check` prefixes every rejection it produces. */
const APP_CHECK_MARKER = 'appCheck/'

export const isTransientAppCheckError = (error: unknown): boolean => {
    const text = readText(error)
    if (!text) return false

    if (SELF_EVIDENT_SIGNATURES.some(signature => text.includes(signature))) return true

    // This predicate also decides what Sentry drops, so the broad wording only
    // counts when the error says it came from App Check.
    return (
        text.includes(APP_CHECK_MARKER) &&
        AMBIGUOUS_SIGNATURES.some(signature => text.includes(signature))
    )
}

/**
 * App Check's backend refusing this device: an uncertified or rooted Android, an
 * Amazon tablet without Play, an iPad too old for DeviceCheck. The user is told
 * through the verification sheet; there is nothing for us to fix.
 */
export const isAttestationVerdict = (error: unknown): boolean => {
    const text = readText(error)
    return text.includes(APP_CHECK_MARKER) && text.includes('App attestation failed')
}

export const isRateLimitedAppCheckError = (error: unknown): boolean => {
    const text = readText(error)
    return (
        text.includes(APP_CHECK_MARKER) &&
        RATE_LIMIT_SIGNATURES.some(signature => text.includes(signature))
    )
}

/** Two retries, ~2s of added wait in the worst case — the user is waiting. */
export const RETRY_DELAYS_MS = [500, 1500]

const wait = (ms: number) =>
    new Promise(resolve => {
        setTimeout(resolve, ms)
    })

export type TAutoRetryOutcome = {
    /** Attempts made in total, the first one included. */
    attempts: number
    success: boolean
    /** The last failure seen: the one recovered from, or the one given up on. */
    error: unknown
}

export type TAutoRetryListener = (outcome: TAutoRetryOutcome) => void

/**
 * Runs an attestation call, retrying it with a growing delay while it fails for
 * a transient reason. Anything else is rethrown on the first attempt — this
 * waits out infrastructure, it does not paper over a refusal.
 *
 * The listener hears only about calls that were actually retried, so it can
 * measure how often the retry rescues the attestation and from what.
 */
export const withAppCheckRetry = async <T>(
    operation: () => Promise<T>,
    onRetried?: TAutoRetryListener,
): Promise<T> => {
    let lastError: unknown
    for (let attempt = 0; ; attempt += 1) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const result = await operation()
            if (attempt > 0) onRetried?.({ attempts: attempt + 1, success: true, error: lastError })
            return result
        } catch (error) {
            const canRetry =
                attempt < RETRY_DELAYS_MS.length &&
                isTransientAppCheckError(error) &&
                !isRateLimitedAppCheckError(error)
            if (!canRetry) {
                if (attempt > 0) onRetried?.({ attempts: attempt + 1, success: false, error })
                throw error
            }
            lastError = error

            // eslint-disable-next-line no-await-in-loop
            await wait(RETRY_DELAYS_MS[attempt])
        }
    }
}

/** Long enough for the backend's replay window on the previous `jti` to close. */
export const REPEAT_ATTESTATION_DELAY_MS = 1000

type TAttestedRequest<T> = {
    attest: () => Promise<unknown>
    request: () => Promise<T>
    /** Whether the request failed because the backend rejected the token. */
    isRejected: (error: unknown) => Promise<boolean> | boolean
    onRepeated?: TAutoRetryListener
}

/**
 * Attests, then runs the request. When the backend rejects the token that was
 * minted a moment ago, mints one more after a pause and tries once again: in
 * the 2.14.49 data a second fresh token passed for most such users, who until
 * now had to ask for it by hand from the verification sheet.
 */
export const requestWithAttestation = async <T>({
    attest,
    request,
    isRejected,
    onRepeated,
}: TAttestedRequest<T>): Promise<T> => {
    await attest()
    try {
        return await request()
    } catch (error) {
        if (!(await isRejected(error))) throw error

        await wait(REPEAT_ATTESTATION_DELAY_MS)
        await attest()
        try {
            const result = await request()
            onRepeated?.({ attempts: 2, success: true, error })
            return result
        } catch (repeatError) {
            onRepeated?.({ attempts: 2, success: false, error: repeatError })
            throw repeatError
        }
    }
}

/**
 * Android has no App Attest fallback, so a failure here is where attestation
 * ends: the score never opens. The flag is what tells the popup layer it is
 * looking at a device that cannot be verified — the message itself is internal
 * wording and was never meant for the user.
 */
type TAttestationError = Error & { attestationFailed?: true }

export const createAttestationError = (cause: string): Error => {
    const error: TAttestationError = new Error('Fallback error check error', { cause })
    error.attestationFailed = true
    return error
}

export const isAttestationFailure = (error: unknown): boolean =>
    (error as TAttestationError | null)?.attestationFailed === true
