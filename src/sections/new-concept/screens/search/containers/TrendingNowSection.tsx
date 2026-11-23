import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'
import { Screen } from '@mu-native/navigation'
import {
    reportScoreResultClick,
    ScoreMediumGrid,
    useResultsViewReporter,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'

import type { MSScoreT } from '../../../../../App/Model/MSScore'

const MAX_TRENDING_ITEMS = 8

type TProps = {
    title: string
    scores: MSScoreT[]
    onScorePress: (score: MSScoreT) => void
}

export const TrendingNowSection = ({ title, scores, onScorePress }: TProps) => {
    const displayedScores = useMemo(() => scores.slice(0, MAX_TRENDING_ITEMS), [scores])

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({ screen: Screen.searchRoot, blockName: title, searchType: 'browse' }),
        [title],
    )

    useResultsViewReporter({ scores: displayedScores, context: analyticsContext })

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(
                score,
                displayedScores.indexOf(score),
                displayedScores.length,
                analyticsContext,
            )
            onScorePress(score)
        },
        [displayedScores, analyticsContext, onScorePress],
    )

    if (scores.length === 0) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} style={styles.header} />
            <ScoreMediumGrid scores={displayedScores} onScorePress={handleScorePress} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
    },
    header: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: layout.marginXm,
    },
})
