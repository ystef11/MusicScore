import { memo, useEffect } from 'react'

import { loadPaymentAccountId, marketingStoreChunk } from '@mu-native/marketing'
import { systemStoreChunk } from '@mu-native/system'
import { useValues, useActions } from '@ug/store'

export const UpdatePaymentAccountIdContainer = memo(() => {
    const [network, paymentAccountId] = useValues([
        systemStoreChunk.props.getNetwork,
        marketingStoreChunk.props.getPaymentAccountId,
    ])
    const actions = useActions({ loadPaymentAccountId })

    useEffect(() => {
        if (network?.isConnected && !paymentAccountId) {
            actions.loadPaymentAccountId()
        }
    }, [network?.isConnected, paymentAccountId])

    return null
})
