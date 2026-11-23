import { memo } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
    AnimatedStyle,
    Extrapolate,
    interpolate,
    SharedValue,
    useAnimatedStyle,
} from 'react-native-reanimated'

import { colors } from '../../constants/colors'
import { layoutHelpers } from '../../helpers/layout'
import { style } from '../../helpers/style'

const styles = StyleSheet.create({
    dotContainer: style.view({
        borderRadius: 50,
        overflow: 'hidden',
        marginHorizontal: layoutHelpers.getResponsiveSizeExtended(4),
    }),
    dotItem: style.view({
        borderRadius: 50,
        flex: 1,
    }),
})
const dynamicStyles = {
    getDotItemStyle: (backgroundColor: string, animStyle: AnimatedStyle<ViewStyle>) => [
        styles.dotItem,
        { backgroundColor },
        animStyle,
    ],
}
type TPaginationDotItemProps = {
    index: number
    backgroundColor: string
    length: number
    animValue: SharedValue<number>
    dotSize: number
    customDotContainer: ViewStyle
    isScaleDots: boolean
    inactiveBgColorDots?: string
}

const PaginationDotItem = ({
    animValue,
    index,
    length,
    backgroundColor,
    dotSize,
    customDotContainer = {},
    isScaleDots,
    inactiveBgColorDots = colors.white,
}: TPaginationDotItemProps) => {
    const animStyle = useAnimatedStyle(() => {
        let inputRange = [index - 1, index, index + 1]
        let outputRange = [-dotSize, 0, dotSize]

        if (index === 0 && animValue?.value > length - 1) {
            inputRange = [length - 1, length, length + 1]
            outputRange = [-dotSize, 0, dotSize]
        }

        if (isScaleDots) {
            return {
                transform: [
                    {
                        scale: interpolate(
                            animValue?.value,
                            [index - 1, index, index + 1],
                            [0.4, 1, 0.4],
                            Extrapolate.CLAMP,
                        ),
                    },
                ],
            }
        }
        return {
            transform: [
                {
                    translateX: interpolate(
                        animValue?.value,
                        inputRange,
                        outputRange,
                        Extrapolate.CLAMP,
                    ),
                },
            ],
        }
    }, [animValue, index, length, isScaleDots])

    return (
        <View
            style={[
                styles.dotContainer,
                customDotContainer,
                { width: dotSize, height: dotSize, backgroundColor: inactiveBgColorDots },
            ]}
        >
            <Animated.View style={dynamicStyles.getDotItemStyle(backgroundColor, animStyle)} />
        </View>
    )
}

export default memo(PaginationDotItem)
