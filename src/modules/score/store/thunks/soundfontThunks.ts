import { Platform } from 'react-native'

import { DispatchFun, GetStateFun } from '@mu-native/common'
import { hqSoundfontStoreChunk } from '@mu-native/hq-soundfont'
import { marketingStoreChunk } from '@mu-native/marketing'
import { scoreStoreChunk } from '@mu-native/score'

function applySoundfontSettings() {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        dispatch(scoreStoreChunk.actions.resetPlaybackStatus())
        if (Platform.OS === 'android') return

        const isPro = marketingStoreChunk.props.getIsPro(getState())
        const isEnabledSF = hqSoundfontStoreChunk.props.getIsEnabled(getState())

        if (isEnabledSF && !isPro) {
            dispatch(hqSoundfontStoreChunk.actions.setIsEnabled(false))
        }
    }
}

export const soundfontThunks = {
    applySoundfontSettings,
}
