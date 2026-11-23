import { createExtendedStoreChunk } from '@ug/store'

import { type MSScoreT } from '../../../App/Model/MSScore'

type TRecentlyViewedScoreEvent = {
    score_id: MSScoreT['id']
    time_spent: number
    date_updated: number
}

type TRecentlyViewedScoresStoreChunkState = {
    scores: MSScoreT[]
    events: TRecentlyViewedScoreEvent[]
    isLoading: boolean
}

export const recentlyViewedScoresStoreChunk =
    createExtendedStoreChunk<TRecentlyViewedScoresStoreChunkState>({
        storeKey: 'recently_viewed_scores',
        treeKey: 'modules',
    })({
        initialState: {
            scores: [],
            events: [],
            isLoading: false,
        },
        actions: {
            // Keep recently viewed items locally without collecting view statistics.
            addEvent: (_event: TRecentlyViewedScoreEvent) => ({ events: [] }),
            addScore: (score: MSScoreT, state) => {
                return { scores: [score, ...state.scores.filter(s => s.id !== score.id)] }
            },
        },
    })
