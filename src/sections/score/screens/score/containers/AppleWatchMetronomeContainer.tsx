import { memo, useEffect } from 'react'
import { useReachability, watchEvents } from 'react-native-watch-connectivity'

import { sendMessageToWatch } from '@mu-native/apple-watch-module'
import { nativeDismissFittedSheet } from '@mu-native/ds'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getCurrentScoreSettings, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'

export const AppleWatchMetronomeContainer = memo(({ score }: { score: MSScoreT }) => {
    const { navigate } = useAppNavigation()

    const actions = useActions({
        // setIsMetronomeVibration: scoreStoreChunk.actions.setIsMetronomeVibration,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        setIsMetronomeEnabled: scoreThunks.setIsMetronomeEnabled,
        setVolume: scoreThunks.setMetronomeVolume,
    })
    const [{ isMetronomeEnabled, metronomeVolume }] = useValues([getCurrentScoreSettings])
    const [isPro, isOffScores] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
    ])
    const isReachable = useReachability()

    useEffect(() => {
        const unsubscribe = watchEvents.on(
            'message',
            ({
                isMetronomeVibration,
                isMetronomeEnabled,
                isCheckMetronome,
                volumeMetronome,
            }: {
                isMetronomeVibration: boolean
                isMetronomeEnabled: boolean
                isCheckMetronome: boolean
                volumeMetronome: number
            }) => {
                // if (isMetronomeVibration !== undefined && (isOffScores || score?.isPurchased)) {
                //     actions.setIsMetronomeVibration(isMetronomeVibration)
                // }

                if (
                    (isMetronomeVibration !== undefined || isMetronomeEnabled !== undefined) &&
                    !isOffScores &&
                    !score?.isPurchased
                ) {
                    actions.setPartialFieldsCustom({
                        inAppForSale: score,
                        featureText: 'apple_watch',
                        source: sources.appleWatchMetronome,
                    })
                    nativeDismissFittedSheet('metronomeSheet')
                    navigate(Screen.screenLongLanding, {
                        planName: 'offScores',
                        inAppItem: score,
                    })
                    sendMessageToWatch({
                        key: isMetronomeEnabled ? 'isMetronomeEnabled' : 'isMetronomeVibration',
                        value: false,
                    })
                }

                if (isMetronomeEnabled !== undefined && (isPro || score?.isPurchased)) {
                    reportEvent('Temp Watch Metronome Settings Enable')
                    actions.setIsMetronomeEnabled(isMetronomeEnabled)
                }

                if (volumeMetronome !== undefined && (isPro || score?.isPurchased)) {
                    actions.setVolume(volumeMetronome)
                    reportEvent(RT_EVENTS.MIXER_METRONOM_VOLUME_CHANGE, {
                        value: Math.round(volumeMetronome * 100),
                    })
                }

                if (isCheckMetronome !== undefined && (isPro || score?.isPurchased)) {
                    sendMessageToWatch({
                        key: 'isMetronomeEnabled',
                        value: isMetronomeEnabled,
                    })
                    sendMessageToWatch({
                        key: 'volumeMetronome',
                        value: metronomeVolume,
                    })
                }
            },
        )

        return () => {
            unsubscribe()
        }
    }, [isPro, isReachable, score?.isPurchased])

    useEffect(() => {
        if (!isReachable) return

        sendMessageToWatch({
            key: 'isMetronomeEnabled',
            value: isMetronomeEnabled,
        })
        sendMessageToWatch({
            key: 'volumeMetronome',
            value: metronomeVolume,
        })
    }, [isReachable])

    // useEffect(() => {
    //     if ((!isReachable || !isMetronomeVibration) || (!isOffScores && !score?.isPurchased)) return
    //
    //     const metronomeClickListenerUnsubscribe = xtz.events.addMetronomeClickListener(
    //         () => {
    //             sendMessageToWatch({
    //                 key: 'metronomeVibrationCount',
    //                 value: 1,
    //             })
    //         },
    //     )
    //
    //     return () => {
    //         metronomeClickListenerUnsubscribe()
    //     }
    // }, [isReachable, isMetronomeVibration, isOffScores, !!score?.isPurchased])

    return null
})
