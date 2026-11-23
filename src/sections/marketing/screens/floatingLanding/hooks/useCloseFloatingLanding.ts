import { useCallback, useEffect, useRef } from 'react'

import { marketingStoreChunk, TProductId } from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

export const useCloseFloatingLanding = (activePlan?: TProductId) => {
    const navigation = useNavigation()
    const isPurchaseStartedRef = useRef(false)

    const [isPro, isOffScores, isCourses] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
    ])
    const rightsKey = `${isPro}-${isOffScores}-${isCourses}`
    const initialRightsKeyRef = useRef(rightsKey)

    const onClose = useCallback(() => {
        if (navigation.isFocused()) navigation.goBack()
    }, [navigation])

    const onPurchaseStart = useCallback(() => {
        isPurchaseStartedRef.current = true
    }, [])

    useEffect(() => {
        if (isPurchaseStartedRef.current && rightsKey !== initialRightsKeyRef.current) onClose()
    }, [rightsKey, onClose])

    useEffect(() => {
        if (!activePlan) onClose()
    }, [activePlan, onClose])

    return { onClose, onPurchaseStart }
}
