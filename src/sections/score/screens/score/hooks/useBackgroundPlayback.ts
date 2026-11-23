import { useCallback, useEffect, useState } from 'react'
import TrackPlayer, { Event } from 'react-native-track-player'

import { marketingStoreChunk } from '@mu-native/marketing'
import { useFocusEffect } from '@mu-native/navigation'
import { scoreStoreChunk, TPlaybackStatus, TScoreSourceFile } from '@mu-native/score'
import { checkConnectionSafely, systemStoreChunk } from '@mu-native/system'
import { TMeta, xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'
import throttle from 'lodash.throttle'

import { exportMp3ForBackgroundPlayback } from '../../../../../App/Controllers/ScoreActionsController.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'

let isFirstPlay = true

export const useBackgroundPlayback = ({
    source,
    score,
}: {
    source: TScoreSourceFile
    score: MSScoreT
}) => {
    const actions = useActions({
        exportMp3ForBackgroundPlayback,
    })
    const [isOffScores, playbackPosition, appState, playbackStatus] = useValues([
        marketingStoreChunk.props.getIsOffScores,
        scoreStoreChunk.props.getPlaybackPosition,
        systemStoreChunk.props.getAppState,
        scoreStoreChunk.props.getPlaybackStatus,
    ])
    const [isTrackReadyForPlay, setIsTrackReadyForPlay] = useState(false)

    const [trackData, setTrackData] = useState<{
        url: string
        title: string
        artist: string
        artwork: string
        duration: number
    }>()
    useEffect(() => {
        if (isTrackReadyForPlay && playbackStatus === TPlaybackStatus.STATE_PLAYING) {
            TrackPlayer.play()
        }

        if (isTrackReadyForPlay && playbackStatus === TPlaybackStatus.STATE_PAUSED)
            TrackPlayer.pause()
    }, [playbackStatus, isTrackReadyForPlay])

    const throttleSetSecond = useCallback(
        throttle(async (position: number) => {
            await TrackPlayer.seekTo(position)
            xtz.setCurrentSecond(position, true, true)
        }, 500),
        [],
    )

    useFocusEffect(
        useCallback(() => {
            if (!isTrackReadyForPlay) return () => null

            const playUnsubscribe = TrackPlayer.addEventListener(Event.RemotePlay, () => {
                xtz.play(false, '')
            })

            const pauseUnsubscribe = TrackPlayer.addEventListener(Event.RemotePause, () => {
                xtz.pause()
            })

            const pauseRemoteSeek = TrackPlayer.addEventListener(
                Event.RemoteSeek,
                async ({ position }) => {
                    throttleSetSecond(position)
                },
            )

            return () => {
                playUnsubscribe.remove()
                pauseUnsubscribe.remove()
                pauseRemoteSeek.remove()
                setIsTrackReadyForPlay(false)
                setTrackData(undefined)
                TrackPlayer.remove([0])
            }
        }, [isTrackReadyForPlay]),
    )

    const initPlayerData = async (meta: TMeta) => {
        if (!checkConnectionSafely() || (!isOffScores && !score?.isPurchased)) return

        const mp3FileUrl = await actions.exportMp3ForBackgroundPlayback()

        if (!mp3FileUrl) return

        const track = {
            url: mp3FileUrl as unknown as string,
            title: meta.title,
            artist: meta.name,
            artwork: score.largePreviewUrl,
            duration: meta.duration,
        }
        setTrackData(track)
    }

    useEffect(() => {
        if (trackData?.url) {
            ;(async () => {
                await TrackPlayer.add([trackData])
                // fix first play issue ios
                if (isFirstPlay) {
                    await TrackPlayer.remove([0])
                    await TrackPlayer.add([trackData])
                    isFirstPlay = false
                }

                await TrackPlayer.pause()
                await TrackPlayer.seekTo(0)
                setIsTrackReadyForPlay(true)
            })()
        }
    }, [trackData])

    const throttleUpdateProgress = useCallback(
        throttle((second: number) => {
            TrackPlayer.seekTo(second)
        }, 500),
        [],
    )

    useEffect(() => {
        if (
            isTrackReadyForPlay &&
            (appState === 'inactive' || appState === 'background') &&
            score?.id &&
            playbackPosition?.[score.id]
        ) {
            throttleUpdateProgress(playbackPosition?.[score.id])
        }
    }, [playbackPosition])

    return { initPlayerData }
}
