import { MSScoreT } from '../Model/MSScore'

export function getScoreMetaEvent(
    score: MSScoreT | null | undefined,
    isOffScores?: boolean,
    extraParams = {},
) {
    const isOfficial = typeof isOffScores === 'boolean' ? isOffScores : score?.isOfficial
    return {
        scoreTitle: score?.title,
        score_id: score?.idAnalytics,
        secondary_score_id: score?.id,
        is_score_by_pro: score?.authorPro || false,
        ...(isOfficial ? { type: 'official', score_type: 'official' } : { score_type: 'regular' }),
        ...extraParams,
    }
}
