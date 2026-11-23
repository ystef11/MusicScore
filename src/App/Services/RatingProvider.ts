import { apiRequest, scoreContracts, TScoreRatePayloadDto } from '@mu-native/api'
import { globalStorage, sanitizeCommentBody, TThunkAction } from '@mu-native/common'

import MetricaEvents from '../constants/MetricaEvents'
import { getScoreMetaEvent } from '../constants/scoreAnalytic'
import { MSScoreT } from '../Model/MSScore'
import reportEvent from '../Utils/Analytics'

const filterKey = 'filterShowcased'

type TRateScore = {
    score: MSScoreT
    rating: number
    comment: string | null
}
export const rateScore: TThunkAction<TRateScore> = ({ score, rating, comment }: TRateScore) => {
    return async (dispatch: any) => {
        try {
            const scoreId = score.id
            const payload: TScoreRatePayloadDto = { id: scoreId, rating }

            if (comment) {
                const response = await apiRequest(scoreContracts.addComment, {
                    payload: { body: sanitizeCommentBody(comment), score_id: scoreId },
                })
                payload.score_comment_id = response.id
            }

            await apiRequest(scoreContracts.rate, { payload })
            reportEvent(MetricaEvents.SCORE_RATING, {
                ...getScoreMetaEvent(score),
                'params.key': ['rating'],
                'params.str_value': [`${rating}`],
                'params.value': [rating],
            })
        } catch (e) {
            console.error('🍓[RatingProvider.rateScore]', e)
        }
    }
}

export async function setFilterWasOpen() {
    globalStorage.set(filterKey, true)
}

export function getFilterWasOpen() {
    return globalStorage.get(filterKey)
}
