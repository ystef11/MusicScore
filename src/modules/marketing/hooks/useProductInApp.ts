import { useEffect, useMemo } from 'react'

import { useActions, useValues } from '@ug/store'

import { findByProductId } from '../helpers/findByProductId'
import { subscriptionHelpers } from '../helpers/subscriptionHelpers'
import { marketingStorage } from '../storage/marketingStorage'
import marketingStoreChunk from '../store/marketingStoreChunk'
import { type TInAppForSale, type TPlanType } from '../types/marketingTypes'

export const useProductInApp = (
    inAppItem?: TInAppForSale,
    planName?: TPlanType,
    forcePremiumPrice = false,
) => {
    const [products, inAppForSale, isOffScores, isPremium] = useValues([
        marketingStoreChunk.props.getProducts,
        marketingStoreChunk.props.getInAppForSale,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsPremiumRights,
    ])
    const actions = useActions({
        setInAppForSale: marketingStoreChunk.actions.setInAppForSale,
    })

    const productInApp = useMemo(
        () =>
            inAppItem
                ? findByProductId(
                      products,
                      subscriptionHelpers.getInAppIdByPrice(
                          inAppItem?.price,
                          isOffScores || isPremium || forcePremiumPrice,
                          planName,
                      ),
                  )
                : undefined,
        [products, inAppItem, isOffScores, isPremium, forcePremiumPrice, planName],
    )

    useEffect(() => {
        if (!inAppItem?.id) {
            marketingStorage.delete('scoreForSale')
            actions.setInAppForSale(null)
        } else {
            actions.setInAppForSale(inAppItem)
            marketingStorage.set('scoreForSale', inAppItem)
        }

        return () => {
            actions.setInAppForSale(null)
        }
    }, [inAppItem?.id])

    return useMemo(
        () => ({
            inAppInfo: {
                price: productInApp?.displayPrice || '',
                title: inAppForSale?.title || '',
                id: productInApp?.productId,
                scoreId: inAppForSale?.id,
                summary: productInApp?.summary || '',
            },
            productInApp,
        }),
        [productInApp, inAppForSale],
    )
}
