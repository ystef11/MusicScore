import { useEffect, useMemo } from 'react'
import { Image, LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

import { brandColors, icons } from '@mu-native/ds'
import { useValues } from '@ug/store'
import { xtz } from '@xtz/muse-rn'

import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
    },
    content: {
        height: 16,
        width: '100%',
    },
    handle: {
        position: 'absolute',
        height: 44,
        width: 16,
        backgroundColor: brandColors.contentPrimary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftHandle: {
        borderBottomLeftRadius: 2,
        borderTopLeftRadius: 2,
    },
    rightHandle: {
        borderBottomRightRadius: 2,
        borderTopRightRadius: 2,
    },
    box: {
        ...StyleSheet.absoluteFill,
        height: 44,
        borderWidth: 1,
        borderColor: brandColors.contentPrimary,
    },
    handleIcon: {
        width: 4,
        height: 16,
    },
    rightHandleIcon: {
        transform: [{ rotate: '180deg' }],
    },
})

export const AutogradeTimelineCrop = () => {
    const [duration, position, selectedRange] = useValues([
        autogradeScreenStoreChunk.props.getDuration,
        autogradeScreenStoreChunk.props.getPlaybackPosition,
        autogradeScreenStoreChunk.props.getSelectedRange,
    ])
    const leftHandleX = useSharedValue(-20)
    const rightHandleX = useSharedValue(200)

    const maxTranslateX = useSharedValue(0)
    const onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        rightHandleX.value = layout.width + 4
        maxTranslateX.value = layout.width + 4
    }

    useEffect(() => {
        if (!selectedRange || !maxTranslateX.value) return

        const { startSec, endSec } = selectedRange
        leftHandleX.value = (startSec / duration) * maxTranslateX.value
        rightHandleX.value = (endSec / duration) * maxTranslateX.value
    }, [selectedRange])

    const handleWidth = 20

    const setRangeSelectionRegionFromSec = (start: number, end: number) => {
        xtz.setRangeSelectionRegionFromSec(start, end)
    }

    const setCurrentSecond = (second: number) => {
        xtz.setCurrentSecond(second, true, true)
    }

    const leftPanStartX = useSharedValue(0)
    const leftGestureHandler = useMemo(() => {
        return Gesture.Pan()
            .onStart(() => {
                leftPanStartX.value = leftHandleX.value
            })
            .onChange(event => {
                const nextX = leftPanStartX.value + event.translationX
                leftHandleX.value = Math.max(-20, Math.min(nextX, rightHandleX.value - handleWidth))
            })
            .onEnd(() => {
                const startSec = ((leftHandleX.value + 16) / maxTranslateX.value) * duration
                const endSec = ((rightHandleX.value + 16) / maxTranslateX.value) * duration
                if (position / duration < leftHandleX.value / maxTranslateX.value) {
                    runOnJS(setCurrentSecond)(startSec)
                }
                runOnJS(setRangeSelectionRegionFromSec)(startSec, selectedRange?.endSec ?? endSec)
            })
    }, [
        duration,
        handleWidth,
        leftHandleX,
        leftPanStartX,
        maxTranslateX.value,
        position,
        rightHandleX,
        selectedRange?.endSec,
    ])

    const rightPanStartX = useSharedValue(0)
    const rightGestureHandler = useMemo(() => {
        return Gesture.Pan()
            .onStart(() => {
                rightPanStartX.value = rightHandleX.value
            })
            .onChange(event => {
                const nextX = rightPanStartX.value + event.translationX
                rightHandleX.value = Math.min(
                    maxTranslateX.value,
                    Math.max(nextX, leftHandleX.value + handleWidth),
                )
            })
            .onEnd(() => {
                const startSec = ((leftHandleX.value + 16) / maxTranslateX.value) * duration
                const endSec = ((rightHandleX.value + 16) / maxTranslateX.value) * duration
                if (position / duration > rightHandleX.value / maxTranslateX.value) {
                    runOnJS(setCurrentSecond)(startSec)
                }
                runOnJS(setRangeSelectionRegionFromSec)(
                    (selectedRange?.startSec ?? startSec) + 0.1,
                    endSec,
                )
            })
    }, [
        duration,
        handleWidth,
        leftHandleX,
        maxTranslateX.value,
        position,
        rightHandleX,
        rightPanStartX,
        selectedRange?.startSec,
    ])

    const leftHandleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: leftHandleX.value }],
    }))

    const rightHandleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: rightHandleX.value }],
    }))

    const boxStyle = useAnimatedStyle(() => ({
        left: leftHandleX.value + 6,
        right: maxTranslateX.value - rightHandleX.value - 6,
    }))

    return (
        <View style={styles.container} onLayout={onLayout}>
            <View style={styles.content}>
                <Reanimated.View pointerEvents="none" style={[styles.box, boxStyle]} />
                <GestureDetector gesture={leftGestureHandler}>
                    <Reanimated.View style={[styles.handle, styles.leftHandle, leftHandleStyle]}>
                        <Image source={icons.autogradeCropHandle} style={styles.handleIcon} />
                    </Reanimated.View>
                </GestureDetector>
                <GestureDetector gesture={rightGestureHandler}>
                    <Reanimated.View style={[styles.handle, styles.rightHandle, rightHandleStyle]}>
                        <Image
                            source={icons.autogradeCropHandle}
                            style={[styles.handleIcon, styles.rightHandleIcon]}
                        />
                    </Reanimated.View>
                </GestureDetector>
            </View>
        </View>
    )
}
