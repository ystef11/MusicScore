import { StyleSheet, View } from 'react-native'

import { RNFS } from '@mu-native/common'
import { brandColors, CommonTouchable } from '@mu-native/ds'
import { xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'

const styles = StyleSheet.create({
    container: {
        borderColor: brandColors.additionalAttention,
        borderWidth: 2,
        borderRadius: 22,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: brandColors.additionalAttention,
    },
    innerSquare: {
        width: 16,
        height: 16,
        backgroundColor: brandColors.additionalAttention,
    },
})

export const AutogradeRecordingButton = () => {
    const [state] = useValues([
        autogradeScreenStoreChunk.props.getState,
    ])
    const actions = useActions({
        setIsPlaying: autogradeScreenStoreChunk.actions.setIsPlaying,
        setState: autogradeScreenStoreChunk.actions.setState,
        resetBeforeRecording: autogradeScreenStoreChunk.actions.resetBeforeRecording,
        toggleRecording: autogradeScreenThunks.toggleRecording,
    })

    const isRecording = state === AutogradeState.Recording
    const onToggleRecord = actions.toggleRecording

    const innerStyle = isRecording ? styles.innerSquare : styles.innerCircle

    return (
        <CommonTouchable isHapticEnabled style={styles.container} onPress={onToggleRecord}>
            <View style={innerStyle} />
        </CommonTouchable>
    )
}
