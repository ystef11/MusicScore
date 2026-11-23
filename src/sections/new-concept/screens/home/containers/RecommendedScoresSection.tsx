import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    reportScoreResultClick,
    ScoreItem,
    useResponsiveLayout,
    useResultsViewReporter,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'

import type { MSScoreT } from '../../../../../App/Model/MSScore'

const MAX_ITEMS = 4

type TProps = {
    title: string
    scores: MSScoreT[]
    /** Preset query replayed on "View all" (§3, always present even when empty). */
    params?: Record<string, unknown>
    onScorePress: (score: MSScoreT) => void
}

export const RecommendedScoresSection = ({ title, scores, params, onScorePress }: TProps) => {
    const navigation = useAppNavigation()
    const { isWide, width } = useResponsiveLayout()

    const onViewAllPress = useCallback(() => {
        navigation.push(Screen.browseExploreScores, { searchParams: params })
    }, [navigation, params])

    const displayedScores = useMemo(() => scores.slice(0, MAX_ITEMS), [scores])

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({ screen: 'HomeMain', blockName: title, searchType: 'browse' }),
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

    const cellWidth = (width - layout.baseMarginFromEdges * 2 - layout.marginLg) / 2

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onViewAllPress={onViewAllPress} style={styles.header} />
            <View style={[styles.list, isWide && styles.listGrid]}>
                {displayedScores.map(score => (
                    <View key={score.id} style={isWide ? { width: cellWidth } : undefined}>
                        <ScoreItem score={score} onPress={handleScorePress} />
                    </View>
                ))}
            </View>
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
        paddingVertical: layout.marginXs,
    },
    list: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginXm,
    },
    listGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: layout.marginLg,
        rowGap: layout.marginMd,
    },
})
