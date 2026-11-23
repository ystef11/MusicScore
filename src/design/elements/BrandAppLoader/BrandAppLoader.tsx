import { useEffect } from 'react'
import { ImageStyle, StyleProp } from 'react-native'
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'

import { icons } from '../../constants/icons.ts'

type Props = {
    size?: Size // ширина/высота
    durationMs?: number // один полный оборот
    playing?: boolean // можно паузить
    clockwise?: boolean // направление
    style?: StyleProp<ImageStyle>
    color?: string
}

type Size = 'xl' | 'l' | 'm' | 's' | 'xs'
const Sizes: Record<Size, number> = {
    xl: 64,
    l: 40,
    m: 24,
    s: 20,
    xs: 16,
}

export const BrandAppLoader = ({
    size = 'l',
    durationMs = 900,
    playing = true,
    clockwise = true,
    style,
    color,
}: Props) => {
    const progress = useSharedValue(0)

    useEffect(() => {
        cancelAnimation(progress)
        if (!playing) return () => null

        // бесконечная линейная анимация
        progress.value = 0
        progress.value = withRepeat(
            withTiming(1, { duration: durationMs, easing: Easing.linear }),
            -1,
            false,
        )

        return () => {
            cancelAnimation(progress)
        }
    }, [playing, durationMs])

    const animatedStyle = useAnimatedStyle(() => {
        const angle = (clockwise ? 1 : -1) * progress.value * 360
        return {
            transform: [{ rotate: `${angle}deg` }],
        }
    }, [clockwise])

    return (
        <Animated.Image
            source={icons.brandLoader}
            tintColor={color}
            style={[
                {
                    width: Sizes[size],
                    height: Sizes[size],
                    alignSelf: 'center',
                },
                animatedStyle,
                style,
            ]}
            resizeMode="contain"
        />
    )
}
