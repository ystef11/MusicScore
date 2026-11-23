import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
    cancelAnimation,
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { globalStyles, icons } from '@mu-native/ds'
import { useValues } from '@ug/store'

import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

const ANIMATION_DURATION = 6000

const styles = StyleSheet.create({
    collectionBackgroundImage: {
        height: platform.isTablet ? '400%' : '200%',
        position: 'absolute',
    },
})

const BackgroundComponent = () => {
    const image = useSharedValue(0)
    const [isPausedBackgroundAnimation] = useValues([
        tourInstallScreenStoreChunk.props.getIsPausedBackgroundAnimation,
    ])

    useEffect(() => {
        if (isPausedBackgroundAnimation) {
            cancelAnimation(image)
            return
        }

        image.value = withTiming(1, {
            duration: ANIMATION_DURATION * (1 - image.value),
        })
    }, [isPausedBackgroundAnimation])

    const transformStyleImage = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(image.value, [0, 1], [-350, -20]) }],
    }))

    return (
        <Animated.View entering={FadeIn.duration(600)} style={StyleSheet.absoluteFill}>
            <Animated.Image
                source={icons.tourFirstStep}
                style={[
                    styles.collectionBackgroundImage,
                    globalStyles.fullWidth,
                    transformStyleImage,
                ]}
            />
        </Animated.View>
    )
}

export default React.memo(BackgroundComponent)
