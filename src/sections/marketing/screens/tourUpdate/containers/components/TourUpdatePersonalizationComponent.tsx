import { useEffect } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import Animated, {
    FadeIn,
    FadeOut,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { AppText, colors, icons, layout, layoutHelpers, ReText, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useIsLandscape } from '@mu-native/system'

const width = platform.isTablet ? layout.maxWidthTabletContainer : Dimensions.get('window').width
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        right: 0,
        top: 0,
    },
    flexEnd: { justifyContent: 'flex-end', alignItems: 'center' },
    contentWhiteTour: {
        width: '100%',
        maxWidth: platform.isTablet ? 720 : '100%',
        backgroundColor: colors.white,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(32),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(24),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(60),
    },
    text: {
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(42),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(40),
        fontWeight: '600',
        paddingHorizontal: '1%',
    },
    factsContainer: {
        marginBottom: '10%',
        width: '100%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(8),
    },
    loaderContainer: {
        backgroundColor: colors.white,
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        height: 16,
        borderRadius: 2,
        overflow: 'hidden',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    bgLoader: style.view({
        width: '100%',
        backgroundColor: colors.blue100,
    }),
    loader: style.view({
        height: 12,
        borderRadius: 2,
        backgroundColor: colors.tourUpdateBg,
    }),
    progress: style.text({
        color: colors.white,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(19),
        fontWeight: '500',
        textAlign: 'center',
        marginTop: layoutHelpers.getResponsiveSizeExtended(8),
        width: layoutHelpers.getResponsiveSizeExtended(200),
    }),
    loaderFrontContainer: style.view({
        backgroundColor: colors.transparent,
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        height: 16,
        borderRadius: 2,
        borderWidth: 2,
        justifyContent: 'center',
        borderColor: colors.white,
        paddingHorizontal: 2,
        marginTop: -16,
    }),
    grayColorText: {
        color: colors.gray500,
    },
    collectionBackgroundImage: {
        height: platform.isTablet ? '180%' : '150%',
        position: 'absolute',
        top: '-25%',
        left: '0%',
        alignSelf: 'center',
    },
    width150: {
        width: '150%',
    },
    width120: {
        width: '100%',
    },
})

export const PersonalAnimationComponent = ({ setNextStep }: { setNextStep: () => void }) => {
    const loader = useSharedValue(0)
    const fact0Opacity = useSharedValue(1)
    const fact1Opacity = useSharedValue(0)
    const valueLoader = useSharedValue(0)
    const image = useSharedValue(0)

    useEffect(() => {
        loader.value = withSequence(
            withTiming(0.2, { duration: 1000 }),
            withTiming(0.9, { duration: 3000 }),
            withTiming(1, { duration: 1000 }, (finished?: boolean) => {
                if (finished) runOnJS(setNextStep)()
            }),
        )

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
        image.value = withTiming(1, { duration: 5000 })
    }, [])

    const transformStyleLoader = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(loader.value, [0, 1], [-width, 0]) }],
    }))

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

    const transformStyleImage = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    image.value,
                    [0, 1],
                    platform.isTablet ? [-width * 0.3, 0] : [-width * 0.45, width * 0.45],
                ),
            },
        ],
    }))
    const isLandscape = useIsLandscape()

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(500)}
            style={[styles.container, styles.flexEnd]}
        >
            <Animated.Image
                source={icons.tourFirstStep}
                style={[
                    styles.collectionBackgroundImage,
                    isLandscape ? styles.width150 : styles.width120,
                    transformStyleImage,
                ]}
            />
            <View style={styles.contentWhiteTour}>
                <View style={styles.factsContainer}>
                    <AppText
                        font="f44w400Accent"
                        style={styles.text}
                        rawText={translate('native.marketing.tour_update.preparing_experience')}
                    />
                </View>
                <View style={[styles.loaderContainer, styles.bgLoader]}>
                    <Animated.View style={[styles.loader, transformStyleLoader]} />
                </View>
                <View style={styles.loaderFrontContainer} />
                <ReText textStyle={[styles.progress, styles.grayColorText]} text={valueLoader} />
            </View>
        </Animated.View>
    )
}
