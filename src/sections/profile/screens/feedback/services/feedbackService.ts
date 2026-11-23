import { apiRequest, userContracts, type TUserFeedbackPayloadDto } from '@mu-native/api'

export const feedbackService = (payload: TUserFeedbackPayloadDto) =>
    apiRequest(userContracts.sendFeedback, { payload })
