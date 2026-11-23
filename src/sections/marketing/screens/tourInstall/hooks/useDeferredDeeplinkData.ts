import { useEffect } from 'react'

import { deferredDeeplinkThunks } from '@mu-native/deferred-deeplink'
import { useActions } from '@ug/store'

export const useDeferredDeeplinkData = () => {
    const actions = useActions({
        getDeferredDeeplinkData: deferredDeeplinkThunks.getDeferredDeeplinkData,
    })

    useEffect(() => {
        actions.getDeferredDeeplinkData()
    }, [])
}
