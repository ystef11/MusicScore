import { useEffect, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'
import Reanimated, {
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated'
import { runOnJS } from 'react-native-worklets'

import { formatSecondsAsMinutesAndSeconds } from '@mu-native/common'
import { AppText, brandColors } from '@mu-native/ds'
import { useValues } from '@ug/store'

import { xtz } from '@mu-native/xtz'
import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

import { AutogradeTimelineCrop } from './AutogradeTimelineCrop.tsx'
import { AutogradeTimelineMistakesView } from './AutogradeTimelineMistakesView.tsx'

const ThumbSize = 20
const TimelineHitSlop = { top: 10, bottom: 10 }
const ThumbHitSlop = { top: 5, bottom: 5, left: 5, right: 5 }

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 32,
    },
    timelineWrapper: {
        height: 20,
        justifyContent: 'center',
        flex: 1,
    },
    timeline: {
        height: 6,
        backgroundColor: brandColors.backgroundInactive,
        borderRadius: 4,
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    fillPlayback: {
        backgroundColor: brandColors.accentPrimary,
    },
    fillRecording: {
        backgroundColor: brandColors.contentPrimary,
    },
    recordingIndicator: {
        backgroundColor: brandColors.additionalAttention,
        width: 4,
        height: 4,
        borderRadius: 4,
        marginRight: 6,
    },
    timeLabelWrapper: {
        position: 'absolute',
        left: 0,
        top: -8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumb: {
        width: ThumbSize,
        height: ThumbSize,
        borderRadius: ThumbSize / 2,
        backgroundColor: brandColors.accentPrimary,
        position: 'absolute',
        top: -8,
        left: ThumbSize / 2,
    },
})

export const AutogradeTimeline = () => {
    const [state, position, duration, isEnabledRangeSelection, detailedResults] = useValues([
        autogradeScreenStoreChunk.props.getState,
        autogradeScreenStoreChunk.props.getPlaybackPosition,
        autogradeScreenStoreChunk.props.getDuration,
        autogradeScreenStoreChunk.props.getIsRangeSelectionEnabled,
        autogradeScreenStoreChunk.props.getDetailedResults,
    ])

    const [timelineWidth, setTimelineWidth] = useState(0)

    const onLayout = ({
        nativeEvent: {
            layout: { width },
        },
    }: LayoutChangeEvent) => setTimelineWidth(width)

    const isRecording = state === AutogradeState.Recording
    const fillStyle = isRecording ? styles.fillRecording : styles.fillPlayback

    const elapsedTimeLabel = formatSecondsAsMinutesAndSeconds(position)
    const totalTimeLabel = formatSecondsAsMinutesAndSeconds(duration)

    const translateX = useSharedValue(0)

    const maxTranslateX = timelineWidth
    const disabled = isRecording

    const isScrubbingRef = useRef(false)

    const onValueChange = async (seconds: number) => {
        await xtz.setCurrentSecond(seconds, true, true)
        setTimeout(() => {
            isScrubbingRef.current = false
        }, 500)
    }

    const setIsScrubbing = (value: boolean) => {
        isScrubbingRef.current = value
    }

    const panStartTranslateX = useSharedValue(0)
    const panGestureHandler = useMemo(() => {

        return Gesture.Pan()
            .onStart((event) => {
                if (disabled) return
                runOnJS(setIsScrubbing)(true)
                panStartTranslateX.value = translateX.value
            })
            .onChange((event) => {
                if (disabled) return
                let newTranslateX = panStartTranslateX.value + event.translationX
                newTranslateX = Math.max(0, Math.min(newTranslateX, maxTranslateX))
                translateX.value = newTranslateX
            })
            .onEnd(() => {
                if (disabled || !maxTranslateX) return
                runOnJS(onValueChange)((translateX.value / maxTranslateX) * duration)
            })
    }, [disabled, duration, maxTranslateX, panStartTranslateX, translateX])

    const tapGestureHandler = useMemo(() => {
        return Gesture.Tap().onEnd((event) => {
            if (disabled) return
            const newX = event.x - ThumbSize / 2
            translateX.value = Math.min(Math.max(newX, 0), maxTranslateX)
            runOnJS(onValueChange)((translateX.value / maxTranslateX) * duration)
        })
    }, [disabled, duration, maxTranslateX, translateX])

    useEffect(() => {
        if (!isScrubbingRef.current && maxTranslateX) {
            const newX = (position / duration) * maxTranslateX
            translateX.value = Math.min(Math.max(newX, 0), maxTranslateX)
        }
    }, [position])

    const derivedTranslateX = useDerivedValue(() => {
        const newX = isFinite(translateX.value) ? translateX.value : 0
        return newX
    }, [translateX])

    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: derivedTranslateX.value - ThumbSize / 2 - 4 }],
        }
    })
    const fillLineStyle = useAnimatedStyle(() => {
        return {
            width: derivedTranslateX.value,
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.timeLabelWrapper}>
                {isRecording && <View style={styles.recordingIndicator} />}
                {(!isEnabledRangeSelection || (isEnabledRangeSelection && isRecording)) && (
                    <AppText font="f13w400">
                        {elapsedTimeLabel} / {totalTimeLabel}
                    </AppText>
                )}
            </View>
            <GestureHandlerRootView style={styles.timelineWrapper}>
                <GestureDetector gesture={tapGestureHandler}>
                    <Reanimated.View hitSlop={TimelineHitSlop}>
                        <View style={styles.timeline} onLayout={onLayout}>
                            <Reanimated.View style={[styles.fill, fillStyle, fillLineStyle]} />
                            <AutogradeTimelineMistakesView maxWidth={timelineWidth} />
                            <GestureDetector gesture={panGestureHandler}>
                                <Reanimated.View
                                    style={[styles.thumb, thumbStyle]}
                                    hitSlop={ThumbHitSlop}
                                />
                            </GestureDetector>
                        </View>
                    </Reanimated.View>
                </GestureDetector>
                {isEnabledRangeSelection && !isRecording && <AutogradeTimelineCrop />}
            </GestureHandlerRootView>
        </View>
    )
}
