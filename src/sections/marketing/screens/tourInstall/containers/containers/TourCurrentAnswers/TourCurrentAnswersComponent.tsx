import { memo, useMemo } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AnimationCheckbox,
    brandColors,
    colors,
    layout,
    layoutHelpers,
    style,
    useSafeAreaInsets,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { AnimatedCloseIcon } from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { getQuizTranslateString } from '../../../../../modules/quiz/helpers/quizTranslateHelper.ts'
import { tourInstallScreenStoreChunk } from '../../../store/tourInstallScreenStoreChunk'
import { onCloseTourThunk } from '../../../store/tourInstallThunkActions'
import { TourSteps } from '../../../types/tourTypes.ts'
import TourBottomComponent from '../TourBottomComponent'

const { getResponsiveSizeExtended, getResponsiveSize } = layoutHelpers

const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        overflow: 'hidden',
        marginTop: getResponsiveSizeExtended(16),
        justifyContent: 'space-between',
        alignSelf: 'center',
    }),
    contentContainer: {
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
    },
    contentWrapper: style.view({ paddingHorizontal: layout.marginMd }),
    stepTitle: style.text({
        color: colors.green500,
        fontWeight: '600',
        fontSize: getResponsiveSize(28),
        lineHeight: getResponsiveSize(32),
        textAlign: 'left',
        letterSpacing: 0.36,
        paddingBottom: getResponsiveSize(24),
        paddingLeft: 1,
        paddingTop: getResponsiveSize(8),
    }),
    tourAnswerItem: style.view({
        backgroundColor: colors.tourQuizContainer,
        borderRadius: 12,
        padding: getResponsiveSizeExtended(layout.marginMd),
        marginBottom: getResponsiveSizeExtended(layout.marginMd),
    }),
    answerTitle: style.text({
        fontWeight: '600',
        fontSize: getResponsiveSizeExtended(18),
        color: colors.white,
        marginBottom: getResponsiveSizeExtended(layout.marginMd),
    }),
    answersContainer: style.view({
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    }),
    answersWrapper: style.view({
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
    }),
    answerItem: style.text({
        fontSize: getResponsiveSizeExtended(18),
        fontWeight: '400',
        marginLeft: getResponsiveSizeExtended(4),
        color: colors.white,
    }),
    marginLeft0: style.text({
        marginLeft: 0,
    }),
    blackTextColor: style.text({
        color: colors.text900,
    }),
    whiteBgQuizItem: style.view({
        backgroundColor: colors.white100,
    }),
    blackIconClose: style.image({ tintColor: colors.text900 }),
    newBrandStyleCheckbox: {
        backgroundColor: brandColors.backgroundInverse,
        borderColor: brandColors.backgroundInverse,
    },
})

const dynamicStyles = {
    getAccordionStyles: (marginTop: number) =>
        StyleSheet.flatten([styles.container, { marginTop }]),
}

const stepTitle = {
    37: translate('marketing.quiz.your_instruments'),
    40: translate('marketing.quiz.your_genres'),
    43: translate('marketing.quiz.your_level'),
    73: translate('marketing.quiz.your_topics'),
    85: translate('marketing.quiz.your_age'),
    100: translate('marketing.quiz.your_goal'),
    103: translate('marketing.quiz.your_goal'),
    337: translate('marketing.quiz.your_frequency'),
}

type TTourAnswerItemProps = {
    onChangeStep: (step: number) => void
    step: number
    questionId: keyof typeof stepTitle
    answers: string[]
}

