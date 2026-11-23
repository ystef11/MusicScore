import { useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    FadeIn,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import { authTestIds } from '@mu/mu-mobile-test-id'
import {
    brandColors,
    brandFonts,
    colors,
    CommonTouchable,
    globalStyles,
    Icon,
    icons,
    layout,
    layoutHelpers,
    LinearGradient,
    replacerText,
    useAppSafeArea,
} from '@mu-native/ds'
import { close as closeIcon } from '@mu-native/icons/close'
import { translate } from '@mu-native/locale'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'

import TourCreateAccountBlockComponent from './TourCreateAccountBlockContainer'

const styles = StyleSheet.create({
    animationWrapper: {
        flex: 1,
        position: 'absolute',
        height: '100%',
        width: '100%',
    },
    whiteBg: { backgroundColor: colors.white },
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    textWrapper: {
        width: '100%',
        position: 'absolute',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        zIndex: 1,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
    },
    mainText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        textAlign: 'center',
        color: brandColors.contentPrimary,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(8),
        alignSelf: 'center',
        fontWeight: '600',
        fontFamily: brandFonts.semibold,
    },
    secondText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(17),
        textAlign: 'center',
        color: brandColors.contentPrimary,
        fontFamily: brandFonts.regular,
    },
    gradientView: {
        width: '100%',
        height: '34%',
    },
    imageFirstStep: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        height: '120%',
        position: 'absolute',
    },
    closeIconButton: {
        zIndex: 100,
        position: 'absolute',
        left: layoutHelpers.getResponsiveSizeExtended(20),
        backgroundColor: brandColors.contentSecondary,
        padding: layoutHelpers.getResponsiveSizeExtended(8),
        borderRadius: 50,
    },
    whiteOverlay: {
        width: '100%',
        height: `20%`,
        backgroundColor: brandColors.backgroundDefault,
    },
})

const gradientBg = ['rgba(255, 255, 255, 0)', colors.white]

export const AuthModalComponent = ({
    isAuth,
    closeModalAction,
}: {
    isAuth: boolean
    closeModalAction: () => void
}) => {
    const animationTranslateYImage = useSharedValue(-300)
    const animValueTextFirst = useSharedValue(1)
    const animValueTextSecond = useSharedValue(0)

    const [authBlockHeight, setAuthBlockHeight] = useState(0)
    const { top } = useAppSafeArea({ top: 20 })

    useEffect(() => {
        animationTranslateYImage.value = withDelay(
            700,
            withTiming(120, {
                duration: 10000,
                easing: Easing.linear,
            }),
        )
        animValueTextFirst.value = withDelay(
            4200,
            withTiming(0, {
                duration: 850,
            }),
        )
        animValueTextSecond.value = withDelay(
            4800,
            withTiming(1, {
                duration: 650,
            }),
        )

        reportEvent(MetricaEvents.AUTHENTICATION_SHOW)
    }, [])

    useEffect(() => {
        if (isAuth) closeModalAction()
    }, [isAuth])

    const textFirstOpacity = useAnimatedStyle(() => ({
        opacity: animValueTextFirst.value,
    }))

    const textSecondOpacity = useAnimatedStyle(() => ({
        opacity: animValueTextSecond.value,
    }))

    const translateBackgroundImage = useAnimatedStyle(() => ({
        transform: [{ translateY: animationTranslateYImage.value }],
    }))

    const onLayoutAuthBlock = ({ nativeEvent }: LayoutChangeEvent) => {
        setAuthBlockHeight(nativeEvent.layout.height)
    }

    const paddingText = {
        bottom: authBlockHeight + layoutHelpers.getResponsiveSizeExtended(layout.marginLg),
    }

    return (
        <View style={[styles.animationWrapper, styles.whiteBg]}>
            <CommonTouchable
                onPress={closeModalAction}
                style={[styles.closeIconButton, { top }]}
                testID={authTestIds.loginButtons.closeButton}
            >
                <Icon source={closeIcon} tint="white" />
            </CommonTouchable>
            <Animated.View
                entering={FadeIn.duration(600)}
                style={[styles.container, styles.whiteBg]}
            >
                <Animated.Image
                    source={icons.tourInstallFirstStep}
                    style={[styles.imageFirstStep, translateBackgroundImage]}
                />
                <LinearGradient colors={gradientBg} style={styles.gradientView} />
                <Animated.View style={[styles.textWrapper, paddingText, textFirstOpacity]}>
                    <Animated.Text style={styles.mainText}>
                        {replacerText({
                            text: translate('native.screen_tour.immerse'),
                        })}
                    </Animated.Text>
                    <Animated.Text style={styles.secondText}>
                        {translate('native.screen_tour.start_describe')}
                    </Animated.Text>
                </Animated.View>
                <Animated.View style={[styles.textWrapper, paddingText, textSecondOpacity]}>
                    <Animated.Text style={styles.mainText}>
                        {replacerText({
                            text: translate('native.screen_tour.join'),
                        })}
                    </Animated.Text>
                    <Animated.Text style={styles.secondText}>
                        {translate('native.screen_tour.fact_sub_title')}
                    </Animated.Text>
                </Animated.View>
                <View style={styles.whiteOverlay} />
                <View style={globalStyles.fullWidth} onLayout={onLayoutAuthBlock}>
                    <TourCreateAccountBlockComponent isTour={false} />
                </View>
            </Animated.View>
        </View>
    )
}
