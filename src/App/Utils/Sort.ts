import type { MSScoreT } from '../Model/MSScore'
import '../Model/MSScore'

export const TSortKindEnum = {
    TITLE: 'title',
    DATE_ADDED: 'date_added',
    DATE_CREATED: 'date_created',
    DATE_UPDATED: 'date_updated',
    VIEWS: 'views',
} as const

export type TSortKind = (typeof TSortKindEnum)[keyof typeof TSortKindEnum]

export const TSortOrderEnum = {
    ASC: 'asc',
    DESC: 'desc',
} as const
export type TSortOrder = (typeof TSortOrderEnum)[keyof typeof TSortOrderEnum]

export type TSortParams = {
    kind: TSortKind
    order: TSortOrder
}

function sortScoresByTitleASC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreA.title.toLowerCase().localeCompare(scoreB.title.toLowerCase())
}

function sortScoresByTitleDESC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreB.title.toLowerCase().localeCompare(scoreA.title.toLowerCase())
}

function sortScoresByDateUpdatedASC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreB.dateUpdated - scoreA.dateUpdated
}

function sortScoresByDateUpdatedDESC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreA.dateUpdated - scoreB.dateUpdated
}

function sortScoresByDateCreatedASC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreB.dateCreated - scoreA.dateCreated
}

function sortScoresByDateCreatedDESC(scoreA: MSScoreT, scoreB: MSScoreT) {
    return scoreA.dateCreated - scoreB.dateCreated
}

export default function sortScores(
    scores: MSScoreT[],
    kind: TSortKind,
    order: TSortOrder,
): MSScoreT[] {
    if (kind === TSortKindEnum.TITLE) {
        if (order === 'asc') return scores.sort(sortScoresByTitleASC)
        if (order === 'desc') return scores.sort(sortScoresByTitleDESC)
    }

    if (kind === TSortKindEnum.DATE_UPDATED) {
        if (order === 'asc') return scores.sort(sortScoresByDateUpdatedASC)
        if (order === 'desc') return scores.sort(sortScoresByDateUpdatedDESC)
    }

    if (kind === TSortKindEnum.DATE_CREATED) {
        if (order === 'asc') return scores.sort(sortScoresByDateCreatedASC)
        if (order === 'desc') return scores.sort(sortScoresByDateCreatedDESC)
    }

    return scores
}
