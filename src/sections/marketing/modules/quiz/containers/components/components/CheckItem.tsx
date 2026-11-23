import { memo, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import { brandColors, colors, icons, layoutHelpers } from '@mu-native/ds'

const styles = StyleSheet.create({
    checkItemContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: layoutHelpers.getResponsiveSizeExtended(30),
        height: layoutHelpers.getResponsiveSizeExtended(30),
    },
    checkIconStyle: {
        position: 'absolute',
        zIndex: 2,
        width: layoutHelpers.getResponsiveSizeExtended(24),
        height: layoutHelpers.getResponsiveSizeExtended(24),
    },
    splashIconStyle: {
        width: layoutHelpers.getResponsiveSizeExtended(46),
        height: layoutHelpers.getResponsiveSizeExtended(46),
        zIndex: 1,
        position: 'absolute',
        tintColor: brandColors.statusSuccess,
    },
    splashGreenColor: {
        tintColor: colors.green500,
    },
})

type TCheckItemProps = {
    isChecked: boolean
    isDisableAnimation?: boolean
}

export const CheckItem = memo(({ isChecked, isDisableAnimation = false }: TCheckItemProps) => {
    const scaleValue = useSharedValue(isDisableAnimation ? 1 : 0)
    const scaleSplashValue = useSharedValue(isDisableAnimation ? 1 : 0)
    const opacitySplash = useSharedValue(isDisableAnimation ? 0 : 1)
    const opacityCheck = useSharedValue(isDisableAnimation ? 1 : 0)

    useEffect(() => {
        if (!isDisableAnimation) {
            if (isChecked) {
                opacityCheck.value = withTiming(1, {
                    duration: 150,
                })
                scaleValue.value = withTiming(1, {
                    duration: 300,
                })
                scaleSplashValue.value = withTiming(
                    1,
                    {
                        duration: 300,
                        easing: Easing.bezier(0.46, 0.05, 0.38, 1.87),
                    },
                    (isFinish?: boolean) => {
                        if (isFinish) {
                            scaleSplashValue.value = withDelay(
                                250,
                                withTiming(1.2, {
                                    duration: 200,
                                }),
                            )
                            opacitySplash.value = withDelay(
                                200,
                                withTiming(0, {
                                    duration: 300,
                                }),
                            )
                            scaleValue.value = withDelay(
                                250,
                                withTiming(0.85, {
                                    duration: 300,
                                    easing: Easing.bezier(0.46, 0.05, 0.38, 1.87),
                                }),
                            )
                        }
                    },
                )
            } else {
                opacityCheck.value = withTiming(
                    0,
                    {
                        duration: 200,
                    },
                    (finished?: boolean) => {
                        if (finished) {
                            scaleValue.value = withTiming(1, {
                                duration: 10,
                            })
                            scaleSplashValue.value = withTiming(0, {
                                duration: 10,
                            })
                            opacitySplash.value = withTiming(1, {
                                duration: 10,
                            })
                        }
                    },
                )
            }
        }
    }, [isChecked])

    const scaleStyles = useAnimatedStyle(() => ({
        opacity: opacityCheck.value,
        transform: [{ scale: scaleValue.value }],
    }))

    const scaleStylesSplash = useAnimatedStyle(() => ({
        transform: [{ scale: scaleSplashValue.value }],
        opacity: opacitySplash.value,
    }))

    return (
        <View style={styles.checkItemContainer}>
            <Animated.Image
                source={icons.successFilled}
                style={[styles.checkIconStyle, scaleStyles]}
            />
            <Animated.Image
                source={icons.radioButtonSplash}
                style={[styles.splashIconStyle, scaleStylesSplash]}
            />
        </View>
    )
})
