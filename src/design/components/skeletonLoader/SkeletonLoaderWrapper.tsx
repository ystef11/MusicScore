import { ReactNode, useEffect } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
} from 'react-native-reanimated'

export const SkeletonLoaderWrapper = ({
    children,
    style,
}: {
    children: ReactNode
    style?: StyleProp<ViewStyle>
}) => {
    const opacity = useSharedValue(1)

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.4, { duration: 1000 }), 0, true)
    }, [])

    const animStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    })

    return <Animated.View style={[style, animStyle]}>{children}</Animated.View>
}
