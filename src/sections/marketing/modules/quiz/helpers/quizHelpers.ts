import { store } from '@mu-native/common'

import reportEvent from '../../../../../App/Utils/Analytics'
import { quizStoreChunk } from '../store/quizStoreChunk'

const indexInstrumentQuestionInTour = 'id37'

export const getUserInstrumentsFromTour = () => {
    const instruments = quizStoreChunk.props.getQuizAnswersValues(store.getState())?.[
        indexInstrumentQuestionInTour
    ]

    return {
        ui: 'Practice',
        'params.key': instruments?.length ? instruments.map(() => 'instrument') : [],
        'params.value': instruments?.length ? instruments.map(() => 0) : [],
        'params.str_value': instruments?.length ? instruments : [],
    }
}

const getQuizAnswersRt = () => {
    const state = store.getState()
    const tourAnswerNames = quizStoreChunk.props.getQuizAnswersNames(state)
    const quizQuestions = quizStoreChunk.props.getQuizQuestions(state)

    if (
        tourAnswerNames.length !== quizQuestions.length ||
        !quizQuestions?.[0] ||
        !tourAnswerNames?.[0] ||
        !quizQuestions?.[quizQuestions.length - 1] ||
        !tourAnswerNames?.[tourAnswerNames.length - 1]
    ) {
        const quizAnswers = quizStoreChunk.props.getQuizAnswers(state)
        const quizAnalyticsQuestions = quizStoreChunk.props.getQuizAnalyticsQuestions(state)

        reportEvent('Empty quiz answers1', {
            tourAnswerNames,
            quizQuestions,
            quizAnswers,
            quizAnalyticsQuestions,
        })

        return {
            'quiz_answer.value': [],
            'quiz_answer.question': [],
        }
    }

    return {
        'quiz_answer.value': tourAnswerNames,
        'quiz_answer.question': quizQuestions,
    }
}

export const quizHelpers = {
    getUserInstrumentsFromTour,
    getQuizAnswersRt,
}
