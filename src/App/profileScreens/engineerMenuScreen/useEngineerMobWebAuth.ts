import { useEffect } from 'react'

import {
    DeepLinksTypes,
    deferredDeeplinkStoreChunk,
    deferredDeeplinkThunks,
} from '@mu-native/deferred-deeplink'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'
import { authThunks } from '@mu-native/auth'

export const useEngineerMobWebAuth = (isEnabled: boolean) => {
    const [appState, deeplinkData] = useValues([
        systemStoreChunk.props.getAppState,
        deferredDeeplinkStoreChunk.props.getData,
    ])
    const actions = useActions({
        getDeferredDeeplinkData: deferredDeeplinkThunks.getDeferredDeeplinkData,
        onAuthMobWebUserThunk: authThunks.onAuthMobWebUserThunk,
        filterDeeplinkDataByAction: deferredDeeplinkStoreChunk.actions.filterDeeplinkDataByAction,
    })

    useEffect(() => {
        if (isEnabled) {
            actions.getDeferredDeeplinkData()
        }
    }, [isEnabled])

    useEffect(() => {
        if (isEnabled && appState === 'active' && deeplinkData.length) {
            const deeplinkAction = deeplinkData.find(item => item.action === DeepLinksTypes.auth)

            if (deeplinkAction?.payload) {
                actions.onAuthMobWebUserThunk({ secret: deeplinkAction.payload })
                actions.filterDeeplinkDataByAction(DeepLinksTypes.auth)
            }
        }
    }, [isEnabled, appState, deeplinkData])
}
