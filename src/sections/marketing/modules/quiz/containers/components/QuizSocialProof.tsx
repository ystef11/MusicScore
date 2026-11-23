import { memo, useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    colors,
    globalStyles,
    layout,
    layoutHelpers,
    OnboardingTitleComponent,
    replacerText,
} from '@mu-native/ds'
import { localizeMillions, translate } from '@mu-native/locale'
import { useIsLandscape } from '@mu-native/system'

import { getQuizTranslateString } from '../../helpers/quizTranslateHelper.ts'
import { type TQuizAnswers, type TQuizDataItem } from '../../types/quizTypes'

const { getResponsiveSize } = layoutHelpers

const styles = StyleSheet.create({
    listContainer: {
        flex: 1,
    },
    textSocialProof: {
        color: colors.text900,
        fontWeight: '400',
        fontSize: getResponsiveSize(16),
        lineHeight: getResponsiveSize(24),
        textAlign: 'left',
    },
    imageSocProof: {
        width: '100%',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginLg),
        marginTop: -layoutHelpers.getResponsiveSizeExtended(64),
    },
    checkIcon: {
        width: layoutHelpers.getResponsiveSizeExtended(24),
        height: layoutHelpers.getResponsiveSizeExtended(24),
        tintColor: colors.text900,
    },
    wrapperImage: {
        width: layoutHelpers.getResponsiveSizeExtended(48),
        height: layoutHelpers.getResponsiveSizeExtended(48),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: layoutHelpers.getResponsiveSizeExtended(6),
        backgroundColor: colors.gray,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    socialProofText: {
        lineHeight: layoutHelpers.getResponsiveSizeExtended(24),
    },
    newBrandStyleTitle: {
        lineHeight: layoutHelpers.getResponsiveSizeExtended(38),
        fontSize: layoutHelpers.getResponsiveSizeExtended(44),
    },
    contentContainer: {
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        paddingHorizontal: layout.marginMd,
        alignSelf: 'center',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(100),
    },
    pd6: {
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(6),
    },
})

type TTourVariantsListComponent = {
    quizData: TQuizDataItem
    quizAnswers: TQuizAnswers
    scoresAll: string
}

export const QuizSocialProofComponent = memo(
    ({
        quizData: { settings, content = '', image_top: imageSocProof },
        quizAnswers,
        scoresAll,
    }: TTourVariantsListComponent) => {
        const [{ answers: answersVariations, title = '' }, setAnswersVariations] = useState({
            answers: { id103: '', id100: '' },
            title: '',
        })
        const opacityStyle = useSharedValue(0)
        const opacityImage = useSharedValue(0)

        useEffect(() => {
            opacityStyle.value = withTiming(1, {
                duration: 500,
            })
            try {
                setAnswersVariations(JSON.parse(settings))
            } catch (e) {
                if (__DEV__) console.info('@@----> error parse quiz data')
            }
        }, [])

        const onLoadEnd = () => {
            opacityImage.value = withTiming(1, {
                duration: 300,
            })
        }

        const opacityStyleView = useAnimatedStyle(() => ({
            opacity: opacityStyle.value,
        }))

        const opacityStyleImage = useAnimatedStyle(() => ({
            opacity: opacityImage.value,
        }))

        const isLandscape = useIsLandscape()

        return (
            <Animated.View style={[styles.listContainer, opacityStyleView]}>
                {!!imageSocProof && (
                    <Animated.Image
                        source={layoutHelpers.getUriSourceByImageUrl(imageSocProof)}
                        onLoadEnd={onLoadEnd}
                        style={[
                            styles.imageSocProof,
                            {
                                height: layoutHelpers.getResponsiveSizeExtended(
                                    isLandscape ? 200 : 270,
                                ),
                            },
                            opacityStyleImage,
                        ]}
                    />
                )}
                <ScrollView
                    style={globalStyles.flex1}
                    contentContainerStyle={styles.contentContainer}
                >
                    <OnboardingTitleComponent
                        titleStyle={styles.newBrandStyleTitle}
                        contentStyle={[globalStyles.zeroHorizontalPadding, globalStyles.mb24]}
                        title={title || translate('native.marketing.questions.social_proof.title')}
                        titleContainerStyle={styles.pd6}
                        borderWidth={1}
                    />
                    <AppText
                        adaptiveSize
                        font="f17w400"
                        lineHeight={24}
                        rawText={replacerText({
                            text: getQuizTranslateString(content.replace(/\.\s+/g, '. '), {
                                id100: getQuizTranslateString(
                                    answersVariations?.id100?.[quizAnswers?.id100?.[0]],
                                ),
                                id103: getQuizTranslateString(
                                    answersVariations?.id103?.[quizAnswers?.id103?.[0]],
                                ),
                                scoresCount: localizeMillions(scoresAll),
                            })
                                // only matches backend text that has no catalog key
                                .replace('1.6', scoresAll),
                        })}
                    />
                </ScrollView>
            </Animated.View>
        )
    },
)
