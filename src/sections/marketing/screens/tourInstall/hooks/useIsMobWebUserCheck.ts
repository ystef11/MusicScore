import { useEffect, useState } from 'react'

import { platform } from '@mu-native/common'
import { DeepLinksTypes, deferredDeeplinkStoreChunk } from '@mu-native/deferred-deeplink'
import { useMonetizationExperiment } from '@mu-native/marketing'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { onAuthMobWebUserThunk } from '../store/tourInstallThunkActions.ts'

export const useIsMobWebUserCheck = () => {
    const [appState, deeplinkData] = useValues([
        systemStoreChunk.props.getAppState,
        deferredDeeplinkStoreChunk.props.getData,
    ])
    const actions = useActions({
        onAuthMobWebUserThunk,
        filterDeeplinkDataByAction: deferredDeeplinkStoreChunk.actions.filterDeeplinkDataByAction,
    })
    const [isInit, setIsInit] = useState(false)

    const { variation } = useMonetizationExperiment(
        isInit,
        platform.isIos ? 7775 : 7778,
        'mobWebAuthExp',
        true,
    )
    const isMobWebAuth = variation === 2

    useEffect(() => {
        if (appState === 'active' && deeplinkData.length) {
            const deeplinkAction = deeplinkData.find(item => item.action === DeepLinksTypes.auth)

            if (deeplinkAction?.payload) {
                if (isMobWebAuth) {
                    actions.onAuthMobWebUserThunk({ secret: deeplinkAction.payload })
                }
                actions.filterDeeplinkDataByAction(DeepLinksTypes.auth)
                setIsInit(true)
            }
        }
    }, [appState, deeplinkData])
}
