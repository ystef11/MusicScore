import React, { useState } from 'react'
import { LayoutChangeEvent, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common/constants/platform'
import SliderElement from '@react-native-community/slider'

import { AppText } from '../components/AppText/AppText'
import { brandColors } from '../constants/new/brandColors'
import { OPACITY_DISABLED } from '../constants/new/opacity'
import { haptic } from '../utils/haptic'

const styles = StyleSheet.create({
    slider: {
        marginStart: Platform.OS === 'android' ? -14 : 0,
        marginEnd: Platform.OS === 'android' ? -14 : 0,
    },
    labelsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bubbleContainer: {
        position: 'absolute',
        top: platform.isAndroid ? -36 : -24,
        left: 0,
        right: 0,
    },
    bubble: {
        paddingVertical: 4,
        backgroundColor: brandColors.contentPrimary,
        borderRadius: 4,
    },
    // Disabled = the same colors at 40% opacity (Figma States/Disabled),
    // not a swap to gray.
    disabled: {
        opacity: OPACITY_DISABLED,
    },
})

type TSliderProps = {
    value: number
    minimumValue: number
    maximumValue: number
    step?: number
    /** Static label rendered above the track (Figma "Top Label" variant) */
    label?: string
    minimumValueLabel?: string
    maximumValueLabel?: string
    minimumValueCaption?: string
    maximumValueCaption?: string
    minimumTrackTintColor?: string
    maximumTrackTintColor?: string
    bubbleBackgroundColor?: string
    disabled?: boolean
    onSlidingComplete?: (value: number) => void
    onValueChange?: (value: number) => void
    style?: StyleProp<ViewStyle>
    bubble?: (value: number) => string
    bubbleWidth?: number
    alwaysShowBubble?: boolean
}

const Slider = ({
    value,
    minimumTrackTintColor = brandColors.actionsControlDefault,
    maximumTrackTintColor = brandColors.colorBackgroundDisabled,
    bubbleBackgroundColor = brandColors.actionsControlDefault,
    step,
    minimumValue,
    maximumValue,
    label,
    minimumValueLabel,
    maximumValueLabel,
    minimumValueCaption,
    maximumValueCaption,
    onSlidingComplete,
    onValueChange,
    bubble,
    style,
    disabled = false,
    bubbleWidth = 42,
    alwaysShowBubble = false,
}: TSliderProps) => {
    const [fullWidth, setFullWidth] = useState(0)
    const [slidingValue, setSlidingValue] = useState<number | null>(null)
    const onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
        setFullWidth(layout.width)
    }

    const range = maximumValue - minimumValue
    const bubbleValue = slidingValue ?? value
    const relativePosition =
        range > 0 ? Math.min(1, Math.max(0, (bubbleValue - minimumValue) / range)) : 0
    const centeredBubbleLeft = relativePosition * (fullWidth - bubbleWidth / 2) - bubbleWidth / 4
    const bubbleLeft = alwaysShowBubble
        ? Math.max(0, Math.min(fullWidth - bubbleWidth, centeredBubbleLeft))
        : centeredBubbleLeft

    const _onSlidingComplete = (nextValue: number) => {
        onSlidingComplete?.(nextValue)
        haptic()
        setSlidingValue(null)
    }

    const _onSlidingStart = (startValue: number) => {
        haptic()
        setSlidingValue(startValue)
    }

    const _onValueChange = (nextValue: number) => {
        setSlidingValue((current) => (current === null ? null : nextValue))
        onValueChange?.(nextValue)
    }

    return (
        <View
            style={[style, styles.slider, disabled && styles.disabled]}
            pointerEvents={disabled ? 'none' : 'auto'}
        >
            {!!label && <AppText font="f17w400" rawText={label} />}
            <View onLayout={onLayout} pointerEvents="none" style={styles.bubbleContainer}>
                {(alwaysShowBubble || slidingValue !== null) && !!bubble && fullWidth > 0 && (
                    <View
                        style={[
                            styles.bubble,
                            { width: bubbleWidth, transform: [{ translateX: bubbleLeft }] },
                        ]}
                    >
                        <AppText
                            font="f15w400"
                            brandColor="backgroundDefault"
                            textAlign="center"
                            rawText={bubble(bubbleValue)}
                        />
                    </View>
                )}
            </View>
            <SliderElement
                value={value}
                minimumValue={minimumValue}
                maximumValue={maximumValue}
                minimumTrackTintColor={minimumTrackTintColor}
                maximumTrackTintColor={maximumTrackTintColor}
                onValueChange={_onValueChange}
                onSlidingStart={_onSlidingStart}
                thumbTintColor={bubbleBackgroundColor}
                onSlidingComplete={_onSlidingComplete}
                step={step}
            />
            {!!minimumValueLabel && !!maximumValueLabel && (
                <View style={styles.labelsWrapper}>
                    <View>
                        <AppText font="f17w400" rawText={minimumValueLabel} />
                        {!!minimumValueCaption && (
                            <AppText font="f15w400" rawText={minimumValueCaption} />
                        )}
                    </View>
                    <View>
                        <AppText font="f17w400" textAlign="right" rawText={maximumValueLabel} />
                        {!!maximumValueCaption && (
                            <AppText
                                font="f15w400"
                                textAlign="right"
                                rawText={maximumValueCaption}
                            />
                        )}
                    </View>
                </View>
            )}
        </View>
    )
}

export default React.memo(Slider)
