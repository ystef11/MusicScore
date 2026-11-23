import { useEffect } from 'react'
import { PixelRatio, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import { DefaultNoteSize } from '@mu-native/score'
import { xtz, XtzView, getDefaultStyle } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'
import { scrollMode } from '@xtz/muse-rn'

import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { onScoreOpenFailed } from '../../score/helpers/scoreOpenFailure.ts'
import { useXtzSubscriptions } from '../hooks/useXtzSubscriptions.ts'
import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'

const styles = StyleSheet.create({
    scoreContainer: {
        marginVertical: 8,
        flex: 1,
    },
})

const format = 'MUSESCORE_ANY' as const

// xtz.tryLoadingAdditionalFonts()

export const AutogradeXTZWrapper = ({ score, uri }: { uri: string; score: MSScoreT }) => {
    const [
        part,
        playbackSpeed,
        gracefullyClosingScreen,
        isOrientationLocked,
    ] = useValues([
        autogradeScreenStoreChunk.props.getActivePart,
        autogradeScreenStoreChunk.props.getPlaybackSpeed,
        autogradeScreenStoreChunk.props.getGracefullyClosingScreen,
        autogradeScreenStoreChunk.props.getIsOrientationLocked,
    ])
    const actions = useActions({
        ...autogradeScreenStoreChunk.actions,
    })

    const showXtz = isOrientationLocked && !gracefullyClosingScreen

    useXtzSubscriptions()

    useEffect(() => {
        if (!isOrientationLocked) {
            return
        }

        requestAnimationFrame(() => {
            ; (async () => {
                reportEvent('Dev: start loading XTZ', getScoreMetaEvent(score))
                const notationStylePath = await getDefaultStyle()
                xtz.open(uri, format, {
                    loadScoreToMae: true,
                    showTitle: true,
                    pageBreaksEnabled: true,
                    noteSize: DefaultNoteSize,
                    scrollMode: scrollMode.horizontal,
                    playbackSpeed,
                    needDecrypted: true,
                    visibleParts: [part],
                    playableParts: [part],
                    playHeadParams: {
                        style: "withDrop",
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
                    notationStylePath,
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
            })().catch(error => onScoreOpenFailed(uri, error))
        })
    }, [isOrientationLocked])

    const onToggleFullscreen = actions.toggleFullscreen

    const onGestureLongTap = (e: { nativeEvent: { x: number; y: number } }) => {
        const { x, y } = e.nativeEvent
        const density = platform.isAndroid ? PixelRatio.get() : 1
        xtz.setCursorPosition(x / density, y / density)
    }

    return (
        <View style={styles.scoreContainer}>
            {showXtz && (
                <XtzView
                    style={{ flex: 1 }}
                    onSingleTap={onToggleFullscreen as any}
                    onLongTap={onGestureLongTap}
                />
            )}
        </View>
    )
}
