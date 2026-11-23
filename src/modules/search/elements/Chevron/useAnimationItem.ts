import { useEffect } from 'react'
import { withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated'

const startAngles = {
    down: 0,
    up: -180,
    right: -90,
} as const

const finishAngles = {
    down: -180,
    up: 0,
    right: 0,
} as const

export const useRotateAnimation = (expanded: boolean, type: 'right' | 'down' | 'up' = 'down') => {
    const startAngle = startAngles[type]
    const finishAngle = finishAngles[type]
    const rotate = useSharedValue(startAngle)

    const rotateStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotate.value}deg` }],
        }
    })

    useEffect(() => {
        if (!expanded) {
            rotate.value = withTiming(startAngle, { duration: 300, easing: Easing.linear })
        }
        if (expanded) {
            rotate.value = withTiming(finishAngle, { duration: 300, easing: Easing.linear })
        }
    }, [expanded])

    return { rotateStyle }
}