const TourAnswerItem = memo(({ onChangeStep, questionId, step, answers }: TTourAnswerItemProps) => {
    const onPressTourAnswerItem = () => {
        onChangeStep(step)
    }

    if (!answers) return null

    return (
        <TouchableOpacity onPress={onPressTourAnswerItem}>
            <View style={[styles.tourAnswerItem, styles.whiteBgQuizItem]}>
                <Text style={[styles.answerTitle, styles.blackTextColor]}>
                    {stepTitle[questionId] || translate('native.your_preference')}
                </Text>
                <View style={styles.answersContainer}>
                    <View style={styles.answersWrapper}>
                        {!!answers?.length &&
                            answers.map((item: string, index: number) => (
                                <Text
                                    key={item}
                                    style={[
                                        styles.answerItem,
                                        index === 0 && styles.marginLeft0,
                                        styles.blackTextColor,
                                    ]}
                                >
                                    {`${getQuizTranslateString(item)}${index !== answers.length - 1 ? ',' : ''}`}
                                </Text>
                            ))}
                    </View>
                    {!!answers?.length && (
                        <AnimationCheckbox checked checkBoxStyle={styles.newBrandStyleCheckbox} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )
})

const TourCurrentAnswersComponent = () => {
    const insets = useSafeAreaInsets()
    const { goBack } = useNavigation()
    const { setStep, setIsQuizUpdated, setQuizStep, onCloseTour } = useActions({
        onCloseTour: onCloseTourThunk,
        setStep: tourInstallScreenStoreChunk.actions.setStep,
        setIsQuizUpdated: quizStoreChunk.actions.setIsQuizUpdated,
        setQuizStep: quizStoreChunk.actions.setQuizStep,
    })
    const [quizIds, isQuizUpdated, quizAnswersValues, tourQuizData] = useValues([
        quizStoreChunk.props.getQuizIds,
        quizStoreChunk.props.getIsQuizUpdated,
        quizStoreChunk.props.getQuizAnswersValues,
        quizStoreChunk.props.getTourQuizDataNew,
    ])

    const quizAnswersNames = useMemo(
        () => Object.values(quizAnswersValues).flat(),
        [quizAnswersValues],
    )

    const onPressBack = () => {
        setQuizStep(1)
        goBack()
    }

    // quizIds holds only question pages, while quizStep indexes every page (social ones included)
    const onChangeStep = (answerIndex: number) => {
        const questionId = quizIds?.[answerIndex]
        const pageIndex = Object.keys(tourQuizData).find(
            key => String(tourQuizData[Number(key)]?.id) === String(questionId),
        )

        if (!isQuizUpdated) setIsQuizUpdated(true)
        setQuizStep(pageIndex === undefined ? answerIndex : Number(pageIndex))
        setStep(TourSteps.QUIZ_STEP)
    }

    const onPressUpdate = () => {
        if (isQuizUpdated) {
            onCloseTour()
            return
        }

        setIsQuizUpdated(true)
        setStep(TourSteps.QUIZ_STEP)
    }

    const isButtonDisabled = useMemo(
        () => isQuizUpdated && !Object.values(quizAnswersValues).every(item => !!item?.length),
        [isQuizUpdated, quizAnswersValues],
    )

    const answerSteps = useMemo(
        () => Array.from({ length: Object.keys(quizAnswersValues).length }, (item, index) => index),
        [quizAnswersValues],
    )

    if (!quizAnswersNames?.length) {
        setIsQuizUpdated(true)
        setStep(TourSteps.QUIZ_STEP)

        return null
    }

    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(500)}
            style={dynamicStyles.getAccordionStyles(insets.top)}
        >
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.contentWrapper}>
                    <TouchableOpacity onPress={onPressBack}>
                        <AnimatedCloseIcon
                            customIconStyle={styles.blackIconClose}
                            isArrowIcon
                            backgroundFinishOpacity={1}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.stepTitle, styles.blackTextColor]}>
                        {translate('native.preferences.current_preferences')}
                    </Text>
                    {!!answerSteps?.length &&
                        answerSteps.map((step, index) => (
                            <TourAnswerItem
                                onChangeStep={onChangeStep}
                                step={step}
                                key={step}
                                answers={quizAnswersValues[`id${quizIds?.[index]}`]}
                                questionId={quizIds?.[index]}
                            />
                        ))}
                </View>
            </ScrollView>
            <TourBottomComponent
                testID="Tour install continue"
                disabled={isButtonDisabled}
                onPress={onPressUpdate}
            />
        </Animated.View>
    )
}

export default memo(TourCurrentAnswersComponent)
