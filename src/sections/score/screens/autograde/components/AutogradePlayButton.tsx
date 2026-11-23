import { StyleSheet } from 'react-native'

import { brandColors, CommonTouchable, Icon } from '@mu-native/ds'
import { pause } from '@mu-native/icons/pause'
import { play } from '@mu-native/icons/play'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

const styles = StyleSheet.create({
    container: {
        borderRadius: 26,
        height: 44,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playbackContainer: {
        backgroundColor: brandColors.contentPrimary,
    },
    recordingContainer: {
        backgroundColor: brandColors.colorBackgroundDisabled,
    },
})

export const AutogradePlayButton = () => {
    const [isPlaying, state] = useValues([
        autogradeScreenStoreChunk.props.getIsPlaying,
        autogradeScreenStoreChunk.props.getState,
    ])

    const actions = useActions({
        togglePlay: autogradeScreenThunks.togglePlay,
    })

    const onTogglePlay = actions.togglePlay

    const isRecording = state === AutogradeState.Recording
    const containerStyle = isRecording ? styles.recordingContainer : styles.playbackContainer
    const icon = isPlaying ? pause : play

    return (
        <CommonTouchable
            isHapticEnabled
            style={[styles.container, containerStyle]}
            onPress={onTogglePlay}
            disabled={isRecording}
        >
            <Icon source={icon} size={20} tint={brandColors.backgroundDefault} />
        </CommonTouchable>
    )
}
