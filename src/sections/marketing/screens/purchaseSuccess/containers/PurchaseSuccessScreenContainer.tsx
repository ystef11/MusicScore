import { memo, useCallback, useEffect } from 'react'

import { PurchaseSuccessComponent } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'

import reportEvent from '../../../../../App/Utils/Analytics.ts'

export const PurchaseSuccessScreen = memo(() => {
    const { goBack } = useAppNavigation()

    useEffect(() => {
        reportEvent(RT_EVENTS.SUCCESS_SCREEN_VIEW)
    }, [])

    const onClose = useCallback(() => goBack(), [])

    return <PurchaseSuccessComponent onClose={onClose} />
})
