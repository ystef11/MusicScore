import { handleError } from '@mu-native/api'
import { platform, TThunkAction } from '@mu-native/common'
import { marketingConstants, subscriptionsRtHelpers } from '@mu-native/marketing'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import Sentry from '../../../../../App/Utils/Sentry'
import { quizConstants } from '../constants/quizConstants.ts'
import { quizDataService, quizService, tourAnswersService } from '../services/quizService'
import { QuizApiData, QuizTypes } from '../types/quizTypes'

import { quizStoreChunk } from './quizStoreChunk'

export const sendTourAnswersThunk: TThunkAction = () => async (_, getState) => {
    try {
        const state = getState()
        const quizAnswers = quizStoreChunk.props.getQuizAnswers(state)
        const tourQuizDataNew = quizStoreChunk.props.getTourQuizDataNew(state)
        const quizId = quizStoreChunk.props.getQuizId(state)

        const requestBodyNew = {
            quiz_id: quizId,
            answers: JSON.stringify(
                Object.values(tourQuizDataNew)
                    .map(item => ({
                        quiz_page_id: item.id,
                        values: quizAnswers[`id${item.id}`] || [],
                        type: item.type,
                    }))
                    .filter(item => item.type !== QuizTypes.Social),
            ),
        }
        await quizService(requestBodyNew)
    } catch (error) {
        Sentry.sendMessage('sendTourAnswersThunk', error)
    }
}

export const getTourQuizDataThunk: TThunkAction<{ quizId?: QuizApiData }> =
    ({ quizId = platform.isIos ? QuizApiData.iOS : QuizApiData.android }) =>
    async dispatch => {
        try {
            dispatch(quizStoreChunk.actions.setIsLoadingQuiz(true))

            const quizData = await quizDataService(quizId)

            dispatch(quizStoreChunk.actions.setTourQuiz(quizData))
        } catch (error) {
            handleError(error)
        } finally {
            dispatch(quizStoreChunk.actions.setIsLoadingQuiz(false))
        }
    }

export const getDynamicTourQuizDataThunk: TThunkAction<{ quizId: QuizApiData }> =
    ({ quizId }) =>
    async dispatch => {
        try {
            const quizData = await quizDataService(quizId)

            dispatch(quizStoreChunk.actions.setTourQuiz(quizData))
        } catch (error) {
            handleError(error)
        }
    }

export const loadTourAnswerThunk: TThunkAction = () => async (dispatch, getState) => {
    try {
        const quizId = quizStoreChunk.props.getQuizId(getState())
        await dispatch(getTourQuizDataThunk({ quizId }))
        const quizExternalId = quizStoreChunk.props.getQuizExternalId(getState())
        const tourAnswers = await tourAnswersService(quizExternalId)
        dispatch(quizStoreChunk.actions.setTourDataCustom({ tourAnswers }))
    } catch (error) {
        dispatch(quizStoreChunk.actions.resetState())
        handleError(error)
    }
}

export const endQuizThunk: TThunkAction = () => async (dispatch, getState) => {
    try {
        const store = getState()
        const isNeedTouUpdateAnswers = quizStoreChunk.props.getIsNeedToUpdateAnswers(store)

        const quizAnswers = quizStoreChunk.props.getQuizAnswersValues(store)
        const quizAnalyticsQuestions = quizStoreChunk.props.getQuizAnalyticsQuestions(store)
        const quizAnalyticsUi = quizStoreChunk.props.getQuizAnalyticsUi(store)
        const quizQuestions = Object.entries(quizAnswers).reduce(
            (acc: string[], item) =>
                [
                    ...acc,
                    ...Array.from(
                        { length: item[1].length },
                        () =>
                            quizAnalyticsQuestions[
                                quizConstants.oldIdsAnswersMap[
                                    item[0] as keyof typeof quizConstants.oldIdsAnswersMap
                                ] || item[0]
                            ],
                    ),
                ] as string[],
            [],
        )
        const tourAnswerNames = Object.values(quizAnswers).flat()
        const quizAnalyticsValues = Object.values(quizAnalyticsQuestions)
        const quizAnalyticsUiValues = Object.values(quizAnalyticsUi)

        const isHasEmptyQuestion = quizQuestions.some(item => !item)
        reportEvent(MetricaEvents.TOUR_QUIZ_END, {
            value: quizAnalyticsValues[quizAnalyticsValues.length - 1],
            ui: quizAnalyticsUiValues[quizAnalyticsUiValues.length - 1],
            'quiz_answer.value': isHasEmptyQuestion ? [] : tourAnswerNames,
            'quiz_answer.question': isHasEmptyQuestion ? [] : quizQuestions,
            ...subscriptionsRtHelpers.getRtParamsBySource({
                source: marketingConstants.sources.tourInstall,
            }),
        })

        if (!isNeedTouUpdateAnswers) return

        dispatch(
            quizStoreChunk.actions.setPartialFieldsCustom({
                quizAnswersNames: tourAnswerNames,
                quizQuestions,
            }),
        )

        await dispatch(sendTourAnswersThunk())
        setTimeout(() => {
            dispatch(loadTourAnswerThunk())
        }, 1000)
    } catch (error) {
        handleError(error)
    }
}
