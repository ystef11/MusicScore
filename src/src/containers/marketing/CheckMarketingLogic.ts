import { useEffect, memo } from 'react'

import { marketingThunks } from '@mu-native/marketing'
import { useActions } from '@ug/store'

export const CheckMarketingLogicContainer = memo(() => {
    const actions = useActions({
        checkStartMode: marketingThunks.checkStartMode,
    })

    useEffect(() => {
        actions.checkStartMode()
    }, [])

    return null
})
