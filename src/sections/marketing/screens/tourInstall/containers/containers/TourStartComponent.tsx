import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import { getIsAuthorized, TourCreateAccountBlockComponent } from '@mu-native/auth'
import {
    brandColors,
    brandFonts,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    LinearGradient,
    replacerText,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStorage, TourSteps } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

const styles = StyleSheet.create({
    animationWrapper: {
        flex: 1,
        width: '100%',
    },
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    whiteOverlay: {
        width: '100%',
        height: `20%`,
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
        height: '140%',
        position: 'absolute',
    },
})

const gradientBg = ['rgba(255, 255, 255, 0)', colors.white]

const TourStartComponent = () => {
    const [isAuth] = useValues([getIsAuthorized])
    const actions = useActions({
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })

    const [authBlockHeight, setAuthBlockHeight] = useState(0)

    const animationTranslateYImage = useSharedValue(-300)
    const animValueTextFirst = useSharedValue(1)
    const animValueTextSecond = useSharedValue(0)

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

        reportEvent(MetricaEvents.TOUR_AUTHENTICATION_SHOW)
        marketingStorage.set('isInitFlowSessionExp', true)
    }, [])

    const onCloseAuthStep = useCallback(() => {
        actions.setStep(TourSteps.GREETINGS_SCREEN)
    }, [])

    useEffect(() => {
        if (isAuth) onCloseAuthStep()
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
        <Animated.View exiting={FadeOut.duration(500)} style={styles.animationWrapper}>
            <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
                <Animated.Image
                    resizeMode="contain"
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
                            text: translate('native.screen_tour.immerse'),
                        })}
                    </Animated.Text>
                    <Animated.Text style={styles.secondText}>
                        {translate('native.screen_tour.fact_sub_title')}
                    </Animated.Text>
                </Animated.View>
                <View style={styles.whiteOverlay} />
                <View style={globalStyles.fullWidth} onLayout={onLayoutAuthBlock}>
                    <TourCreateAccountBlockComponent isTour />
                </View>
            </Animated.View>
        </Animated.View>
    )
}

export default memo(TourStartComponent)
