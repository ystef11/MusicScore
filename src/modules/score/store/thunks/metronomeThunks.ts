import { DispatchFun, GetStateFun } from '@mu-native/common'
import { scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../App/constants/scoreAnalytic.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'

const setTempo = (tempo: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        xtz.setPlaybackSpeed(tempo)
        dispatch(scoreStoreChunk.actions.setCurrentTempo(tempo))
        reportEvent(MetricaEvents.SCORE_SPEED_CHANGE, getScoreMetaEvent(score))
    }
}

const setIsMetronomeEnabled = (isMetronomeEnabled: boolean) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        xtz.setMetronomeEnabledFile(isMetronomeEnabled)
        dispatch(scoreStoreChunk.actions.setIsMetronomeEnabled(isMetronomeEnabled))
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        const event = isMetronomeEnabled
            ? MetricaEvents.SCORE_METRONOME_SWITCH_ON
            : MetricaEvents.SCORE_METRONOME_SWITCH_OFF
        reportEvent(event, getScoreMetaEvent(score))
    }
}

const setCountdownEnabled = (countdownEnabled: boolean) => {
    return async (dispatch: DispatchFun) => {
        xtz.setCountdownEnabled(countdownEnabled)
        dispatch(scoreStoreChunk.actions.setIsCountdownEnabled(countdownEnabled))
    }
}

const setMetronomeVolume = (volume: number) => {
    return async (dispatch: DispatchFun) => {
        xtz.setMetronomeVolume(volume)
        dispatch(scoreStoreChunk.actions.setMetronomeVolume(volume))
    }
}

export const metronomeThunks = {
    setTempo,
    setIsMetronomeEnabled,
    setCountdownEnabled,
    setMetronomeVolume,
}
