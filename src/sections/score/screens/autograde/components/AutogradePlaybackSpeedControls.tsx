import { Pressable, StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, Slider } from '@mu-native/ds'
import { close } from '@mu-native/icons/close'
import { useValues, useActions } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'

type Props = {
    visible: boolean
    onClose: () => void
}

const styles = StyleSheet.create({
    playbackSpeedControls: {
        flexDirection: 'row',
        backgroundColor: brandColors.contentPrimary,
        borderRadius: 2,
        paddingVertical: 12,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 8,
    },
    playbackSpeedControlsText: {
        width: 55,
        textAlign: 'center',
    },
    playbackSpeedControlsClose: {
        width: 55,
        alignItems: 'center',
    },
    slider: {
        width: 260,
    },
})

export const AutogradePlaybackSpeedControls = ({ visible, onClose }: Props) => {
    const [playbackSpeed] = useValues([autogradeScreenStoreChunk.props.getPlaybackSpeed])
    const actions = useActions({
        ...autogradeScreenThunks,
    })

    const onPlaybackSpeedChange = (value: number) => {
        actions.setPlaybackSpeed(value)
    }

    if (!visible) return null

    return (
        <View style={styles.playbackSpeedControls}>
            <AppText style={styles.playbackSpeedControlsText} brandColor="backgroundDefault">
                {playbackSpeed.toFixed(1)}x
            </AppText>
            <Slider
                value={playbackSpeed}
                minimumValue={0.2}
                maximumValue={2}
                step={0.1}
                onValueChange={onPlaybackSpeedChange}
                style={styles.slider}
                bubbleBackgroundColor={brandColors.backgroundDefault}
                minimumTrackTintColor={brandColors.backgroundDefault}
                maximumTrackTintColor={brandColors.backgroundDisabledTransparent}
            />
            <Pressable style={styles.playbackSpeedControlsClose} onPress={onClose}>
                <Icon source={close} size={24} tint={brandColors.backgroundDefault} />
            </Pressable>
        </View>
    )
}
