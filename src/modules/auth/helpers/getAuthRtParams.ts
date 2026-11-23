import { analyticsStoreChunk } from '@mu-native/analytics'
import { store } from '@mu-native/common'

export const getAuthRtParams = () => {
    const state = store.getState()
    const { subscriptionPurchaseType, quizAnswers, quizQuestions } =
        analyticsStoreChunk.props.getMarketing(state)

    if (quizAnswers.length !== quizQuestions.length || !quizQuestions?.[0] || !quizAnswers?.[0]) {
        return {
            have_quiz: 'no',
            subscription_purchase: subscriptionPurchaseType,
            'quiz_answer.value': [],
            'quiz_answer.question': [],
        }
    }

    return {
        have_quiz: 'yes',
        subscription_purchase: subscriptionPurchaseType,
        'quiz_answer.value': quizAnswers,
        'quiz_answer.question': quizQuestions,
    }
}
