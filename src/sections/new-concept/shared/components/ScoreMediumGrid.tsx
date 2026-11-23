import { ReactNode, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { layout } from '@mu-native/ds'

import type { MSScoreT } from '../../../../App/Model/MSScore'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'

import { ScoreMediumItem } from './ScoreMediumItem'

export const SCORE_MEDIUM_GRID_CARD_WIDTH = 220
const SCORE_MEDIUM_GRID_TARGET_WIDTH = 290

const ROWS_PER_COLUMN = 2

type TProps = {
    scores: MSScoreT[]
    onScorePress: (score: MSScoreT) => void
    /** Rendered in the empty bottom cell of the last column (e.g. a "View more" CTA). */
    trailingSlot?: ReactNode
}

// Horizontally-scrollable columns of two stacked medium score cards — the
// shared grid behind Home's genre tiles and Search's "Trending now".
export const ScoreMediumGrid = ({ scores, onScorePress, trailingSlot }: TProps) => {
    const { isWide, carouselItemWidth } = useResponsiveLayout()
    const columnWidth = isWide
        ? carouselItemWidth(SCORE_MEDIUM_GRID_TARGET_WIDTH)
        : SCORE_MEDIUM_GRID_CARD_WIDTH

    const columns = useMemo(() => {
        const grouped: MSScoreT[][] = []
        for (let i = 0; i < scores.length; i += ROWS_PER_COLUMN) {
            grouped.push(scores.slice(i, i + ROWS_PER_COLUMN))
        }
        return grouped
    }, [scores])

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
        >
            {columns.map((columnScores, columnIndex) => {
                const isLastColumn = columnIndex === columns.length - 1
                const showTrailingSlot = !!trailingSlot && isLastColumn && !columnScores[1]
                return (
                    <View key={columnIndex} style={[styles.column, { width: columnWidth }]}>
                        {columnScores.map(score => (
                            <ScoreMediumItem key={score.id} score={score} onPress={onScorePress} />
                        ))}
                        {showTrailingSlot && trailingSlot}
                    </View>
                )
            })}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    carousel: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginMd,
    },
    column: {
        gap: layout.marginXm,
    },
})
