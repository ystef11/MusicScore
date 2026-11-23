import { DispatchFun, GetStateFun } from '@mu-native/common'
import { scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'

const pauseScore = () => {
    xtz.pause()
}

const playScore = () => {
    xtz.play(false, '')
}

function toggleScorePlay() {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        const isPlaying = scoreStoreChunk.props.getIsPlaying(getState())
        const isKeyboardVisible = scoreStoreChunk.props.getIsKeyboardVisible(getState())
        reportEvent(MetricaEvents.CHANGE_PLAYBACK_STATUS, {
            value: isPlaying ? 'play' : 'pause',
            ...(isKeyboardVisible ? { ui: 'keyboard' } : {}),
            ...(score?.isOfficial ? { type: 'official' } : {}),
        })

        if (isPlaying) {
            pauseScore()
        } else {
            playScore()
        }
        dispatch(scoreStoreChunk.actions.setIsPlaying(!isPlaying))
    }
}

export const playbackThunks = {
    playScore,
    pauseScore,
    toggleScorePlay,
}
