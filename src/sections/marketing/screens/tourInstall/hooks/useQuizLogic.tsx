import { useEffect } from 'react'

import { platform } from '@mu-native/common'
import { ExperimentsMonetization, TourSteps, useMonetizationExperiment } from '@mu-native/marketing'
import { getTourQuizDataThunk, QuizApiData } from '@mu-native/quiz'
import { useActions } from '@ug/store'

import { getDynamicTourQuizDataThunk } from '../../../modules/quiz/store/quizThunkActions.ts'

export const useQuizLogic = (step: number) => {
    const actions = useActions({ getTourQuizDataThunk, getDynamicTourQuizDataThunk })

    const { variation } = useMonetizationExperiment(
        platform.isIos && step === TourSteps.QUIZ_STEP,
        8507,
        ExperimentsMonetization.quizAgreeQuestions,
    )
    const isQuizAgreeQuestionsVariation = platform.isIos && variation === 2

    useEffect(() => {
        if (step === TourSteps.GREETINGS_SCREEN || step === TourSteps.UPDATE_QUIZ_STEP) {
            const iosQuiz =
                step === TourSteps.GREETINGS_SCREEN && isQuizAgreeQuestionsVariation
                    ? QuizApiData.iOS
                    : QuizApiData.iOSQuiz2024
            const defaultQuiz = platform.isIos ? iosQuiz : QuizApiData.android

            actions.getTourQuizDataThunk({
                quizId: defaultQuiz,
            })
        }
    }, [step, isQuizAgreeQuestionsVariation])
}
