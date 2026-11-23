import { memo } from 'react'

import { brandColors, Loader } from '@mu-native/ds'
import { useValues } from '@ug/store'

import { useDeferredDeeplinkData } from '../../hooks/useDeferredDeeplinkData.ts'
import { useIsMobWebUserCheck } from '../../hooks/useIsMobWebUserCheck.ts'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk.ts'

export const DeepLinkAuthLoaderContainer = memo(() => {
    const [isLoadingDeepLinkAuth] = useValues([
        tourInstallScreenStoreChunk.props.getIsLoadingDeepLinkAuth,
    ])
    useIsMobWebUserCheck()
    useDeferredDeeplinkData()

    if (!isLoadingDeepLinkAuth) return null
    return <Loader color={brandColors.contentPrimary} />
})
