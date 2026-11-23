import { useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

export const useTourTrialReanimatedStyle = (
    opacityView: SharedValue<number>,
    isShowTrialsModal: boolean,
) => {
    const opacityButtonContainer = useSharedValue(0)
    const transformYPlans = useSharedValue(80)
    const transformXTourImage = useSharedValue(-150)

    useEffect(() => {
        if (!isShowTrialsModal) {
            opacityButtonContainer.value = withTiming(1, { duration: 300 })
            // eslint-disable-next-line no-param-reassign
            opacityView.value = withTiming(1, { duration: 300 })
            transformYPlans.value = withTiming(0, { duration: 800 })
            transformXTourImage.value = withTiming(0, { duration: 800 })
        }
    }, [isShowTrialsModal])

    const animatedValueViewButton = useAnimatedStyle(() => ({
        opacity: opacityButtonContainer.value,
    }))
    const animatedViewSubscriptions = useAnimatedStyle(() => ({
        opacity: opacityView.value,
        transform: [{ translateY: transformYPlans.value }],
    }))
    const animatedViewSwitcher = useAnimatedStyle(() => ({
        transform: [{ translateY: transformYPlans.value }],
    }))

    return {
        animatedValueViewButton,
        animatedViewSubscriptions,
        animatedViewSwitcher,
    }
}
