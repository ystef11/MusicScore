import { useCallback, useEffect, useRef, useState } from 'react'
import { PixelRatio } from 'react-native'

import { platform } from '@mu-native/common'
import { presentAlert, useSafeAreaInsets } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useFocusEffect } from '@mu-native/navigation'
import {
    DefaultNoteSize,
    scoreStoreChunk,
    scoreThunks,
    TFitMode,
    TScoreSourceFile,
    TScrollMode,
} from '@mu-native/score'
import { getDefaultStyle, metaStatus, playbackStatus, TMeta, xtz, XtzView } from '@mu-native/xtz'
import * as GeneralSentry from '../../../../../App/Utils/Sentry'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import { deleteCachedScoreFile } from '../../../../../App/Services/ScoreInfoProvider.ts'
import { downloadWebScore, usesWebScoreCache } from '../../../../../App/Services/WebScoreProvider.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import Sentry from '../../../../../App/Utils/Sentry.ts'
import { onScoreOpenFailed } from '../helpers/scoreOpenFailure.ts'
import { useBackgroundPlayback } from '../hooks/useBackgroundPlayback.ts'
import { useXtzListeners } from '../hooks/useXtzListeners.ts'

type SingleTap = {
    x: number
    y: number
    width: number
    height: number
}

const format = 'MUSESCORE_ANY' as const

// xtz.tryLoadingAdditionalFonts()

type TXTZContainerProps = {
    source: TScoreSourceFile
    score: MSScoreT
    noteSize?: number
    fitMode?: TFitMode
    scrollMode?: TScrollMode
    isCountdownEnabled?: boolean
    onSingleTap?: (tap: SingleTap) => void
    visibleParts: number[]
    playableParts: number[]
    playbackSpeed: number | undefined
    metronomeVolume: number | undefined
    isKeyboardVisible?: boolean
    noteHintsEnabled?: boolean
    /**
     * Reposition the camera to the start of the score once it finishes laying
     * out — the same camera move that pressing Play triggers. Fixes the new
     * Score Play screen opening scrolled away from the top (e.g. vertical scroll
     * in landscape showing the first system near the bottom of the screen).
     */
    resetCameraOnLoad?: boolean
}

export type TXTZContainer = {
    setNextPage: () => Promise<boolean>
    setPrevPage: () => Promise<boolean>
}

xtz.setEnabledDebugMode(__DEV__)

