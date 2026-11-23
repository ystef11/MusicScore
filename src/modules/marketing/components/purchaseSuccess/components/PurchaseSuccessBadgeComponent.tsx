import { memo, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming, } from 'react-native-reanimated'

import { AppText, brandColors, layoutHelpers, useAppSafeArea } from '@mu-native/ds'

import { usePurchaseSuccessPlan } from '../hooks/usePurchaseSuccessPlan'

const { getResponsiveSizeExtended } = layoutHelpers

const design = {
    screenWidth: 375,
    statusBarHeight: 40,
    centerX: 196.9,
    centerY: 266.8,
    height: 36,
    rotation: -15,
}

const stamp = {
    startScale: 2.6,
    startRotation: -28,
    pressScale: 0.92,
    pressDuration: 200,
    settleDuration: 140,
    fadeDuration: 120,
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: getResponsiveSizeExtended(8),
        borderRadius: 1,
        backgroundColor: brandColors.splash,
        top: -10,
    },
    title: {
        lineHeight: getResponsiveSizeExtended(design.height),
    },
})

export const PurchaseSuccessBadgeComponent = memo(() => {
    const { title } = usePurchaseSuccessPlan()
    const insets = useAppSafeArea({ top: 20 })
    const scale = useSharedValue(stamp.startScale)
    const rotation = useSharedValue(stamp.startRotation)
    const opacity = useSharedValue(0)

    useEffect(() => {
        opacity.value = withTiming(1, { duration: stamp.fadeDuration })
        rotation.value = withTiming(design.rotation, {
            duration: stamp.pressDuration,
            easing: Easing.out(Easing.cubic),
        })
        scale.value = withSequence(
            withTiming(stamp.pressScale, {
                duration: stamp.pressDuration,
                easing: Easing.out(Easing.cubic),
            }),
            withTiming(1, { duration: stamp.settleDuration, easing: Easing.out(Easing.quad) }),
        )
    }, [])

    const offsetX = getResponsiveSizeExtended(design.centerX - design.screenWidth / 2)
    const top =
        insets.top +
        getResponsiveSizeExtended(design.centerY - design.statusBarHeight - design.height / 2)

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: offsetX },
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
    }))

    return (
        <Animated.View pointerEvents="none" style={[styles.container, { top }]}>
            <Animated.View style={[styles.badge, animatedStyle]}>
                <AppText
                    adaptiveSize
                    font="f32w600"
                    brandColor="exceptionConstantLight"
                    rawText={title.toUpperCase()}
                    style={styles.title}
                />
            </Animated.View>
        </Animated.View>
    )
})
