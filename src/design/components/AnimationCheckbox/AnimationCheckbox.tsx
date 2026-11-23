import { useEffect } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { colors } from '../../constants/colors.ts'
import { Checkbox } from '../../elements/Checkbox/Checkbox'
import { layoutHelpers } from '../../helpers/layout.ts'

const styles = StyleSheet.create({
    checkboxContainer: {
        width: layoutHelpers.getResponsiveSizeExtended(20),
        height: layoutHelpers.getResponsiveSizeExtended(20),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
        marginRight: layoutHelpers.getResponsiveSizeExtended(10),
    },
    checkboxCheckedContainer: {
        width: layoutHelpers.getResponsiveSizeExtended(20),
        height: layoutHelpers.getResponsiveSizeExtended(20),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.link,
        backgroundColor: colors.link,
    },
})

type Props = {
    checked: boolean
    checkBoxStyle?: StyleProp<ViewStyle>
    style?: StyleProp<ViewStyle>
}

const useScaleAnimation = (checked: boolean) => {
    const opacity = useSharedValue(0)

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }))

    useEffect(() => {
        if (checked) {
            opacity.value = withTiming(1, { duration: 300, easing: Easing.linear })
        }
        if (!checked) {
            opacity.value = withTiming(0, { duration: 100, easing: Easing.linear })
        }
    }, [checked])

    return { opacityStyle }
}

export const AnimationCheckbox = ({ checked, checkBoxStyle, style }: Props) => {
    const { opacityStyle } = useScaleAnimation(checked)
    return (
        <Animated.View style={[styles.checkboxContainer, style]}>
            <Animated.View style={[styles.checkboxCheckedContainer, checkBoxStyle, opacityStyle]}>
                <Checkbox selected />
            </Animated.View>
        </Animated.View>
    )
}
