import { memo } from 'react'

import { getIsAuthorized } from '@mu-native/auth'
import { useDidUpdate } from '@mu-native/common'
import { marketingThunks } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

export const CheckRestoreSplash = memo(() => {
    const [isAuthorized] = useValues([getIsAuthorized])

    const actions = useActions({
        checkToShowRestoreSplashThunk: marketingThunks.checkToShowRestoreSplashThunk,
    })

    useDidUpdate(() => {
        if (isAuthorized) {
            setTimeout(() => {
                actions.checkToShowRestoreSplashThunk()
            }, 3000)
        }
    }, [isAuthorized])

    return null
})
