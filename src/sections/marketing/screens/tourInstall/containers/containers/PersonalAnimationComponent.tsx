import { useCallback, useEffect, useState } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import Animated, {
    FadeIn,
    FadeOut,
    interpolate,
    LinearTransition,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { platform } from '@mu-native/common'
import { brandColors, brandFonts, layout, layoutHelpers, replacerText, ReText } from '@mu-native/ds'
import { localizeNumber, translate } from '@mu-native/locale'
import { marketingStoreChunk, TourSteps } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

import { QuestionSheetModal } from './QuestionSheetModal.tsx'

const loaderBackground = brandColors.playlistBackground5
const loaderBackgroundBrandColor = brandColors.contentPrimary
const isPersonalQuestionRollout = platform.isIos
const width = platform.isTablet ? layout.maxWidthTabletContainer : Dimensions.get('window').width

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        top: 0,
    },
    flexEnd: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    contentWhiteTour: {
        width: '100%',
        maxWidth: platform.isTablet ? 720 : '100%',
        backgroundColor: brandColors.backgroundDefault,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(60),
    },
    text: {
        color: loaderBackgroundBrandColor,
        textAlign: 'center',
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(28),
        fontWeight: '600',
        fontFamily: brandFonts.medium,
    },
    shortFactContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
    },
    factsContainer: {
        padding: 16,
        width: '94%',
        alignSelf: 'center',
        paddingBottom: 0,
        marginBottom: '-2%',
    },
    loaderContainer: {
        backgroundColor: brandColors.backgroundDefault,
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        height: 24,
        borderRadius: 2,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    bgLoaderNewBrand: {
        backgroundColor: brandColors.colorBackgroundDisabled,
    },
    loader: {
        width: '104%',
        height: 12,
        borderRadius: 6,
        backgroundColor: loaderBackground,
    },
    loaderNewBrand: {
        borderRadius: 0,
        height: 24,
        backgroundColor: loaderBackgroundBrandColor,
    },
    progress: {
        color: brandColors.contentSecondary,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(19),
        fontWeight: '500',
        textAlign: 'center',
        marginTop: '2%',
        alignSelf: 'center',
        width: layoutHelpers.getResponsiveSizeExtended(200),
    },
    progressNewBrand: {
        color: brandColors.contentPrimary,
        zIndex: 10,
        position: 'relative',
        bottom: -layoutHelpers.getResponsiveSizeExtended(8),
        fontFamily: brandFonts.medium,
    },
    loaderFrontContainer: {
        backgroundColor: brandColors.transparent,
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        borderColor: brandColors.backgroundDefault,
        paddingHorizontal: 2,
        marginTop: -16,
    },
    loaderFrontNewBrand: {
        borderRadius: 2,
        height: 24,
        marginTop: -24,
    },
    longestFactFiller: {
        opacity: 0,
    },
    loaderWrapper: {
        width: '100%',
        minHeight: 80,
        maxWidth: layout.maxWidthTabletContainer,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(28),
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
    },
})

