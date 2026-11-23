import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Reanimated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    interpolateColor,
} from 'react-native-reanimated'

import { AppText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export const AutogradePreparingOverlay = () => {
    const [state] = useValues([autogradeScreenStoreChunk.props.getState])

    const isPreparing = state === AutogradeState.Preparing
    const opacity = useSharedValue(0)
    const scale = useSharedValue(0)

    useEffect(() => {
        opacity.value = withTiming(isPreparing ? 0.6 : 0)
        scale.value = withTiming(isPreparing ? 1 : 0)
    }, [isPreparing])

    const animStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                opacity.value,
                [0, 1],
                ['rgba(0,0,0,0)', 'rgba(0,0,0,1)'],
            ),
        }
    })
    const textAnimStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    return (
        <Reanimated.View
            style={[styles.container, animStyle]}
            pointerEvents={isPreparing ? 'auto' : 'none'}
        >
            <Reanimated.View style={textAnimStyle}>
                <AppText
                    font="f88w400Accent"
                    brandColor="backgroundDefault"
                    rawText={translate('native.autograde.ready')}
                />
            </Reanimated.View>
        </Reanimated.View>
    )
}
