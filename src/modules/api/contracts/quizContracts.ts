import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TQuizAnswersPayloadDto, TQuizDto, TQuizSavedAnswerDto } from '../dto/quizDto'

import { defineContract } from './defineContract'

export const quizContracts = {
    /** By numeric `id` or external `key`; 404 when neither matches. */
    quiz: defineContract.get<TQuizDto, { id?: number; key?: string }>(apiEndpoints.quizQuiz, {
        version: '1.1',
    }),
    /** The user's saved answers for a quiz, by `quiz_id` or external `key`. */
    savedAnswers: defineContract.get<
        TQuizSavedAnswerDto[],
        { quiz_id?: number; key?: string | number }
    >(apiEndpoints.quizAnswer, { version: '1.1' }),
    /** Body is `[]`; 422 `invalid_item_index` points at the bad answer. */
    saveAnswers: defineContract.post<[], TQuizAnswersPayloadDto>(apiEndpoints.quizAnswer, {
        version: '1.1',
    }),
}
