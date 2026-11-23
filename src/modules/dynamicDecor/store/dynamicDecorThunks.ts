import { handleError } from '@mu-native/api'
import { TThunkAction } from '@mu-native/common'

import { dynamicDecorServices } from '../services/dynamicDecorServices'

import { dynamicDecorStoreChunk } from './dynamicDecorStoreChunk'

const getPromotionalPeriods: TThunkAction = () => async dispatch => {
    try {
        const periods = await dynamicDecorServices.getPromotionalPeriods()
        if (periods?.length) {
            dispatch(dynamicDecorStoreChunk.actions.setDecors(periods))
        }
    } catch (error) {
        handleError(error)
    }
}

const getActiveDecorAssets: TThunkAction<{ id: number }> =
    ({ id }) =>
    async dispatch => {
        try {
            const decorData = await dynamicDecorServices.getActiveDecorAssets({ id })
            const decorDataSettings = JSON.parse(decorData.settings)

            if (decorDataSettings?.stockName)
                dispatch(
                    dynamicDecorStoreChunk.actions.setActiveDecorData({
                        ...decorData,
                        ...JSON.parse(decorData.settings),
                    }),
                )
        } catch (error) {
            handleError(error)
        }
    }

export const dynamicDecorThunks = {
    getPromotionalPeriods,
    getActiveDecorAssets,
}
