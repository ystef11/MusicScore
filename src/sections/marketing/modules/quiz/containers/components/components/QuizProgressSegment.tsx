import { memo, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { brandColors, layoutHelpers } from '@mu-native/ds'

const { getResponsiveSizeExtended } = layoutHelpers

const SEGMENT_ANIMATION_DURATION = 400

const styles = StyleSheet.create({
    segment: {
        width: '100%',
        height: getResponsiveSizeExtended(4),
        borderRadius: getResponsiveSizeExtended(2),
    },
})

export const QuizProgressSegment = memo(({ isFilled }: { isFilled: boolean }) => {
    const progress = useSharedValue(isFilled ? 1 : 0)

    useEffect(() => {
        progress.value = withTiming(isFilled ? 1 : 0, { duration: SEGMENT_ANIMATION_DURATION })
    }, [isFilled])

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            progress.value,
            [0, 1],
            [brandColors.colorBackgroundDisabled, brandColors.contentPrimary],
        ),
    }))

    return <Animated.View style={[styles.segment, animatedStyle]} />
})
