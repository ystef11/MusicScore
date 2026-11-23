import { memo, useEffect } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { commonTestIds } from '@mu/mu-mobile-test-id'

import { brandColors } from '../constants/new/brandColors.ts'
import { OPACITY_DISABLED } from '../constants/new/opacity.ts'

import { CommonTouchable } from './CommonTouchable.tsx'

export type SwitchSize = 'm' | 's'

export type SwitchProps = {
    value: boolean
    onValueChange: (value: boolean) => void
    size?: SwitchSize
    trackColorOn?: string
    trackColorOff?: string
    disabled?: boolean
    testID?: string
    style?: StyleProp<ViewStyle>
}

const PADDING = 2

const sizes = {
    m: { trackWidth: 60, trackHeight: 32, thumbSize: 28 },
    s: { trackWidth: 44, trackHeight: 24, thumbSize: 20 },
} as const

const TRACK_COLOR_OFF = brandColors.colorBackgroundDisabled
const TRACK_COLOR_ON = brandColors.actionsControlDefault

export const Switch = memo(
    ({
        value,
        onValueChange,
        size = 'm',
        trackColorOn,
        trackColorOff,
        disabled,
        testID,
        style,
    }: SwitchProps) => {
        const { trackWidth, trackHeight, thumbSize } = sizes[size]
        const translateX = trackWidth - thumbSize - PADDING * 2
        const colorOff = trackColorOff ?? TRACK_COLOR_OFF
        const colorOn = trackColorOn ?? TRACK_COLOR_ON

        const progress = useSharedValue(value ? 1 : 0)

        useEffect(() => {
            progress.value = withTiming(value ? 1 : 0, { duration: 200 })
        }, [value])

        const trackStyle = useAnimatedStyle(() => ({
            backgroundColor: interpolateColor(progress.value, [0, 1], [colorOff, colorOn]),
        }))

        const thumbStyle = useAnimatedStyle(() => ({
            transform: [{ translateX: progress.value * translateX }],
        }))

        return (
            <CommonTouchable
                testID={testID}
                onPress={() => onValueChange(!value)}
                disabled={disabled}
                activeOpacity={1}
                style={style}
            >
                {/* Opacity lives on the track: CommonTouchable overrides any
                    opacity passed through its own style. */}
                <Animated.View
                    style={[
                        styles.track,
                        { width: trackWidth, height: trackHeight },
                        trackStyle,
                        disabled && styles.disabled,
                    ]}
                >
                    <Animated.View
                        testID={testID ? commonTestIds.switchState(testID, value) : undefined}
                        style={[
                            styles.thumb,
                            { width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2 },
                            thumbStyle,
                        ]}
                    />
                </Animated.View>
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    track: {
        borderRadius: 100,
        paddingHorizontal: PADDING,
        justifyContent: 'center',
    },
    thumb: {
        backgroundColor: brandColors.backgroundDefault,
        shadowColor: brandColors.colorBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    disabled: {
        opacity: OPACITY_DISABLED,
    },
})
