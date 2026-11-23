import { DispatchFun } from '@mu-native/common'
import { scoreStoreChunk } from '@mu-native/score'

import type { MSScoreT } from '../../../../App/Model/MSScore.ts'

function saveScoreCommentsCount(score: MSScoreT) {
    return (dispatch: DispatchFun) => {
        dispatch(scoreStoreChunk.actions.setCommentsCount(score.commentsCount))
    }
}

export const commonScoreThunks = {
    saveScoreCommentsCount,
}
