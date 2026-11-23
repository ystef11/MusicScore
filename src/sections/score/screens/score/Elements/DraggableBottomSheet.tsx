import React, { useCallback, useEffect } from 'react'
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    SharedValue,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

import { colors } from '@mu-native/ds'

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 3,
    },
    handle: {
        width: 36,
        height: 4,
        alignSelf: 'center',
        backgroundColor: colors.gray200,
        borderRadius: 2,
    },

    handleWrapper: {
        height: 24,
        justifyContent: 'center',
    },
})

const AnimatedTouchable = Animated.createAnimatedComponent(Pressable)

const DraggableBottomSheet = ({
    children,
    snapPoints,
    initialSnapIndex,
    visibleHeight,
    onSwitchToSnapPoint,
}: {
    children: React.ReactNode
    snapPoints: number[]
    initialSnapIndex: number
    visibleHeight: SharedValue<number>
    onSwitchToSnapPoint?: (snapPointIndex: number) => void
}) => {
    const height = useSharedValue(0)
    const opacity = useSharedValue(0)
    const startVisibleHeight = useSharedValue(0)

    useEffect(() => {
        visibleHeight.value = withTiming(snapPoints[initialSnapIndex])
        opacity.value = withTiming(0)
    }, [snapPoints, initialSnapIndex])

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            height.value = withTiming(
                Math.max(event.nativeEvent.layout.height, snapPoints[initialSnapIndex]),
                { duration: 300 },
            )
        },
        [snapPoints, initialSnapIndex],
    )

    const panGesture = React.useMemo(() => {
        return Gesture.Pan()
            .onStart(() => {
                startVisibleHeight.value = visibleHeight.value
            })
            .onUpdate(event => {
                const nextValue = startVisibleHeight.value - event.translationY
                const points = [...snapPoints, height.value]
                points.sort((a, b) => a - b)
                const maxHeight = points[points.length - 1] as number
                const minHeight = points[0]
                visibleHeight.value = Math.min(maxHeight, Math.max(minHeight, nextValue))
            })
            .onEnd(() => {
                const points = [...snapPoints, height.value]
                const diffs = points.map((p, snapPointIndex) => ({
                    index: snapPointIndex,
                    diff: Math.abs(p - visibleHeight.value),
                }))
                diffs.sort((a, b) => a.diff - b.diff)
                const minDiffIndex = diffs[0].index
                const nextValue = points[minDiffIndex]

                visibleHeight.value = withTiming(nextValue, { duration: 100 })
                opacity.value = withTiming(nextValue === height.value ? 0.5 : 0)

                if (onSwitchToSnapPoint) {
                    runOnJS(onSwitchToSnapPoint)(minDiffIndex)
                }
            })
    }, [height, snapPoints, onSwitchToSnapPoint])

    const animStyle = useAnimatedStyle(() => {
        if (!height.value) return {}
        return {
            transform: [{ translateY: height.value - visibleHeight.value }],
        }
    })
    const containerAnimStyle = useAnimatedStyle(() => {
        const bgOpacity = opacity.value.toFixed(2)
        return {
            backgroundColor: `rgba(0,0,0,${bgOpacity})`,
            zIndex: 10,
        }
    })
    const animatedProps = useAnimatedProps(() => {
        return {
            pointerEvents: visibleHeight.value > Math.max(...snapPoints) ? 'auto' : 'box-none',
        } as { pointerEvents: 'auto' | 'box-none' }
    })

    const handleBackdropPress = useCallback(() => {
        visibleHeight.value = withTiming(snapPoints[initialSnapIndex], { duration: 300 })
        opacity.value = withTiming(0)
        if (onSwitchToSnapPoint) {
            onSwitchToSnapPoint(initialSnapIndex)
        }
    }, [snapPoints, initialSnapIndex, onSwitchToSnapPoint])

    return (
        <AnimatedTouchable
            style={[styles.container, containerAnimStyle]}
            animatedProps={animatedProps}
            onPress={handleBackdropPress}
        >
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.sheet, animStyle]} onLayout={onLayout as any}>
                    <View style={styles.handleWrapper}>
                        <View style={styles.handle} />
                    </View>
                    {children}
                </Animated.View>
            </GestureDetector>
        </AnimatedTouchable>
    )
}

export default DraggableBottomSheet
