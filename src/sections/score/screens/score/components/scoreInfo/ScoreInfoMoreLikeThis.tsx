import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { CarouselScoreList, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useOpenScore } from '@mu-native/score'

import { useSimilarScores } from '../../hooks/useSimilarScores'
import { MSScoreT } from '../../types/scoreTypes'

type Props = {
    scoreId: number
}

/**
 * "More like this" carousel of similar scores. Tapping a card re-enters the
 * Score Info flow via the shared {@link useOpenScore} helper.
 */
export const ScoreInfoMoreLikeThis = memo(({ scoreId }: Props) => {
    const { scores, isLoading } = useSimilarScores(scoreId)
    const openScore = useOpenScore()

    const onScorePress = useCallback((score: MSScoreT) => openScore(score), [openScore])

    if (!isLoading && !scores.length) return null

    return (
        <CarouselScoreList
            title={translate('native.score.more_like_this')}
            data={scores}
            isLoading={isLoading}
            onScorePress={onScorePress}
            contentContainerStyle={styles.content}
        />
    )
})
ScoreInfoMoreLikeThis.displayName = 'ScoreInfoMoreLikeThis'

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
})
