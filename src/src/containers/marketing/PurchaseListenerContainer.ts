import { memo, useEffect, useRef } from 'react'
import { ErrorCode, type Purchase } from '../../../modules/marketing/services/storeBilling'

import { getStoreValue } from '@mu-native/common'
import {
    billingThunks,
    marketingStoreChunk,
    purchaseErrorListener,
    purchaseUpdatedListener,
    useIAP,
} from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'

const getPurchaseKey = (purchase: Purchase) =>
    `${purchase.productId}_${purchase.transactionId ?? purchase.purchaseToken ?? ''}`

export const PurchaseListenerContainer = memo(() => {
    const { handleSubscriptionThunk, processPendingPurchaseThunk, setPartialFieldsCustom } =
        useActions({
            handleSubscriptionThunk: billingThunks.handleSubscriptionThunk,
            processPendingPurchaseThunk: billingThunks.processPendingPurchaseThunk,
            setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        })
    const [network] = useValues([systemStoreChunk.props.getNetwork])

    const purchaseQueueRef = useRef<Purchase[]>([])
    const handledPurchaseKeysRef = useRef<Set<string>>(new Set())
    const isProcessingRef = useRef(false)
    const isConnectedRef = useRef(false)

    const processQueue = async () => {
        if (isProcessingRef.current) return

        isProcessingRef.current = true
        try {
            while (purchaseQueueRef.current.length) {
                const currentPurchase = purchaseQueueRef.current.shift() as Purchase
                await handleSubscriptionThunk({ currentPurchase })
            }
        } finally {
            isProcessingRef.current = false
        }
    }

    const enqueuePurchase = (purchase: Purchase) => {
        const purchaseKey = getPurchaseKey(purchase)
        const hasUniqueTransactionIds = purchaseKey !== `${purchase.productId}_`

        const isDuplicate =
            hasUniqueTransactionIds && handledPurchaseKeysRef.current.has(purchaseKey)

        if (isDuplicate) return

        if (hasUniqueTransactionIds) handledPurchaseKeysRef.current.add(purchaseKey)
        purchaseQueueRef.current.push(purchase)
        processQueue()
    }

    // Not via useIAP callbacks: the hook drops its listeners when its own initConnection fails,
    // these stay registered and attach on any later successful initConnection.
    useEffect(() => {
        const purchaseUpdateSubscription = purchaseUpdatedListener(purchase => {
            enqueuePurchase(purchase)
        })
        const purchaseErrorSubscription = purchaseErrorListener(currentPurchaseError => {
            setPartialFieldsCustom({ isPaymentInProgress: false, checkoutProductId: '' })
            if (currentPurchaseError.code === ErrorCode.InitConnection && !isConnectedRef.current) {
                return
            }

            if (currentPurchaseError.code === ErrorCode.UserCancelled) {
                reportEvent(RT_EVENTS.LANDING_CHECKOUT_CLOSE, {
                    funnel_source: getStoreValue(marketingStoreChunk.props.getSource),
                })
            }

            reportEvent(MetricaEvents.BILLING_PURCHASE_ERROR, {
                error: currentPurchaseError?.code,
            })
        })

        return () => {
            purchaseUpdateSubscription.remove()
            purchaseErrorSubscription.remove()
        }
    }, [])

    const { connected } = useIAP()
    isConnectedRef.current = connected

    useEffect(() => {
        if (network?.isConnected && connected) {
            processPendingPurchaseThunk()
        }
    }, [network?.isConnected, connected])

    return null
})
