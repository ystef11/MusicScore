import { ScrollView, StyleSheet, View } from 'react-native'

import { brandColors, layout, SkeletonLoaderWrapper } from '@mu-native/ds'

import { useResponsiveLayout } from '../hooks/useResponsiveLayout'

import { SCORE_MEDIUM_GRID_CARD_WIDTH } from './ScoreMediumGrid'

const IMAGE_SIZE = 93
const ROWS_PER_COLUMN = 2
const PLACEHOLDER_COLUMNS = 3

const SCORE_MEDIUM_GRID_TARGET_WIDTH = 290

// Placeholder mirroring ScoreMediumGrid's column-of-two layout, shown while a
// genre chip's scores load so the section keeps its height instead of collapsing.
export const ScoreMediumGridSkeleton = () => {
    const { isWide, carouselItemWidth } = useResponsiveLayout()
    const columnWidth = isWide
        ? carouselItemWidth(SCORE_MEDIUM_GRID_TARGET_WIDTH)
        : SCORE_MEDIUM_GRID_CARD_WIDTH

    return (
        <SkeletonLoaderWrapper>
            <ScrollView
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carousel}
            >
                {Array.from({ length: PLACEHOLDER_COLUMNS }).map((_, columnIndex) => (
                    <View key={columnIndex} style={[styles.column, { width: columnWidth }]}>
                        {Array.from({ length: ROWS_PER_COLUMN }).map((__, rowIndex) => (
                            <View key={rowIndex} style={styles.item}>
                                <View style={styles.thumbnail} />
                                <View style={styles.info}>
                                    <View style={styles.titleLine} />
                                    <View style={styles.subtitleLine} />
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
        </SkeletonLoaderWrapper>
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginMd,
    },
    thumbnail: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 4,
        backgroundColor: brandColors.backgroundInactive,
    },
    info: {
        flex: 1,
        gap: layout.marginSm,
    },
    titleLine: {
        width: '90%',
        height: 14,
        borderRadius: 4,
        backgroundColor: brandColors.backgroundInactive,
    },
    subtitleLine: {
        width: '55%',
        height: 12,
        borderRadius: 4,
        backgroundColor: brandColors.backgroundInactive,
    },
})
