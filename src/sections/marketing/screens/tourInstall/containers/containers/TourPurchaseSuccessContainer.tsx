import { memo, useCallback, useEffect } from 'react'

import { PurchaseSuccessComponent } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics'
import { onCloseTourThunk } from '../../store/tourInstallThunkActions'

export const TourPurchaseSuccessContainer = memo(() => {
    const { onCloseTour } = useActions({ onCloseTour: onCloseTourThunk })

    useEffect(() => {
        reportEvent(RT_EVENTS.SUCCESS_SCREEN_VIEW, { value: 'tour' })
    }, [])

    const onClose = useCallback(() => onCloseTour(), [])

    return <PurchaseSuccessComponent onClose={onClose} />
})
