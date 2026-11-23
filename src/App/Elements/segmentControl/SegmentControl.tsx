import React, { JSX, useEffect, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { AppText, brandColors, CommonTouchable, layout } from '@mu-native/ds'

interface ILayout {
    width: number
    x: number
}

type IProps = {
    segments: string[]
    onChange: (index: number) => void
    activeIndex: number
    testID?: string
    getSegmentTestID?: (item: string, index: number) => string
}

export const SegmentControl = React.memo(
    ({ activeIndex, onChange, segments, testID, getSegmentTestID }: IProps) => {
        const animatedX = useSharedValue(0)
        const animatedWidth = useSharedValue(0)
        const layoutsRef = useRef<ILayout[]>([])
        const [isInitialized, setIsInitialized] = useState(false)

        const handleLayout = (index: number, { nativeEvent }: LayoutChangeEvent): void => {
            const { width, x } = nativeEvent.layout

            layoutsRef.current[index] = { width, x }

            // Initialize underline position when active segment is measured
            if (index === activeIndex && !isInitialized) {
                // Use setTimeout to ensure this happens after the layout is committed
                setTimeout(() => {
                    const layout = layoutsRef.current[activeIndex]
                    if (layout) {
                        animatedX.value = layout.x
                        animatedWidth.value = layout.width
                        setIsInitialized(true)
                    }
                }, 0)
            }
        }

        // Respond to activeIndex changes from parent
        useEffect(() => {
            const targetLayout = layoutsRef.current[activeIndex]
            if (isInitialized && targetLayout) {
                animatedX.value = withTiming(targetLayout.x, {
                    duration: 250,
                    easing: Easing.out(Easing.cubic),
                })
                animatedWidth.value = withTiming(targetLayout.width, {
                    duration: 250,
                    easing: Easing.out(Easing.cubic),
                })
            }
        }, [activeIndex, isInitialized, animatedX, animatedWidth])

        const handleChange = (index: number): void => {
            onChange(index)
        }

        const renderButton = (item: string, index: number): JSX.Element => {
            const buttonStyle = [
                styles.button,
                { paddingHorizontal: 4 },
                (platform.isTablet || segments.length < 3) && index < segments.length - 1
                    ? styles.marginRight
                    : {},
            ]

            return (
                <CommonTouchable
                    key={item}
                    style={buttonStyle}
                    testID={getSegmentTestID?.(item, index)}
                    onLayout={(layout: LayoutChangeEvent) => handleLayout(index, layout)}
                    onPress={() => handleChange(index)}
                    disabled={index === activeIndex}
                >
                    <AppText
                        font="f15w500"
                        style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        rawText={item}
                    />
                </CommonTouchable>
            )
        }

        const containerStyle = [
            styles.container,
            platform.isTablet || segments?.length < 3 ? styles.center : styles.spaceBetween,
        ]

        const underlineAnimatedStyle = useAnimatedStyle(() => {
            return {
                width: animatedWidth.value,
                transform: [{ translateX: animatedX.value }],
            }
        })

        return (
            <>
                <View testID={testID} style={containerStyle}>
                    {segments?.map(renderButton)}
                </View>
                {isInitialized && (
                    <Animated.View style={[styles.underline, underlineAnimatedStyle]} />
                )}
                <View style={[styles.divider, { marginLeft: segments?.length < 3 ? -46 : 0 }]} />
            </>
        )
    },
)

const styles = StyleSheet.create({
    title: {
        color: brandColors.contentPrimary,
    },
    underline: {
        height: 2,
        backgroundColor: brandColors.contentPrimary,
        marginBottom: -StyleSheet.hairlineWidth,
        zIndex: 2,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
    },
    divider: {
        width: layout.baseMaxWidth,
        height: StyleSheet.hairlineWidth,
        backgroundColor: brandColors.strokeDefault,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    spaceBetween: {
        justifyContent: 'space-between',
    },
    center: {
        justifyContent: 'center',
    },
    marginRight: {
        marginRight: 10,
    },
})
