import { memo, useEffect } from 'react'

import {
    billingThunks,
    findByProductId,
    getAvailablePurchases,
    isIapConnectionError,
    marketingStoreChunk,
    useIAP,
    withIapConnection,
} from '@mu-native/marketing'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import SentryUtils from '../../../App/Utils/Sentry'

/**
 * These checks grant nothing and revoke nothing, so a store connection that
 * never came up costs the user nothing — the next foreground runs them again.
 * Reporting it only buried the real failures (MUP-14220).
 */
const reportUnlessConnectionLost = (methodName: string, error: unknown) => {
    if (isIapConnectionError(error)) return

    SentryUtils.sendMessage(methodName, error)
}

export const CheckRestoreSubscriptionsContainer = memo(() => {
    const { connected } = useIAP()
    const [
        currentSubscriptionProInfo,
        currentSubscriptionOffScoresInfo,
        currentSubscriptionLearnInfo,
        currentSubscriptionEbookInfo,
        currentSubscriptionLearnLiteInfo,
        isPro,
        isOffScores,
        isCourses,
        isLearnLite,
        appState,
        subscriptionsForRestore,
        network,
        isEbookRights,
    ] = useValues([
        marketingStoreChunk.props.getCurrentSubscriptionProInfo,
        marketingStoreChunk.props.getCurrentSubscriptionOffScoresInfo,
        marketingStoreChunk.props.getCurrentSubscriptionLearnInfo,
        marketingStoreChunk.props.getCurrentSubscriptionEbookInfo,
        marketingStoreChunk.props.getCurrentSubscriptionLearnLiteInfo,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
        marketingStoreChunk.props.getIsLearnLiteSubscriptionActive,
        systemStoreChunk.props.getAppState,
        marketingStoreChunk.props.getSubscriptionsForRestore,
        systemStoreChunk.props.getNetwork,
        marketingStoreChunk.props.getIsEbookRights,
    ])
    const actions = useActions({
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        setSubscriptionsForRestore: marketingStoreChunk.actions.setSubscriptionsForRestore,
        checkCancelSubscriptionThunk: billingThunks.checkCancelSubscriptionThunk,
        checkStatusSubscriptionThunk: billingThunks.checkStatusSubscriptionThunk,
    })

    useEffect(() => {
        if (!network) return
        if (!connected) return
        if (appState !== 'active') return

        const hasInfo =
            currentSubscriptionProInfo ||
            currentSubscriptionOffScoresInfo ||
            currentSubscriptionLearnInfo ||
            currentSubscriptionEbookInfo

        if (!hasInfo) return
        ;(async () => {
            // `connected` is state from useIAP and this effect re-runs on
            // appState, so it can still read true against a connection the OS
            // tore down in the background (MUP-14220).
            const availablePurchases = await withIapConnection(() =>
                getAvailablePurchases({ alsoPublishToEventListenerIOS: false }),
            )
            const planNamesForRestore: (
                | 'ebook'
                | 'offScores'
                | 'pro'
                | 'learning'
                | 'learningLite'
            )[] = []
            if (isEbookRights && currentSubscriptionEbookInfo?.productId) {
                const ebookPurchase = findByProductId(
                    availablePurchases,
                    currentSubscriptionEbookInfo.productId,
                )

                if (ebookPurchase) planNamesForRestore.push('ebook')
            }

            if (isOffScores && currentSubscriptionOffScoresInfo?.productId) {
                const offScoresPurchase = findByProductId(
                    availablePurchases,
                    currentSubscriptionOffScoresInfo.productId,
                )

                if (offScoresPurchase) planNamesForRestore.push('offScores')
            }

            if (isPro && currentSubscriptionProInfo?.productId) {
                const proPurchase = findByProductId(
                    availablePurchases,
                    currentSubscriptionProInfo.productId,
                )

                if (proPurchase) planNamesForRestore.push('pro')
            }

            if (isCourses && currentSubscriptionLearnInfo?.productId) {
                const learnPurchase = findByProductId(
                    availablePurchases,
                    currentSubscriptionLearnInfo.productId,
                )

                if (learnPurchase) planNamesForRestore.push('learning')
            }

            if (isLearnLite && currentSubscriptionLearnLiteInfo?.productId) {
                const learnPurchase = findByProductId(
                    availablePurchases,
                    currentSubscriptionLearnLiteInfo.productId,
                )

                if (learnPurchase) planNamesForRestore.push('learningLite')
            }

            if (planNamesForRestore.length) {
                actions.checkCancelSubscriptionThunk({ planNames: planNamesForRestore })
            }
        })().catch(error => reportUnlessConnectionLost('checkRestoreSubscriptions', error))
    }, [
        appState,
        currentSubscriptionProInfo,
        currentSubscriptionOffScoresInfo,
        currentSubscriptionLearnInfo,
        connected,
        network,
    ])

    useEffect(() => {
        if (!connected) return
        if (!network) return
        if (appState !== 'active') return
        if (!subscriptionsForRestore.length) return
        ;(async () => {
            const availablePurchases = await withIapConnection(() =>
                getAvailablePurchases({ alsoPublishToEventListenerIOS: false }),
            )
            const subscriptionForRestore = subscriptionsForRestore.find(
                subscription => !!subscription?.sourceRestore,
            )

            actions.setSubscriptionsForRestore(
                subscriptionsForRestore.filter(
                    item => !!findByProductId(availablePurchases, item?.productId),
                ),
            )
            if (subscriptionForRestore)
                actions.checkStatusSubscriptionThunk({ subscriptionForRestore })
        })().catch(error => reportUnlessConnectionLost('restoreSubscriptionsForRestore', error))
    }, [appState, connected, network])

    return null
})