const XTZContainer = ({
    source,
    score,
    noteSize,
    fitMode,
    scrollMode,
    visibleParts,
    playableParts,
    onSingleTap,
    isCountdownEnabled,
    playbackSpeed = 1,
    metronomeVolume = 0,
    isKeyboardVisible = false,
    noteHintsEnabled,
    resetCameraOnLoad = false,
}: TXTZContainerProps) => {
    const { top, left, right } = useSafeAreaInsets()

    const [isZoom, setIsZoom] = useState<boolean>(false)
    const [isCursorVisible] = useValues([scoreStoreChunk.props.getIsCursorVisible])
    const cursorVisibilityRef = useRef(isCursorVisible)
    cursorVisibilityRef.current = isCursorVisible
    useEffect(() => { xtz.setPlayHeadVisible(isCursorVisible) }, [isCursorVisible])
    const isLoadedRef = useRef(false)
    // Once the user takes control (a gesture or starting playback) we stop
    // forcing the camera back to the start.
    const hasUserInteractedRef = useRef(false)
    // Only keep re-pinning to the start during the initial settling window
    // after load (guards against any layout feedback loop).
    const resetDeadlineRef = useRef(0)
    // Latest scroll offset, and the offset to restore while the piano keyboard
    // toggle resizes the score view (see the effect below).
    const scrollOffsetRef = useRef({ x: 0, y: 0 })
    const keepOffsetRef = useRef<{ x: number; y: number } | null>(null)
    const keepOffsetDeadlineRef = useRef(0)

    const actions = useActions({
        ...scoreStoreChunk.actions,
        onScoreMetaLoaded: scoreThunks.onScoreMetaLoaded,
        setIsPlaying: scoreStoreChunk.actions.setIsPlaying,
        onPdfExported: scoreThunks.onPdfExported,
        setIsCursorVisible: scoreThunks.setIsCursorVisible,
        setPrevPage: scoreThunks.setPrevPage,
        setNextPage: scoreThunks.setNextPage,
    })

    useXtzListeners()
    const { initPlayerData } = useBackgroundPlayback({ source, score })

    // Snap the camera to the very start of the score — the same reposition Play
    // performs (move the playback cursor to second 0 and let the camera follow).
    // No-op once the user has taken control.
    const resetCameraToStart = useCallback(() => {
        if (hasUserInteractedRef.current) return
        if (resetDeadlineRef.current && Date.now() > resetDeadlineRef.current) return
        xtz.setCurrentSecond(0, true, true)
    }, [])

    const handleLoaded = ({ data: meta, status, error }: { data: TMeta; status: number; error?: string }) => {
        if (status !== metaStatus.noError) {
            Sentry.sendMessage(
                'openScore',
                new Error('FAILED_OPEN_SCORE_ERROR_STATUS_META', { cause: status }),
            )
            presentAlert({ rawTitle: translate('native.score.failed_to_open_score'), rawMessage: error || `Код ошибки движка: ${status}` })
            // The engine failed to open the file — most likely a corrupted
            // cached download. Drop it from the cache so the next open
            // re-downloads the score instead of failing on the same file.
            if (source?.uri) deleteCachedScoreFile(source.uri)
            return
        }
        xtz.setPlayHeadVisible(cursorVisibilityRef.current)
        initPlayerData(meta)

        reportEvent(`Dev: XTZ loaded with status: ${status}`, getScoreMetaEvent(score))

        actions.onScoreMetaLoaded(meta)
        actions.setIsSuccessLoading(true)
        isLoadedRef.current = true
        if (resetCameraOnLoad) {
            resetDeadlineRef.current = Date.now() + 3000
            // Fallback: if no layout event arrives after load, still snap to
            // start once the layout has had a moment to settle.
            setTimeout(resetCameraToStart, 300)
        }
    }

    const margins = {
        top: top + 16,
        // eslint-disable-next-line no-nested-ternary
        bottom: scrollMode === TScrollMode.VERTICAL ? (isKeyboardVisible ? 80 : 64) : 16,
        left: 20 + left,
        right: 20 + right,
    }

    useEffect(() => {
        const unsubscribe = xtz.addListenerOnLoaded(data => {
            handleLoaded(data)
        })

        return () => {
            unsubscribe?.()
        }
    }, [])

    // Keep the score pinned to the start until the user takes control. The xtz
    // engine can lay out several times while opening (and the timing differs on
    // a warm re-open), so re-applying on every layout — rather than once — is
    // what reliably removes the "opens scrolled down / big gap after the title"
    // glitch on the new Score Play screen. Playback start counts as taking
    // control, otherwise page-flip layouts would yank playback back to the top.
    useEffect(() => {
        if (!resetCameraOnLoad) return () => null
        const unsubscribeLayout = xtz.addListenerOnLayoutDidHappen(() => {
            if (!isLoadedRef.current) return
            resetCameraToStart()
        })
        const unsubscribeStatus = xtz.addListenerOnPlaybackStatusChanged(status => {
            if (status === playbackStatus.playing) hasUserInteractedRef.current = true
        })

        return () => {
            unsubscribeLayout?.()
            unsubscribeStatus?.()
        }
    }, [resetCameraOnLoad, resetCameraToStart])

    // Showing/hiding the piano keyboard resizes the score view, which makes the
    // engine snap the camera back to the start. Remember the scroll offset and
    // re-apply it on the resulting layout events so the score stays in place.
    useEffect(() => {
        const unsubscribeScroll = xtz.addListenerOnSizeScrollChanged(({ contentOffset }) => {
            if (keepOffsetRef.current) return
            scrollOffsetRef.current = contentOffset
        })
        const unsubscribeLayout = xtz.addListenerOnLayoutDidHappen(() => {
            const keep = keepOffsetRef.current
            if (keep && Date.now() <= keepOffsetDeadlineRef.current) {
                xtz.setScrollOffset(keep.x, keep.y)
            }
        })
        return () => {
            unsubscribeScroll?.()
            unsubscribeLayout?.()
        }
    }, [])

    const isFirstKeyboardRenderRef = useRef(true)
    useEffect(() => {
        if (isFirstKeyboardRenderRef.current) {
            isFirstKeyboardRenderRef.current = false
            return undefined
        }
        keepOffsetRef.current = { ...scrollOffsetRef.current }
        keepOffsetDeadlineRef.current = Date.now() + 700
        const timer = setTimeout(() => {
            keepOffsetRef.current = null
        }, 700)
        return () => clearTimeout(timer)
    }, [isKeyboardVisible])

    const handleSingleTap = (e: {
        nativeEvent: { x: number; y: number; width: number; height: number }
    }) => {
        hasUserInteractedRef.current = true
        const { x, y, width, height } = e.nativeEvent
        onSingleTap?.({ x, y, width, height })
    }
    const onGestureLongTap = async (e: {
        nativeEvent: { x: number; y: number; width: number }
    }) => {
        hasUserInteractedRef.current = true
        const { x, y } = e.nativeEvent
        const density = platform.isAndroid ? PixelRatio.get() : 1

        if (isZoom) return
        actions.setIsCursorVisible(true)
        xtz.setCursorPosition(x / density, y / density)
    }

    const isInitialized = useRef(false)
    useFocusEffect(
        useCallback(() => {
            if (isInitialized.current) return
            isInitialized.current = true
            const meta = getScoreMetaEvent(score)
            GeneralSentry.setTag(`scoreId`, meta.score_id)
            GeneralSentry.setTag(`scoreTitle`, meta.scoreTitle)
            GeneralSentry.setTag(`secondaryScoreId`, meta.secondary_score_id)
            reportEvent('Dev: start loading XTZ', meta)
            ;(async () => {
                const notationStylePath = await getDefaultStyle()
                const jsonParams = {
                    fitMode,
                    noteSize: platform.isAndroid ? DefaultNoteSize : noteSize,
                    defaultNoteSize: DefaultNoteSize,
                    scrollMode,
                    metronomeVolume,
                    playbackSpeed,
                    margins,
                    visibleParts,
                    playableParts,
                    notationStylePath,
                }
                GeneralSentry.addBreadcrumb({
                    category: 'xtz',
                    message: `Open file notation with path: ${source?.uri}`,
                    level: 'info',
                    data: jsonParams,
                })
                xtz.open(source?.uri, format, {
                    ...jsonParams,
                    needDecrypted: true,
                    practiceMode: false,
                    showTitle: true,
                    pageBreaksEnabled: true,
                    playHeadParams: {
                        style: 'withDrop',
                        allowMove: true,
                        widthToNoteSizeRatioDefault: 0.5,
                        widthToNoteSizeRatioIfPressed: 2.0,
                        shouldSetPositionOnTouch: false,
                    },
                    cameraParams: {
                        allowMove: true,
                        userInputPostponeSeconds: 4.0,
                    },
                    midiParams: {
                        harmonyChordsPlayed: true,
                        translateArticulationsToInstChange: true,
                    },
                    resetLoopOnOutOfRegionClick: false,
                    colorScheme: {
                        day: {
                            playbackCursor: '#0089FF7F',
                            playbackCursorDrop: '#8FC2FAFF',
                        },
                        night: {
                            playbackCursor: '#0089FF7F',
                            playbackCursorDrop: '#8FC2FAFF',
                        },
                    },
                })
                if (isCountdownEnabled) xtz.setCountdownEnabled(isCountdownEnabled)
            })().catch(error => {
                if (source?.uri) onScoreOpenFailed(source.uri, error)
            })
        }, []),
    )

    if (!source?.uri) return null

    return (
        <XtzView
            style={{
                width: '100%',
                height: '100%',
                flex: 1,
            }}
            onSingleTap={handleSingleTap}
            noteHintsEnabled={noteHintsEnabled}
            onRetryWebPages={usesWebScoreCache(score) && !source.uri.includes('/OfflineWebScores/') && !score.webScoreSaved
                ? (failedPages: number[], interactive: boolean) => downloadWebScore(score, failedPages, interactive)
                : undefined}
            onCursorInteraction={() => { hasUserInteractedRef.current = true }}
            onLongTap={onGestureLongTap}
            onZoomStart={() => {
                hasUserInteractedRef.current = true
                setIsZoom(true)
            }}
            onZoomEnd={() => setIsZoom(false)}
            onSwipeLeft={() => {
                hasUserInteractedRef.current = true
                actions.setNextPage()
            }}
            onSwipeRight={() => {
                hasUserInteractedRef.current = true
                actions.setPrevPage()
            }}
        />
    )
}

export default XTZContainer
