import { useRef, useEffect, memo } from 'react'

import { marketingStoreChunk } from '@mu-native/marketing'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'

export const CheckRightsContainer = memo(() => {
    const [rights] = useValues([marketingStoreChunk.props.getRights])
    const prevRights = useRef(rights)

    useEffect(() => {
        if (prevRights?.current?.length > 0 && rights?.length === 0) {
            reportEvent(MetricaEvents.USER_RIGHTS_WAS_CLEAR)
        }
    }, [rights?.length])

    return null
})
