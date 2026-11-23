import { useEffect } from 'react'

import { TSubscription } from '@mu-native/marketing'

export const useClosePaymentScreen = ({
    subscriptions,
    callback,
}: {
    subscriptions: TSubscription[]
    callback: () => void
}) => {
    useEffect(() => {
        if (!subscriptions?.length) callback()
    }, [subscriptions])
}
