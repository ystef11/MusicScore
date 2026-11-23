import React, { useRef } from 'react'
import { StyleSheet, View, type ViewInstance } from 'react-native'

import { brandColors, layout } from '@mu-native/ds'
import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import { useCurrentScore } from '../../hooks/useCurrentScore'

import { ScoreCursorButton } from './experiment2/ScoreCursorButton'
import { ScoreFullscreenButton } from './experiment2/ScoreFullscreenButton'
import { ScoreLoopButton } from './experiment2/ScoreLoopButton'
import { ScorePlayButton } from './experiment2/ScorePlayButton'
import { ScoreRewindButton } from './experiment2/ScoreRewindButton'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 22,
        height: 44,
        paddingHorizontal: 13,
        columnGap: 4,
        alignSelf: 'center',
    },

    fullScreenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        height: 44,
        width: 44,
        alignSelf: 'flex-end',
        marginEnd: layout.baseMarginFromEdges,
    },
    root: {
        paddingBottom: 16,
    },
})

export const FloatingPlayerView = React.memo(() => {
    const score = useCurrentScore()
    const playButtonRef = useRef<ViewInstance>(null)
    const [isScoreLoaded] = useValues([scoreStoreChunk.props.getIsSuccessLoading])
    const isPdf = score?.isPdf
    const bg = brandColors.colorActionFloatDefault

    return (
        <View style={styles.root}>
            {isPdf && (
                <View style={[styles.fullScreenButton, { backgroundColor: bg }]}>
                    <ScoreFullscreenButton isEnabled={isScoreLoaded} />
                </View>
            )}

            {!isPdf && (
                <View style={[styles.container, { backgroundColor: bg }]}>
                    <ScoreLoopButton isEnabled={isScoreLoaded} />
                    <ScoreRewindButton isEnabled={isScoreLoaded} />
                    <View ref={playButtonRef} collapsable={false}>
                        <ScorePlayButton isEnabled={isScoreLoaded} />
                    </View>

                    <ScoreCursorButton isEnabled={isScoreLoaded} />
                    <ScoreFullscreenButton isEnabled={isScoreLoaded} />
                </View>
            )}
        </View>
    )
})
