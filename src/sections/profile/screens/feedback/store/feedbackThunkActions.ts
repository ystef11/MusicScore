/* eslint-disable import/no-relative-packages */
import Sentry from '../../../../../App/Utils/Sentry'
import { feedbackService } from '../services/feedbackService'

export const sendFeedbackThunk =
    ({ feedbackData, callback }: { feedbackData: any; callback: () => void }) =>
    async () => {
        try {
            await feedbackService(feedbackData)
        } catch (error) {
            Sentry.sendMessage('sendFeedbackThunk', error)
        } finally {
            callback()
        }
    }
