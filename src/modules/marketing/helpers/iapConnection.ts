import { ErrorCode, initConnection } from '../services/storeBilling'

/**
 * The store connection is established by the `useIAP()` hook, which lives in a
 * few containers. Thunks call the SDK directly and can run before that hook has
 * connected — or after the connection dropped while the app was backgrounded —
 * and every such call is rejected with "Connection not initialized"
 * (MUP-14164). Reconnect and retry once instead of losing the purchase.
 */

const CONNECTION_ERROR_MARKERS = ['init-connection', 'Connection not initialized']

/**
 * The rejection arrives in several shapes: a PurchaseError carrying `code`, and
 * a raw native error whose message holds the serialized payload
 * (`Error Domain=com.margelo.nitro.rniap ... {"code":"init-connection",...}`).
 */
export const isIapConnectionError = (error: unknown): boolean => {
    if (!error) return false

    const { code } = error as { code?: unknown }
    if (code === ErrorCode.InitConnection) return true

    const message =
        typeof error === 'string' ? error : String((error as { message?: unknown }).message ?? '')

    return CONNECTION_ERROR_MARKERS.some(marker => message.includes(marker))
}

/**
 * Delays before each further reconnect attempt. The first one is immediate, so
 * a connection that is simply down is restored without a visible pause.
 */
const RECONNECT_DELAYS_MS = [0, 300, 900]

const wait = (ms: number) =>
    new Promise<void>(resolve => {
        setTimeout(resolve, ms)
    })

/**
 * One reconnect attempt is not enough on iOS: `initConnection` resolves `false`
 * instead of throwing when it fails, and resolves `true` right away while
 * another caller is still establishing the connection (`HybridRnIap.swift`,
 * which has no single-flight await unlike Android). Either result can leave the
 * retry running against a connection that is not ready, so back off and try
 * again before giving up (MUP-14220).
 */
const reconnectAndRetry = async <T>(
    operation: () => Promise<T>,
    error: unknown,
    attempt = 0,
): Promise<T> => {
    if (attempt >= RECONNECT_DELAYS_MS.length) throw error

    const delay = RECONNECT_DELAYS_MS[attempt]
    if (delay) await wait(delay)

    // initConnection is idempotent: with a live connection it resolves
    // without reconnecting, so this is safe on a stale-state false positive.
    if (!(await initConnection())) return reconnectAndRetry(operation, error, attempt + 1)

    try {
        return await operation()
    } catch (retryError) {
        if (!isIapConnectionError(retryError)) throw retryError

        return reconnectAndRetry(operation, retryError, attempt + 1)
    }
}

/**
 * Runs a store call, and if it fails only because the connection was not up,
 * establishes it and runs the call again. Any other failure is rethrown
 * untouched — this guards the connection, not the operation.
 */
export const withIapConnection = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
        return await operation()
    } catch (error) {
        if (!isIapConnectionError(error)) throw error

        return reconnectAndRetry(operation, error)
    }
}
