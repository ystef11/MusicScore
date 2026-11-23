import { DispatchFun, GetStateFun, RNFS } from '@mu-native/common'
import { xtz } from '@mu-native/xtz'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { convertAutogradeResults } from '../dataConverters/convertAutogradeResults.ts'
import autogradeService from '../services/autogradeService.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

import autogradeScreenStoreChunk from './autogradeScreenStoreChunk.ts'
import { DefaultNoteSize } from '@mu-native/score'

const setActivePart = (part: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        xtz.hideMaeMistakes()
        xtz.stop()
        xtz.setPlayableParts([part])
        xtz.setVisibleParts([part])
        dispatch(autogradeScreenStoreChunk.actions.setActivePart(part))
        dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Initial))
    }
}

const setPlaybackSpeed = (value: number) => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        xtz.setPlaybackSpeed(value)
        dispatch(autogradeScreenStoreChunk.actions.setPlaybackSpeed(value))
    }
}

const onAssessmentDone = ({
    recordingPath,
    results,
    resultJSONPath,
}: {
    results: {
        Accuracy?: number
        Rhythm?: number
    }
    recordingPath: string
    resultJSONPath: string
}) => {
    return async (dispatch: DispatchFun) => {
        try {
            const detailedResults = await RNFS.readFile(resultJSONPath)
            const json = JSON.parse(detailedResults)
            const toSave = json.map((item: any) => ({
                duration: item.durationSec,
                mistakes: item.mistakes,
                start: item.startMiliSec,
            }))
            dispatch(autogradeScreenStoreChunk.actions.setDetailedResults(toSave))
        } catch (e) {
            console.log('Failed to parse Autograde detailed results')
        }

        dispatch(autogradeScreenStoreChunk.actions.setRecordPath(recordingPath))

        const convertedResults = convertAutogradeResults(results)

        if (convertedResults.accuracy === undefined && convertedResults.rhythm === undefined) {
            // Recording has been stopped before any analysis run
            dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Initial))
            return
        }

        dispatch(autogradeScreenStoreChunk.actions.setResults(convertedResults))
        dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Reviewing))
    }
}

const onPlaybackStarted = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        dispatch(autogradeScreenStoreChunk.actions.setIsPlaying(true))
        if (autogradeScreenStoreChunk.props.getState(getState()) === AutogradeState.Preparing) {
            dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Recording))
        }
    }
}

const setRangeSelectionEnabled = (enabled: boolean) => {
    return async (_: DispatchFun, getState: GetStateFun) => {
        const score = autogradeScreenStoreChunk.props.getScore(getState())
        reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_CROP_CLICK, getScoreMetaEvent(score))
        xtz.setRangeSelectionActive(enabled)
        xtz.setRangeSelectionEnabled(enabled)
    }
}

const recordPath = `${RNFS.CachesDirectoryPath}/practice_mode_session.wav`
const startRecording = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const score = autogradeScreenStoreChunk.props.getScore(getState())
        reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_RECORD_START, getScoreMetaEvent(score))
        const hasMicrophonePermission = await autogradeService.requestMicrophonePermission()
        if (!hasMicrophonePermission) {
            return
        }
        dispatch(autogradeScreenStoreChunk.actions.resetBeforeRecording())
        dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Preparing))
        xtz.hideMaeMistakes()
        xtz.setCountdownEnabled(true)
        xtz.setCountdownFactor(2)
        xtz.setPlayableParts([])
        xtz.setMetronomeEnabledFile(true)
        xtz.switchOnBackingTracks(false)
        xtz.play(true, recordPath)
    }
}

const stopRecording = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const score = autogradeScreenStoreChunk.props.getScore(getState())
        reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_RECORD_STOP, getScoreMetaEvent(score))
        xtz.stop()
        dispatch(autogradeScreenStoreChunk.actions.setState(AutogradeState.Reviewing))
    }
}

const toggleRecording = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isRecording = autogradeScreenStoreChunk.props.getState(getState()) === AutogradeState.Recording
        if (isRecording) {
            dispatch(stopRecording())
        } else {
            dispatch(startRecording())
        }
    }
}

const togglePlay = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isPlaying = autogradeScreenStoreChunk.props.getIsPlaying(getState())
        const score = autogradeScreenStoreChunk.props.getScore(getState())
        if (isPlaying) {
            reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_PAUSE_CLICK, getScoreMetaEvent(score))
            xtz.pause()
        } else {
            const part = autogradeScreenStoreChunk.props.getActivePart(getState())
            const recordingPath = autogradeScreenStoreChunk.props.getRecordPath(getState())
            const isReviewing = autogradeScreenStoreChunk.props.getState(getState()) === AutogradeState.Reviewing
            const event = isReviewing
                ? MetricaEvents.SCORE_PRACTICE_MODE_PLAY_RECORD_CLICK
                : MetricaEvents.SCORE_PRACTICE_MODE_PLAY_CLICK
            reportEvent(event, getScoreMetaEvent(score))
            xtz.setCountdownEnabled(false)
            xtz.setMetronomeEnabledFile(false)
            xtz.setPlayableParts([part])
            xtz.setVisibleParts([part])
            if (isReviewing && recordingPath) {
                xtz.setBackingTrack(part, recordingPath)
                xtz.switchOnBackingTracks(true)
            }
            xtz.play(false, '')
        }
    }
}

const setNoteSize = (value: number) => {
    return async (dispatch: DispatchFun) => {
        xtz.setNoteSize(value)
        dispatch(autogradeScreenStoreChunk.actions.setCurrentNoteSize(value))
    }
}

const zoomIn = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const current = autogradeScreenStoreChunk.props.getCurrentNoteSize(getState())
        const { min } = autogradeScreenStoreChunk.props.getNoteSizeState(getState())
        if (current > min) {
            const zoomValue = current - 0.5
            dispatch(setNoteSize(zoomValue))
        }
    }
}

const zoomOut = () => {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const current = autogradeScreenStoreChunk.props.getCurrentNoteSize(getState())
        const { max } = autogradeScreenStoreChunk.props.getNoteSizeState(getState())
        if (current < max) {
            const zoomValue = current + 0.5
            dispatch(setNoteSize(zoomValue))
        }
    }
}

const zoomReset = () => {
    return async (dispatch: DispatchFun) => {
        dispatch(setNoteSize(DefaultNoteSize))
    }
}

export const autogradeScreenThunks = {
    setActivePart,
    setPlaybackSpeed,
    onAssessmentDone,
    onPlaybackStarted,
    setRangeSelectionEnabled,
    toggleRecording,
    zoomIn,
    zoomOut,
    zoomReset,
    togglePlay,
}
