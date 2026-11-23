import { DispatchFun, GetStateFun } from '@mu-native/common'
import {
    addOrRemove,
    getCurrentScoreParts,
    getCurrentScoreSettings,
    scoreStoreChunk,
} from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

import { flushAudioBufferIfPlaying } from './audioBufferHelpers.ts'

const togglePartVisibility = (partId: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const settings = getCurrentScoreSettings(getState())
        const { visiblePartIds } = settings
        const updatedPartIds = addOrRemove(visiblePartIds, partId)
        xtz.setVisibleParts(updatedPartIds)
        dispatch(scoreStoreChunk.actions.setVisibleParts(updatedPartIds))
    }
}
const togglePartPlayability = (partId: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const settings = getCurrentScoreSettings(getState())
        const parts = getCurrentScoreParts(getState())
        const allPartIds = parts.map(part => part.id)
        const { playablePartIds } = settings
        // In the store, an empty list (or a full list) both mean "all parts play".
        const allPlayable =
            playablePartIds.length === 0 || playablePartIds.length === allPartIds.length
        // Soloing from the "all play" state restricts playback to the single tapped part.
        // Otherwise toggle this part in/out of the playable set — tapping the last soloed
        // part again empties the set, which we treat as "back to all play".
        const updatedPartIds = allPlayable ? [partId] : addOrRemove(playablePartIds, partId)
        // The native engine plays exactly the ids it receives (an empty array = silence),
        // so when every part should play we hand it the full set instead of an empty list.
        const enginePartIds = updatedPartIds.length === 0 ? allPartIds : updatedPartIds
        xtz.setPlayableParts(enginePartIds)
        dispatch(scoreStoreChunk.actions.setPlayableParts(updatedPartIds))
        flushAudioBufferIfPlaying(getState)
    }
}

const setAllPartsVisible = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const parts = getCurrentScoreParts(getState())
        const partIds = parts.map(part => part.id)
        xtz.setVisibleParts(partIds)
        dispatch(scoreStoreChunk.actions.setVisibleParts(partIds))
    }
}

const setAllPartsPlayable = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const parts = getCurrentScoreParts(getState())
        const partIds = parts.map(part => part.id)
        xtz.setPlayableParts(partIds)
        dispatch(scoreStoreChunk.actions.setPlayableParts(partIds))
        flushAudioBufferIfPlaying(getState)
    }
}

const setSinglePartVisible = (partId: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const parts = getCurrentScoreParts(getState())
        const partIds = parts.map(part => part.id)

        if (!partIds.includes(partId)) return

        xtz.setVisibleParts([partId])
        dispatch(scoreStoreChunk.actions.setVisibleParts([partId]))
    }
}

const setSinglePartPlayable = (partId: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const parts = getCurrentScoreParts(getState())
        const partIds = parts.map(part => part.id)

        if (!partIds.includes(partId)) return

        xtz.setPlayableParts([partId])
        dispatch(scoreStoreChunk.actions.setPlayableParts([partId]))
        flushAudioBufferIfPlaying(getState)
    }
}

const setPartVolume = (partId: number, volume: number) => {
    return async (_: DispatchFun, getState: GetStateFun) => {
        xtz.setPartVolume(partId, volume)
        flushAudioBufferIfPlaying(getState)
    }
}

export const mixerThunks = {
    togglePartVisibility,
    togglePartPlayability,
    setAllPartsVisible,
    setAllPartsPlayable,
    setSinglePartVisible,
    setSinglePartPlayable,
    setPartVolume,
}
