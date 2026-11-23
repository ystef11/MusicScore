import { isNetworkError } from '../../modules/muse-native-api/apiError'

type TSentryEventShape = {
    exception?: { values?: { type?: string; value?: string; mechanism?: { type?: string } }[] }
}

/**
 * Only what `initConnection` itself throws. The other two wordings around the
 * store connection — `init-connection` and `Connection not initialized` — come
 * from any store call made while the connection is down (getAvailablePurchases,
 * requestPurchase, finishTransaction). One of those arriving unhandled means a
 * purchase flow lost its error, which is the opposite of noise.
 */
const INIT_CONNECTION_SIGNATURE = 'Failed to initialize connection'

/**
 * `useIAP` calls `initConnection` from an effect without a catch, so on a device
 * where the billing client cannot start — no Google Play services, which is what
 * ANDROID-15QS is: Huawei and other Play-less devices — the rejection reaches
 * Sentry as an unhandled one. There is nothing to fix on our side and nothing
 * broke for the user: they were not buying anything, the store simply is not
 * there.
 *
 * Only unhandled rejections are dropped. A report we chose to send from a catch
 * of our own means a store call we cared about failed, and that still matters
 * (MUP-14303, MUP-14312).
 */
export const isIapConnectionNoise = (event: TSentryEventShape): boolean =>
    // Any entry, not just the first: @sentry/core prepends the links of a cause
    // chain, so the rejection itself can end up further down the list.
    (event?.exception?.values ?? []).some(
        exception =>
            exception.mechanism?.type === 'onunhandledrejection' &&
            !!exception.value?.includes(INIT_CONNECTION_SIGNATURE),
    )

/**
 * A request nobody was awaiting, cut by our own AbortController at
 * API_REQUEST_TIMEOUT or dropped by the network: the SDK's global handler
 * reports it directly, so it never passes sendMessage, which is where
 * isNetworkRelatedError decides what to drop (MUP-14457).
 *
 * Unhandled rejections only, for the same reason as above: a report sent from a
 * catch of our own means a caller cared about that request.
 */
export const isUnhandledNetworkNoise = (event: TSentryEventShape): boolean => {
    const values = event?.exception?.values ?? []
    if (!values.some(exception => exception.mechanism?.type === 'onunhandledrejection')) {
        return false
    }

    // The abort and the url wrapper are separate links of the same chain, so the
    // network one is not necessarily the link carrying the mechanism.
    return values.some(exception =>
        isNetworkError({ name: exception.type, message: exception.value }),
    )
}
