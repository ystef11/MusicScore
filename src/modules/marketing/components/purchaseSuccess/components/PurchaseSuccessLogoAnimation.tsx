import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { layoutHelpers, LottieView, useAppSafeArea } from '@mu-native/ds'
import { useWindowDimensions } from '@mu-native/system'

const { getResponsiveSizeExtended } = layoutHelpers

const composition = { width: 1170, height: 2532 }
const lottieLogoBox = { x: 389, y: 1045, width: 389, height: 498 }

const design = {
    screenWidth: 375,
    statusBarHeight: 40,
    logoX: 141,
    logoY: 160,
    logoWidth: 72,
    logoHeight: 96,
}

const moveDuration = 600

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
})

type TPurchaseSuccessLogoAnimationProps = {
    onFinish: () => void
}

export const PurchaseSuccessLogoAnimation = memo(
    ({ onFinish }: TPurchaseSuccessLogoAnimationProps) => {
        const { width, height } = useWindowDimensions()
        const insets = useAppSafeArea({ top: 20 })
        const progress = useSharedValue(0)

        const animationHeight = (width * composition.height) / composition.width
        const animationTop = (height - animationHeight) / 2
        const compositionScale = width / composition.width

        const logoCenterX = (lottieLogoBox.x + lottieLogoBox.width / 2) * compositionScale
        const logoCenterY =
            animationTop + (lottieLogoBox.y + lottieLogoBox.height / 2) * compositionScale

        const targetScale =
            getResponsiveSizeExtended(design.logoWidth) / (lottieLogoBox.width * compositionScale)
        const targetCenterX =
            width / 2 +
            getResponsiveSizeExtended(design.logoX + design.logoWidth / 2 - design.screenWidth / 2)
        const targetCenterY =
            insets.top +
            getResponsiveSizeExtended(design.logoY - design.statusBarHeight + design.logoHeight / 2)

        const centerX = width / 2
        const centerY = animationTop + animationHeight / 2

        const targetTranslateX = targetCenterX - centerX - targetScale * (logoCenterX - centerX)
        const targetTranslateY = targetCenterY - centerY - targetScale * (logoCenterY - centerY)

        const onAnimationFinish = useCallback((isCancelled: boolean) => {
            if (isCancelled) return

            progress.value = withTiming(
                1,
                { duration: moveDuration, easing: Easing.out(Easing.cubic) },
                isFinished => {
                    if (isFinished) scheduleOnRN(onFinish)
                },
            )
        }, [])

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: progress.value * targetTranslateX },
                { translateY: progress.value * targetTranslateY },
                { scale: 1 + progress.value * (targetScale - 1) },
            ],
        }))

        return (
            <Animated.View
                pointerEvents="none"
                style={[
                    styles.container,
                    { top: animationTop, width, height: animationHeight },
                    animatedStyle,
                ]}
            >
                <LottieView
                    style={styles.lottie}
                    source={require('@mu-native/ds/images/lottie/logo_success_screen.lottie')}
                    resizeMode="cover"
                    autoPlay
                    loop={false}
                    onAnimationFinish={onAnimationFinish}
                />
            </Animated.View>
        )
    },
)
