import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout } from '@mu-native/ds'
import {
    reportScoreResultClick,
    ScoreSmallItem,
    useResultsViewReporter,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'

import type { MSScoreT } from '../../../../../App/Model/MSScore'

const MAX_RECENTLY_ITEMS = 4

const ANALYTICS_CONTEXT: TResultsListContext = {
    screen: 'HomeMain',
    blockName: 'Recently viewed',
    searchType: 'browse',
    entity: 'recently_viewed',
    filters: [{ key: 'recently_viewed', value: '1' }],
    sort: 'date_updated',
    place: 'Recently Viewed',
}

type TProps = {
    scores: MSScoreT[]
    onScorePress: (score: MSScoreT) => void
}

export const RecentlyViewedSection = ({ scores, onScorePress }: TProps) => {
    const displayedScores = useMemo(() => scores.slice(0, MAX_RECENTLY_ITEMS), [scores])

    const rows = useMemo(() => {
        const grouped: MSScoreT[][] = []
        for (let i = 0; i < displayedScores.length; i += 2) {
            grouped.push(displayedScores.slice(i, i + 2))
        }
        return grouped
    }, [displayedScores])

    useResultsViewReporter({ scores: displayedScores, context: ANALYTICS_CONTEXT })

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(
                score,
                displayedScores.indexOf(score),
                displayedScores.length,
                ANALYTICS_CONTEXT,
            )
            onScorePress(score)
        },
        [displayedScores, onScorePress],
    )

    if (rows.length === 0) return null

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {rows.map((rowItems, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        <View style={styles.cell}>
                            <ScoreSmallItem score={rowItems[0]} onPress={handleScorePress} />
                        </View>
                        <View style={styles.cell}>
                            {!!rowItems[1] && (
                                <ScoreSmallItem score={rowItems[1]} onPress={handleScorePress} />
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginSm,
    },
    grid: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginSm,
    },
    row: {
        flexDirection: 'row',
        gap: layout.marginSm,
    },
    cell: {
        flex: 1,
    },
})
