import { type ReactElement, type Ref, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native'

import { useScoreInfoScreenFeatureFlag } from '@mu-native/ab'
import { layout } from '@mu-native/ds'
import { useOpenScorePlay } from '@mu-native/score'

import type { MSScoreT } from '../../../../App/Model/MSScore'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'

import { ScoreItem } from './ScoreItem'

type Props = {
    scores: MSScoreT[]
    onScorePress: (score: MSScoreT) => void
    /**
     * Shows the Play pill on items for the MUP-13932 test group (library
     * surfaces only, matching legacy `MSFlashList`). It jumps straight to the
     * player, bypassing the Score Info screen.
     */
    enablePlayShortcut?: boolean
    onEndReached?: () => void
    ListHeaderComponent?: ReactElement | null
    ListEmptyComponent?: ReactElement | null
    /** Rendered after the last row (and after ListEmptyComponent when the list is empty). */
    ListFooterComponent?: ReactElement | null
    contentTopInset?: number
    contentBottomInset?: number
    refreshing?: boolean
    onRefresh?: () => void
    ref?: Ref<FlatList<MSScoreT>>
}

const ListSeparator = () => <View style={styles.separator} />

export const ScoreResultsList = ({
    scores,
    onScorePress,
    enablePlayShortcut,
    onEndReached,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    contentTopInset,
    contentBottomInset,
    refreshing,
    onRefresh,
    ref,
}: Props) => {
    const { scoreColumns } = useResponsiveLayout()
    const isMultiColumn = scoreColumns > 1

    const playShortcutEnabled = useScoreInfoScreenFeatureFlag()
    const openScorePlay = useOpenScorePlay()
    const onPlayPress = enablePlayShortcut && playShortcutEnabled ? openScorePlay : undefined

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<MSScoreT>) => (
            <View style={isMultiColumn ? styles.gridCell : styles.scoreRow}>
                <ScoreItem score={item} onPress={onScorePress} onPlayPress={onPlayPress} />
            </View>
        ),
        [onScorePress, onPlayPress, isMultiColumn],
    )

    const keyExtractor = useCallback((item: MSScoreT) => String(item.id), [])

    return (
        <FlatList
            ref={ref}
            key={scoreColumns}
            data={scores}
            numColumns={scoreColumns}
            columnWrapperStyle={isMultiColumn ? styles.columnWrapper : undefined}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ListSeparator}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent ?? undefined}
            ListEmptyComponent={ListEmptyComponent ?? undefined}
            ListFooterComponent={ListFooterComponent ?? undefined}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
                onRefresh ? (
                    <RefreshControl
                        refreshing={!!refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={contentTopInset}
                    />
                ) : undefined
            }
            contentContainerStyle={[
                styles.listContent,
                { paddingTop: contentTopInset ?? 0, paddingBottom: contentBottomInset ?? 0 },
            ]}
        />
    )
}

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
    },
    scoreRow: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    columnWrapper: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginLg,
    },
    gridCell: {
        flex: 1,
    },
    separator: {
        height: layout.marginMd,
    },
})
