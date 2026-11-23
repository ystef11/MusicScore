import { memo } from 'react'

import { getIsAuthorized } from '@mu-native/auth'
import { useDidUpdate } from '@mu-native/common'
import { useSheetDismiss } from '@mu-native/ds'
import { useValues } from '@ug/store'

export const CloseBottomSheetContainer = memo(() => {
    const [isAuth] = useValues([getIsAuthorized])
    const close = useSheetDismiss()

    useDidUpdate(() => {
        if (isAuth) close()
    }, [isAuth])

    return null
})