export const PersonalAnimationComponent = () => {
    const loader = useSharedValue(0)
    const fact0Opacity = useSharedValue(1)
    const fact1Opacity = useSharedValue(0)
    const valueLoader = useSharedValue(0)
    const [isOpenQuestionModal, setIsOpenQuestionModal] = useState(false)

    const { setStep, setIsPausedBackgroundAnimation } = useActions({
        setStep: tourInstallScreenStoreChunk.actions.setStep,
        setIsPausedBackgroundAnimation:
            tourInstallScreenStoreChunk.actions.setIsPausedBackgroundAnimation,
    })
    const [{ scoresNew, offScoresCount }] = useValues([marketingStoreChunk.props.getContentFields])

    const defaultFacts = [
        replacerText({
            text: translate('native.marketing.fact1', {
                count: localizeNumber(scoresNew || 278859, { precision: 0 }),
            }),
        }),
        replacerText({
            text: translate('native.marketing.fact2', {
                count: localizeNumber(offScoresCount || 44000, { precision: 0 }),
            }),
        }),
    ]

    const openQuestionModal = () => {
        setIsPausedBackgroundAnimation(true)
        setIsOpenQuestionModal(true)
    }

    const onFinishPersonalization = () => {
        setStep(TourSteps.SET_NOTIFICATION_SCREEN)
    }

    useEffect(() => {
        if (isPersonalQuestionRollout) {
            loader.value = withTiming(0.4, { duration: 2000 }, isFinished => {
                if (isFinished) {
                    scheduleOnRN(openQuestionModal)
                }
            })
        } else {
            loader.value = withSequence(
                withTiming(0.2, { duration: 1000 }),
                withTiming(0.9, { duration: 3000 }),
                withTiming(1, { duration: 1000 }, (finished?: boolean) => {
                    if (finished) scheduleOnRN(onFinishPersonalization)
                }),
            )
        }

        fact0Opacity.value = withDelay(
            2750,
            withTiming(0, { duration: 350 }, (finished?: boolean) => {
                if (finished) {
                    fact1Opacity.value = withDelay(
                        300,
                        withTiming(1, {
                            duration: 350,
                        }),
                    )
                }
            }),
        )

        return () => {
            setIsPausedBackgroundAnimation(false)
        }
    }, [])

    const fact0OpacityAnimated = useAnimatedStyle(() => ({
        opacity: fact0Opacity.value,
    }))

    const fact1OpacityAnimated = useAnimatedStyle(() => ({
        opacity: fact1Opacity.value,
    }))

    const reanimatedStylesText = [fact0OpacityAnimated, fact1OpacityAnimated]

    const transformStyleLoader = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(loader.value, [0, 1], [-width, 0]) }],
    }))

    const onNavigateNotification = () => {
        setStep(TourSteps.SET_NOTIFICATION_SCREEN)
    }

    const onCloseModal = useCallback(() => {
        loader.value = withSequence(
            withTiming(0.9, { duration: 2000 }),
            withTiming(1, { duration: 1000 }, (finished?: boolean) => {
                if (finished) scheduleOnRN(onNavigateNotification)
            }),
        )

        setIsPausedBackgroundAnimation(false)
        setIsOpenQuestionModal(false)
    }, [])

    useAnimatedReaction(
        () => {
            return Math.round(loader.value * 100)
        },
        (result: number, previous: number | null) => {
            if (result !== previous) {
                valueLoader.value = result
            }
        },
        [loader],
    )

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(500)}
            style={[styles.container, styles.flexEnd]}
        >
            <Animated.View
                layout={LinearTransition.duration(500)}
                style={[styles.contentContainer, styles.contentWhiteTour]}
            >
                <View style={styles.factsContainer}>
                    {defaultFacts?.map((value: string, index: number) => (
                        <View style={styles.shortFactContainer} key={value}>
                            <Animated.Text style={[styles.text, reanimatedStylesText[index]]}>
                                {value}
                            </Animated.Text>
                        </View>
                    ))}
                    <Text style={[styles.text, styles.longestFactFiller]}>
                        {translate('native.marketing.fact2', {
                            count: localizeNumber(offScoresCount || 44000, { precision: 0 }),
                        })}
                    </Text>
                </View>
                <View style={styles.loaderWrapper}>
                    <View style={[styles.loaderContainer, styles.bgLoaderNewBrand]}>
                        <Animated.View
                            style={[styles.loader, styles.loaderNewBrand, transformStyleLoader]}
                        />
                    </View>
                    <View style={[styles.loaderFrontContainer, styles.loaderFrontNewBrand]} />
                    <ReText
                        textStyle={[styles.progress, styles.progressNewBrand]}
                        text={valueLoader}
                    />
                </View>
            </Animated.View>
            <QuestionSheetModal
                isOpenQuestionModal={isOpenQuestionModal}
                onCloseModal={onCloseModal}
            />
        </Animated.View>
    )
}
