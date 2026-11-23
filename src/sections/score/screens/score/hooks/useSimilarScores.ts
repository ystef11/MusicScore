import { useEffect, useState } from 'react'

import MSScore from '../../../../../App/Model/MSScore'
import { requestSimilarScores } from '../../../../../App/Services/ScoreInfoProvider'
import SentryUtils from '../../../../../App/Utils/Sentry'
import { MSScoreT } from '../types/scoreTypes'

/**
 * Loads scores similar to the given one for the "More like this" section of the
 * Score Info screen. Self-contained (no store chunk) — the result only lives as
 * long as the screen.
 */
export const useSimilarScores = (scoreId: number | undefined) => {
    const [scores, setScores] = useState<MSScoreT[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        if (scoreId) {
            ;(async () => {
                try {
                    const response = await requestSimilarScores(scoreId)
                    const parsed = MSScore.processUserScoresSourceData(response.similar_scores)
                    if (!cancelled) setScores(parsed)
                } catch (error) {
                    SentryUtils.sendMessage('useSimilarScores', error)
                } finally {
                    if (!cancelled) setIsLoading(false)
                }
            })()
        }
        return () => {
            cancelled = true
        }
    }, [scoreId])

    return { scores, isLoading }
}
