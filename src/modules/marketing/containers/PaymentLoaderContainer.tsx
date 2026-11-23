import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { Loader } from '@mu-native/ds'
import { useValues } from '@ug/store'

import marketingStoreChunk from '../store/marketingStoreChunk'

const styles = StyleSheet.create({
    zIndex100: { zIndex: 100 },
})
export const PaymentLoaderContainer = memo(() => {
    const [isPaymentInProgress] = useValues([marketingStoreChunk.props.getIsPaymentInProgress])

    if (!isPaymentInProgress) return null
    return <Loader style={styles.zIndex100} />
})
