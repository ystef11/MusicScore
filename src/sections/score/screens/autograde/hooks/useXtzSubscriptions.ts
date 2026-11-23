import { useEffect } from 'react'

import { useAppState } from '@mu-native/system'
import { playbackStatus, xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

const stoppableStatuses: number[] = [
    playbackStatus.empty,
    playbackStatus.stopped,
    playbackStatus.paused,
]

// The engine reports no error when it cannot open the audio input, so `playing` never arrives.
const preparingTimeoutMs = 10000

export const useXtzSubscriptions = () => {
    const [state, isPlaying] = useValues([
        autogradeScreenStoreChunk.props.getState,
        autogradeScreenStoreChunk.props.getIsPlaying,
    ])
    const actions = useActions({
        ...autogradeScreenStoreChunk.actions,
        ...autogradeScreenThunks,
    })
    useEffect(() => {
        const onLoaded = xtz.addListenerOnLoaded(data => {
            actions.loadMeta(data.data)
        })
        const playbackPositionUnsubscribe = xtz.addListenerOnPlaybackPositionChanged(event => {
            const { playbackSecond } = event
            actions.setPlaybackPosition(playbackSecond)
        })

        const playbackStatusUnsubscribe = xtz.addListenerOnPlaybackStatusChanged(status => {
            if (stoppableStatuses.includes(status)) {
                actions.setIsPlaying(false)
            }

            if (playbackStatus.playing === status) {
                actions.onPlaybackStarted()
            }

            actions.setPlaybackStatus(status)
        })

        const onAssessmentDone = xtz.addListenerOnMaeAssessmentDone(event => {
            actions.onAssessmentDone(event)
        })

        const onCalibrated = xtz.addListenerOnMaeCalibrationDone(latency => {
            actions.setCalibrationResult(latency)
            actions.setCalibrationStatus('completed')
        })

        const onRangeSelectionEnabledChanged = xtz.addListenerOnRangeSelectionEnable(isEnabled => {
            actions.setIsRangeSelectionEnabled(isEnabled)
            if (!isEnabled) {
                actions.setSelectedRange(undefined)
            }
        })

        const onRangeSelectionRegionChanged = xtz.addListenerOnRangeSelectionRegionChanged(
            region => {
                if (region.startMeasureIdx < 0 || region.endMeasureIdx < 0) {
                    return
                }
                actions.setSelectedRange({
                    startIndex: region.startMeasureIdx,
                    endIndex: region.endMeasureIdx,
                    startSec: region.startSec,
                    endSec: region.endSec,
                })
            },
        )


        return () => {
            onLoaded()
            onAssessmentDone()
            onCalibrated()
            onRangeSelectionEnabledChanged()
            onRangeSelectionRegionChanged()
            playbackPositionUnsubscribe()
            playbackStatusUnsubscribe()
        }
    }, [actions])

    useEffect(() => {
        if (state !== AutogradeState.Preparing) {
            return undefined
        }
        const timeout = setTimeout(() => {
            xtz.stop()
            actions.setState(AutogradeState.Initial)
        }, preparingTimeoutMs)
        return () => clearTimeout(timeout)
    }, [actions, state])

    useAppState(
        appState => {
            if (['background', 'active'].includes(appState) && isPlaying) {
                if (state === AutogradeState.Recording) {
                    xtz.stop()
                } else {
                    xtz.pause()
                }
            }
        },
        [isPlaying, state],
    )
}
