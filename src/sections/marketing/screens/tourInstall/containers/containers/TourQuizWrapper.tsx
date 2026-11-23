import { useEffect } from 'react'

import { quizStoreChunk, QuizTypes, TourQuizContainer } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'
import { TourSteps } from '../../types/tourTypes'

export const TourQuizWrapperContainer = () => {
    const actions = useActions({
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })
    const [quizStep, lastQuizStep, isUpdateMode, tourQuizData] = useValues([
        quizStoreChunk.props.getQuizStep,
        quizStoreChunk.props.getLastQuizStep,
        quizStoreChunk.props.getIsUpdateMode,
        quizStoreChunk.props.getTourQuizDataNew,
    ])

    const isLastPageQuestion = tourQuizData[lastQuizStep]?.type === QuizTypes.Question
    const isHideQuiz =
        isUpdateMode && !isLastPageQuestion ? quizStep >= lastQuizStep : quizStep > lastQuizStep

    useEffect(() => {
        if (isHideQuiz) {
            actions.setStep(
                isUpdateMode ? TourSteps.UPDATE_QUIZ_STEP : TourSteps.PERSONAL_ANIMATION_SCREEN,
            )
        }
    }, [isHideQuiz])

    if (isHideQuiz) return null
    return <TourQuizContainer />
}
