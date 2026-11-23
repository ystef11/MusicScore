import { apiRequest, quizContracts, type TQuizAnswersPayloadDto } from '@mu-native/api'
import { platform } from '@mu-native/common'

import { QuizApi, QuizApiData } from '../types/quizTypes'

export const quizService = (payload: TQuizAnswersPayloadDto) =>
    apiRequest(quizContracts.saveAnswers, { payload })

export const quizDataService = (quizId: QuizApiData) =>
    apiRequest(quizContracts.quiz, { params: { id: quizId } })

export const tourAnswersService = (quizExternalId: string | number) =>
    apiRequest(quizContracts.savedAnswers, {
        params: { key: quizExternalId || (platform.isIos ? QuizApi.iOS : QuizApi.android) },
    })
