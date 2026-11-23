import { useEffect } from 'react'

import { getStoreValue } from '@mu-native/common'
import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { playbackStatus } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'
import { xtz } from '@xtz/muse-rn'

import reportEvent from '../../../../../App/Utils/Analytics.ts'
import Sentry from '../../../../../App/Utils/Sentry.ts'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'

export const useXtzListeners = () => {
    const [score] = useValues([scoreStoreChunk.props.getCurrentScore])
    const actions = useActions({
        ...scoreStoreChunk.actions,
        onPdfExported: scoreThunks.onPdfExported,
    })
    useEffect(() => {
        const onLoopEnabled = xtz.addListenerOnLoopEnabled(enabled => {
            actions.setIsLoopEnabled(enabled)
        })
        const onLoopRegionChanged = xtz.addListenerOnLoopRegionChanged(() => {
            reportEvent(RT_EVENTS.SCORE_SET_LOOP, getScoreMetaEvent(score))
        })
        const onMetronomeInfoUpdated = xtz.addListenerOnMetronomeInfoUpdated(data => {
            // actions.setMetronomeVolume(data.volume)
            // actions.setIsMetronomeEnabled(data.enabled)
        })
        const onNoteSizeSet = xtz.addListenerOnNoteSizeSet(noteSize => {
            actions.setCurrentNoteSize(noteSize)
        })
        const onPageSetChanged = xtz.addListenerOnPageSetChanged(data => {
            actions.setTotalPages(data.total)
            actions.setCurrentPage(data.current)
        })
        const onPartAudioInfoUpdated = xtz.addListenerOnPartAudioInfoUpdated(data => {
            actions.setPartVolume({ partId: data.track, volume: data.volume })
        })
        const onPartPlayableChanged = xtz.addListenerOnPartPlayableChanged(data => {
            // empty for now
        })
        // const onPartVisibleChanged = xtz.addListenerOnPartVisibleChanged()
        const onPlaybackPositionChanged = xtz.addListenerOnPlaybackPositionChanged(data => {
            const { playbackSecond } = data

            if (score?.id) {
                actions.setPlaybackPosition({
                    scoreId: score?.id,
                    playbackPosition: playbackSecond,
                })
            }
        })
        const onPlaybackStatusChanged = xtz.addListenerOnPlaybackStatusChanged(status => {
            const isScoreLoading = getStoreValue(scoreStoreChunk.props.getIsSuccessLoading)
            if (!isScoreLoading) return
            if (
                (
                    [
                        playbackStatus.empty,
                        playbackStatus.stopped,
                        playbackStatus.paused,
                    ] as (typeof status)[]
                ).includes(status)
            ) {
                actions.setIsPlaying(false)
            }

            if (playbackStatus.playing === status) {
                actions.setIsPlaying(true)
            }

            actions.setPlaybackStatus(status)
        })
        const onSoundFontLoadFailed = xtz.addListenerOnSoundFontLoadFailed(() => {
            Sentry.sendMessage('onSoundFontLoadFailed', new Error('SOUNDFONT_LOAD_FAILED_XTZ'))
            presentAlert({ rawTitle: translate('native.score.error_loading_soundfont') })
        })
        const onPdfExported = xtz.addListenerOnPdfExported(data => {
            actions.onPdfExported(data.path, data.success)
        })

        return () => {
            onLoopEnabled()
            onPdfExported()
            onLoopRegionChanged()
            onMetronomeInfoUpdated()
            onNoteSizeSet()
            onPartAudioInfoUpdated()
            onPartPlayableChanged()
            // onPartVisibleChanged()
            onPlaybackPositionChanged()
            onPlaybackStatusChanged()
            onPageSetChanged()
            onSoundFontLoadFailed()
        }
    }, [score])
}
