import { Platform } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { NavigationService, Screen } from '@mu-native/navigation'
import { xtz } from '@mu-native/xtz'
import { openScoreControls } from '@xtz/muse-rn'

import { getDefaultSoundfontConfig, getProSoundfontConfig } from '../helpers/hqSoundfontHelpers'

import { hqSoundfontStoreChunk } from './hqSoundfontStoreChunk'

function applySoundFont(enablePro: boolean) {
    if (Platform.OS === 'android') {
        openScoreControls.setSoundQuality(enablePro)
        return
    }

    const soundFont = enablePro ? getProSoundfontConfig() : getDefaultSoundfontConfig()
    xtz.setSoundFont(soundFont.uri, soundFont.type)
}

function initializeSoundfont() {
    return (_dispatch: DispatchFun, getState: GetStateFun) => {
        const isEnabled = hqSoundfontStoreChunk.props.getIsEnabled(getState())
        applySoundFont(isEnabled)
    }
}

function toggleHQSoundfontEnabled() {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        const isEnabled = !hqSoundfontStoreChunk.props.getIsEnabled(getState())
        applySoundFont(isEnabled)
        dispatch(hqSoundfontStoreChunk.actions.setIsEnabled(isEnabled))
    }
}

function openHQSettings() {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        if (Platform.OS === 'android') {
            NavigationService.navigate(Screen.userSetting, { mode: 'hq_sound' })
            return
        }

        const isPro = marketingStoreChunk.props.getIsPro(getState())
        const isAuthorized = getIsAuthorized(getState())
        if (!isPro) {
            dispatch(
                marketingStoreChunk.actions.setPartialFieldsCustom({
                    featureText: 'marketing_text.hq_sound',
                    source: marketingConstants.sources.hqSound,
                }),
            )
            NavigationService.navigate(Screen.screenLongLanding)
            return
        }

        if (!isAuthorized) {
            dispatch(
                authStoreChunk.actions.presentAuthModal(() => {
                    dispatch(openHQSettings())
                }),
            )
            return
        }

        NavigationService.navigate(Screen.userSetting, { mode: 'hq_sound' })
    }
}

export const hqSoundfontThunkActions = {
    initializeSoundfont,
    toggleHQSoundfontEnabled,
    openHQSettings,
}
