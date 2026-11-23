import { store } from '@mu-native/common'

import { marketingConstants } from '../constants/marketingConstants'
import marketingStoreChunk from '../store/marketingStoreChunk'

export const getTimerLeft = () => {
    const timerSale = marketingStoreChunk.props.getTimerTour(store.getState())
    if (timerSale)
        return (
            marketingConstants.fiveMin - marketingConstants.currentDateTimer - timerSale.getTime()
        )

    return null
}
