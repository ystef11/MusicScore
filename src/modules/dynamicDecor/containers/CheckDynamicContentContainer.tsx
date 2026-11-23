import { memo, useEffect } from 'react'

import { useActions, useValues } from '@ug/store'

import { dynamicDecorStoreChunk } from '../store/dynamicDecorStoreChunk'
import { dynamicDecorThunks } from '../store/dynamicDecorThunks'

const CheckDynamicContentContainer = () => {
    const actions = useActions({
        getPromotionalPeriods: dynamicDecorThunks.getPromotionalPeriods,
        getActiveDecorAssetsData: dynamicDecorThunks.getActiveDecorAssets,
    })
    const [decors] = useValues([dynamicDecorStoreChunk.props.getDecors])

    useEffect(() => {
        if (decors?.[0]?.saleOfferId)
            actions.getActiveDecorAssetsData({
                id: decors[0].saleOfferId,
            })
    }, [decors])

    return null
}

export default memo(CheckDynamicContentContainer)
