import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import type { MSOfflineScoreT } from '../../../../../App/Model/MSOfflineScore'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import { TSortKind, TSortKindEnum, TSortOrder, TSortOrderEnum } from '../../../../../App/Utils/Sort'

type TSongbookState = {
    scores: MSOfflineScoreT[]
    orderScores: MSOfflineScoreT[]
    sortOrder: TSortOrder
    sortKind: TSortKind
}

export const songbookStoreChunk = createExtendedStoreChunk<TSongbookState>({
    storeKey: 'songbook',
    treeKey: 'modules',
})({
    persist: ['scores', 'orderScores'],
    initialState: {
        scores: [],
        orderScores: [],
        sortOrder: TSortOrderEnum.DESC,
        sortKind: TSortKindEnum.DATE_UPDATED,
    },
    actions: {
        setOrderScoresCustom: (score: MSOfflineScoreT, state) => ({
            orderScores: [...state.orderScores, score],
        }),

        cleanup: (_: void, state) => {
            return {
                scores: state.scores.filter(score => score.webScoreSaved || score.importedFromArchive),
                orderScores: [],
                sortOrder: TSortOrderEnum.DESC,
                sortKind: TSortKindEnum.DATE_UPDATED,
            }
        },
        setSort: ({ order, kind }: { order: TSortOrder; kind: TSortKind }) => {
            return { sortOrder: order, sortKind: kind }
        },
    },
})

// A saved score lands in `scores` or in `orderScores` depending on whether it was purchased
// at save time, and that flag can flip afterwards (buying it, or a stale score object). So both
// buckets have to be checked, the same way the write path guards in addIntoSongBook.
export const isScoreInSongbook = (score: MSScoreT) =>
    createSelector(
        songbookStoreChunk.props.getScores,
        songbookStoreChunk.props.getOrderScores,
        (scores, orderScores) => {
            const isSameScore = (item: MSOfflineScoreT) => `${item.id}` === `${score.id}`
            return scores.some(isSameScore) || orderScores.some(isSameScore)
        },
    )
