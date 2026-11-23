import { useEffect, useRef } from 'react'

import { hqSoundfontStoreChunk } from '@mu-native/hq-soundfont'
import { getScreenParams, RT_EVENTS } from '@mu-native/rt-analytics'
import { ScorePageLayoutOptionKey, scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'
import { MSScoreT } from '../types/scoreTypes.ts'

const useScoreViewerAnalytics = (score: MSScoreT | null) => {
    const [isScoreLoaded, isPlaying, page, pageLayoutType, isKeyboardVisible, hqSoundEnabled] =
        useValues([
            scoreStoreChunk.props.getIsSuccessLoading,
            scoreStoreChunk.props.getIsPlaying,
            scoreStoreChunk.props.getCurrentPage,
            scoreStoreChunk.props.getPageLayoutType,
            scoreStoreChunk.props.getIsKeyboardVisible,
            hqSoundfontStoreChunk.props.getIsEnabled,
        ])

    const prevValues = useRef<{
        pageLayoutType: ScorePageLayoutOptionKey
        isKeyboardVisible: boolean
        hqSoundEnabled: boolean
        isPlaying: boolean
        page: number
        score: typeof score
    }>({
        isPlaying,
        page,
        score,
        pageLayoutType,
        isKeyboardVisible,
        hqSoundEnabled,
    })

    // Tracks when the current score became viewable, used to compute the
    // `duration` (seconds on the score screen) reported with SCORE_CLOSE.
    const startTimeRef = useRef(Date.now())

    useEffect(() => {
        prevValues.current.score = score
    }, [score])

    useEffect(() => {
        const screenParams = getScreenParams()
        if (score) {
            reportEvent(RT_EVENTS.SCORE_VIEW, getScoreMetaEvent(score))
        }
        return () => {
            if (prevValues.current.score) {
                const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
                reportEvent(RT_EVENTS.SCORE_CLOSE, {
                    ...getScoreMetaEvent(prevValues.current.score),
                    ...screenParams,
                    duration,
                })
            }
        }
    }, [score])

    useEffect(() => {
        let timer12s: ReturnType<typeof setTimeout>
        let timer15s: ReturnType<typeof setTimeout>
        let timer30s: ReturnType<typeof setTimeout>
        let timer60s: ReturnType<typeof setTimeout>
        if (isScoreLoaded && score) {
            startTimeRef.current = Date.now()
            const screenParams = getScreenParams()
            timer12s = setTimeout(() => {
                reportEvent(RT_EVENTS.SCORE_DELAY_VIEW, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }, 12_000)
            timer15s = setTimeout(() => {
                reportEvent(RT_EVENTS.SCORE_15S_VIEW, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }, 15_000)

            timer30s = setTimeout(() => {
                reportEvent(RT_EVENTS.SCORE_30S_VIEW, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }, 30_000)

            timer60s = setTimeout(() => {
                reportEvent(RT_EVENTS.SCORE_60S_VIEW, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }, 60_000)
        }

        return () => {
            if (timer12s) clearTimeout(timer12s)
            if (timer15s) clearTimeout(timer15s)
            if (timer30s) clearTimeout(timer30s)
            if (timer60s) clearTimeout(timer60s)
        }
    }, [isScoreLoaded, score, score?.id])

    useEffect(() => {
        if (!score) return
        const screenParams = getScreenParams()
        if (isPlaying !== prevValues.current.isPlaying) {
            prevValues.current.isPlaying = isPlaying
            reportEvent(isPlaying ? RT_EVENTS.SCORE_PLAY_START : RT_EVENTS.SCORE_PLAY_END, {
                ...getScoreMetaEvent(score),
                ...screenParams,
            })
        }
        if (page !== prevValues.current.page) {
            reportEvent(
                page > prevValues.current.page
                    ? RT_EVENTS.SCORE_PAGE_NEXT
                    : RT_EVENTS.SCORE_PAGE_PREVIOUS,
                {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                },
            )
            prevValues.current.page = page
        }
        if (pageLayoutType !== prevValues.current.pageLayoutType) {
            if (prevValues.current.pageLayoutType === 'vertical') {
                reportEvent(RT_EVENTS.SCORE_SCROLLING_VERTICAL_OFF, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }
            if (pageLayoutType === 'vertical') {
                reportEvent(RT_EVENTS.SCORE_SCROLLING_VERTICAL_ON, {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                })
            }
            prevValues.current.pageLayoutType = pageLayoutType
        }
        if (isKeyboardVisible !== prevValues.current.isKeyboardVisible) {
            prevValues.current.isKeyboardVisible = isKeyboardVisible
            reportEvent(
                isKeyboardVisible
                    ? RT_EVENTS.SCORE_KEYBOARD_SHOW
                    : RT_EVENTS.SCORE_KEYBOARD_CLOSE,
                {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                },
            )
        }
        if (hqSoundEnabled !== prevValues.current.hqSoundEnabled) {
            prevValues.current.hqSoundEnabled = hqSoundEnabled
            reportEvent(
                hqSoundEnabled
                    ? RT_EVENTS.SCORE_SETTINGS_HQ_TOGGLE_ON
                    : RT_EVENTS.SCORE_SETTINGS_HQ_TOGGLE_OFF,
                {
                    ...getScoreMetaEvent(score),
                    ...screenParams,
                },
            )
        }
    }, [isPlaying, page, pageLayoutType, isKeyboardVisible, hqSoundEnabled, score])
}

export default useScoreViewerAnalytics
