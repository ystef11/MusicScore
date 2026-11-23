const PLAY_SUBSCRIPTIONS = 'https://play.google.com/store/account/subscriptions'
const APPLE_SUBSCRIPTIONS = 'https://apps.apple.com/account/subscriptions'

/**
 * Where "FIX NOW" on the recover banner sends the user. The per-subscription
 * Play deep link needs the product id, and we do not always have it — the
 * banner is driven by the backend's payment-pending flag, which arrives whether
 * or not the store told us what was bought. Without it the store's own
 * subscriptions list is still the place the payment method is changed; an empty
 * string was not (ANDROID-15X4).
 */
export const subscriptionFixUrl = ({
    isGracePeriod,
    productId,
    isIos,
}: {
    isGracePeriod: boolean
    productId?: string | null
    isIos: boolean
}): string => {
    if (!productId) return isIos ? APPLE_SUBSCRIPTIONS : PLAY_SUBSCRIPTIONS

    const fixType = isGracePeriod ? 'fix' : 'restore'

    return `${PLAY_SUBSCRIPTIONS}/${fixType}?docId=subs:com.musescore.playerlite:${productId}`
}
