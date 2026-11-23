import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { useAppleWatchScorePlayLogic } from '@mu-native/apple-watch-module'
import { brandColors, colors, CommonTouchable, Icon, ProgressCircle } from '@mu-native/ds'
import { pause } from '@mu-native/icons/pause'
import { play } from '@mu-native/icons/play'
import { getCurrentPlaybackPercentPosition, scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import { useOnPressPlayHandler } from '../../../hooks/useOnPressPlayHandler'

type TProps = {
    readonly isEnabled: boolean
    readonly background?: string
    readonly size?: number
    styles?: StyleProp<ViewStyle>
}

function usePlayScore() {
    const [isPlaying] = useValues([scoreStoreChunk.props.getIsPlaying])
    const onPressPlay = useOnPressPlayHandler()
    return { onPress: onPressPlay, isPlaying }
}

const ProgressView = ({ isPlaying }: { isPlaying: boolean }) => {
    const [progress] = useValues([getCurrentPlaybackPercentPosition])
    if (!isPlaying) return null
    return (
        <ProgressCircle
            testID={scoreTestIds.scorePlayProgressCircle}
            progress={progress / 100.0}
            color={brandColors.accentSecondary}
            size={36}
            borderWidth={0}
            style={styles.absolute}
        />
    )
}

export const ScorePlayButton = React.memo((props: TProps) => {
    const { isPlaying, onPress } = usePlayScore()
    useAppleWatchScorePlayLogic({ isPlaying, onPress })

    return (
        <CommonTouchable
            testID={scoreTestIds.scorePlay}
            style={[
                styles.playButton,
                {
                    opacity: props.isEnabled ? 1 : 0.6,
                    backgroundColor: props.background ?? colors.white,
                },
                props.size ? { width: props.size, height: props.size } : null,
                props.styles,
            ]}
            isHapticEnabled
            onPress={props.isEnabled ? onPress : undefined}
        >
            <Icon
                source={isPlaying ? pause : play}
                tint={props.background ? brandColors.exceptionConstantLight : undefined}
                testID={
                    isPlaying
                        ? scoreTestIds.scorePlayStatePlaying
                        : scoreTestIds.scorePlayStatePaused
                }
            />
            <ProgressView isPlaying={isPlaying} />
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    playButton: {
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        marginHorizontal: 16,
    },

    absolute: {
        position: 'absolute',
    },
})
