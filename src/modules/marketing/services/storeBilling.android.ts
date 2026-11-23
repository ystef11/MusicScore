import { Linking } from 'react-native'
import type * as Billing from 'react-native-iap'

export type * from 'react-native-iap'

export const ErrorCode = {
    InitConnection: 'init-connection',
    UserCancelled: 'user-cancelled',
} as const

const unavailable = async (..._args: unknown[]): Promise<never> => {
    throw Object.assign(new Error('Покупки Google Play отключены в этой сборке.'), {
        code: 'billing-unavailable',
    })
}
const noListener = (..._args: unknown[]) => ({ remove: () => undefined })
const state = {
    connected: false,
    subscriptions: [],
    products: [],
    availablePurchases: [],
    fetchProducts: unavailable,
    requestPurchase: unavailable,
    finishTransaction: unavailable,
} as unknown as ReturnType<typeof Billing.useIAP>

export const useIAP = (..._args: unknown[]) => state
export const initConnection = async () => false
export const endConnection = async () => undefined
export const purchaseUpdatedListener: typeof Billing.purchaseUpdatedListener = noListener
export const purchaseErrorListener: typeof Billing.purchaseErrorListener = noListener
export const getAvailablePurchases: typeof Billing.getAvailablePurchases = unavailable
export const requestPurchase: typeof Billing.requestPurchase = unavailable
export const finishTransaction: typeof Billing.finishTransaction = unavailable
export const clearTransactionIOS = unavailable
export const validateReceipt = unavailable
export const getReceiptIOS = unavailable
export const presentCodeRedemptionSheetIOS = unavailable
export const isEligibleForIntroOfferIOS: typeof Billing.isEligibleForIntroOfferIOS = unavailable
export const getStorefront: typeof Billing.getStorefront = unavailable

export const deepLinkToSubscriptions = async (options?: { skuAndroid?: string }) => {
    const params = new URLSearchParams({ package: 'com.musescore.client' })
    if (options?.skuAndroid) params.set('sku', options.skuAndroid)
    await Linking.openURL(`https://play.google.com/store/account/subscriptions?${params}`)
}
