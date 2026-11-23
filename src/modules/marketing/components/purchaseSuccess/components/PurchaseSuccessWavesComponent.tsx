import { memo, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

import { icons } from '@mu-native/ds'
import { useWindowDimensions } from '@mu-native/system'

const wavesAspectRatio = 1624 / 750
const appearance = {
    startScale: 1.08,
    duration: 600,
}
const sway = {
    angle: 1.2,
    scale: 0.015,
    duration: 3000,
}
const maxTopCutRatio = 0.25

const getWavesBaseScale = (width: number, height: number) => {
    const angle = (sway.angle * Math.PI) / 180
    const coverScale = Math.cos(angle) + (height / width) * Math.sin(angle)

    return coverScale / (1 - sway.scale)
}

const styles = StyleSheet.create({
    waves: {
        position: 'absolute',
        left: 0,
    },
})

export const PurchaseSuccessWavesComponent = memo(() => {
    const { width, height } = useWindowDimensions()
    const opacity = useSharedValue(0)
    const scale = useSharedValue(appearance.startScale)
    const swayProgress = useSharedValue(0)

    const wavesHeight = width * wavesAspectRatio
    const wavesTop = Math.max(
        -wavesHeight * maxTopCutRatio,
        Math.min(0, (height - wavesHeight) / 2),
    )
    const baseScale = getWavesBaseScale(width, height)

    useEffect(() => {
        opacity.value = withTiming(1, { duration: appearance.duration })
        scale.value = withTiming(
            1,
            { duration: appearance.duration, easing: Easing.out(Easing.cubic) },
            isFinished => {
                if (!isFinished) return

                swayProgress.value = withSequence(
                    withTiming(1, {
                        duration: sway.duration / 2,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    withRepeat(
                        withTiming(-1, {
                            duration: sway.duration,
                            easing: Easing.inOut(Easing.sin),
                        }),
                        -1,
                        true,
                    ),
                )
            },
        )
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { rotate: `${interpolate(swayProgress.value, [-1, 1], [-sway.angle, sway.angle])}deg` },
            {
                scale:
                    baseScale *
                    (scale.value +
                        interpolate(swayProgress.value, [-1, 1], [-sway.scale, sway.scale])),
            },
        ],
    }))

    return (
        <Animated.Image
            source={icons.successScreenWaves}
            resizeMode="cover"
            style={[styles.waves, { width, height: wavesHeight, top: wavesTop }, animatedStyle]}
        />
    )
})
