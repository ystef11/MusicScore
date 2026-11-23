import { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { FadeOut } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { Loader, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    BuyButton,
    ExperimentsMonetization,
    marketingConstants,
    marketingStoreChunk,
    TSources,
    useIsQuizExp,
    useMonetizationExperiment,
} from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import { getTourQuizDataNew, quizStoreChunk } from '../store/quizStoreChunk'
import { endQuizThunk } from '../store/quizThunkActions'

import { QuizAgreeComponent } from './components/QuestionAgreeComponent.tsx'
import { QuizProgressBarComponent } from './components/QuizProgressBarComponent.tsx'
import { QuizSocialProofComponent } from './components/QuizSocialProof'
import TourAccordionAnswersListComponent from './components/TourAccordionAnswers'
import TourQuizRtAnalytics from './TourQuizRtAnalytics'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
})

const dynamicStyles = {
    getAccordionStyles: (paddingTop: number) =>
        StyleSheet.flatten([styles.container, { paddingTop }]),
}

const quizComponent = {
    question: TourAccordionAnswersListComponent,
    social_proof: QuizSocialProofComponent,
    question_agree: QuizAgreeComponent,
}

export const TourQuizContainer = ({ source }: { source?: TSources }) => {
    const insets = useAppSafeArea()

    const [
        questionIndex,
        quizData,
        quizAnswers,
        isLoadingQuiz,
        { id: idExp },
        isUpdateMode,
        { scoresAll },
    ] = useValues([
        quizStoreChunk.props.getQuizStep,
        getTourQuizDataNew,
        quizStoreChunk.props.getQuizAnswers,
        quizStoreChunk.props.getIsLoadingQuiz,
        quizStoreChunk.props.getAbQuizData,
        quizStoreChunk.props.getIsUpdateMode,
        marketingStoreChunk.props.getContentFields,
    ])

    const actions = useActions({
        setQuizStep: quizStoreChunk.actions.setQuizStepCustom,
        endQuizThunk,
    })
    const [{ skipNextAnswersIds, multiple, isInitTest, quizType }, setQuizSettings] = useState<{
        multiple: boolean
        skipNextAnswersIds: null | number[]
        isInitTest: boolean
        quizType: 'question' | 'social_proof' | 'question_agree'
    }>({
        multiple: false,
        skipNextAnswersIds: null,
        isInitTest: false,
        quizType: 'question',
    })

    useEffect(() => {
        try {
            if (quizData.settings) setQuizSettings(JSON.parse(quizData.settings))
        } catch (e) {
            console.error('@@----> error parse quiz data')
        }
    }, [questionIndex])

    useEffect(() => {
        return () => {
            actions.endQuizThunk()
        }
    }, [])

    const goNext = useCallback(() => {
        actions.setQuizStep({ skipNextAnswersIds })
    }, [skipNextAnswersIds])

    useEffect(() => {
        if (quizType === 'social_proof' && isUpdateMode) goNext()
    }, [quizType])

    const isDisabledButton = !(
        quizAnswers[`id${quizData?.id}`]?.length || quizType === 'social_proof'
    )

    useIsQuizExp({ idExp, isInitTest })

    const isInstallTourQuiz =
        !isUpdateMode && (!source || source === marketingConstants.sources.tourInstall)

    const { variation: variationQuizProgressBar } = useMonetizationExperiment(
        isInstallTourQuiz && !isLoadingQuiz,
        platform.isIos ? 8426 : 8429,
        ExperimentsMonetization.quizProgressBar,
    )
    const isQuizProgressBarVariation = isInstallTourQuiz && variationQuizProgressBar === 2

    if (isLoadingQuiz) return <Loader />

    const ComponentQuizName = quizComponent[quizType] || TourAccordionAnswersListComponent

    return (
        <Animated.View
            exiting={FadeOut.duration(500)}
            style={dynamicStyles.getAccordionStyles(quizType === 'question_agree' ? 0 : insets.top)}
        >
            {isQuizProgressBarVariation && (
                <QuizProgressBarComponent
                    source={source}
                    isNeedTopInset={quizType === 'question_agree'}
                />
            )}
            {!!quizData && (
                <ComponentQuizName
                    isMultiSelect={multiple}
                    quizAnswers={quizAnswers}
                    questionIndex={questionIndex}
                    quizData={quizData}
                    scoresAll={scoresAll}
                />
            )}
            <TourQuizRtAnalytics source={source} />
            {quizType !== 'question_agree' && (
                <BuyButton
                    testID="Tour install continue"
                    buttonText={translate('native.marketing.continue')}
                    onBuyPress={goNext}
                    isDisabledButton={isDisabledButton}
                />
            )}
        </Animated.View>
    )
}
