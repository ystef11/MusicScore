import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    FilterChipsRow,
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    NestedScreenHeader,
    useScreenViewReporter,
} from '@mu-native/new-concept-shared'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'
import type { DigitalEbookModel } from '../../../../ebooks/screens/ebooksMain/new/api/digital.ebooks.models'
import { LibraryEmptyState } from '../components/LibraryEmptyState'
import { SongbookListItem } from '../components/SongbookListItem'
import {
    SONGBOOK_FILTERS,
    type TSongbooksFilterKey,
    useLibrarySongbooks,
} from '../store/useLibrarySongbooks'

export const LibrarySongbooksScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const [filter, setFilter] = useState<TSongbooksFilterKey>('all')

    const { ebooks, tabs, isLoading, loadMore } = useLibrarySongbooks(filter)

    const hasLoadStartedRef = useRef(false)
    const [initialLoading, setInitialLoading] = useState(true)
    useEffect(() => {
        if (isLoading) hasLoadStartedRef.current = true
        else if (hasLoadStartedRef.current) setInitialLoading(false)
    }, [isLoading])

    // A tab shows when its availability flag is true (§8); `all` is always shown
    // and the active tab stays visible even when its source empties.
    const visibleFilters = useMemo(
        () =>
            SONGBOOK_FILTERS.filter(
                item => item.key === 'all' || item.key === filter || tabs?.[item.key],
            ),
        [tabs, filter],
    )

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_LIBRARY_SONGBOOKS_VIEW)

    const handlePress = useCallback(
        (ebook: DigitalEbookModel) => {
            reportEvent(MetricaEvents.SONGBOOK_CLICK, {
                screen: Screen.librarySongbooks,
                songbook_id: ebook.id,
                position: ebooks.indexOf(ebook),
            })
            navigation.push(Screen.ebookDetailsStack, { id: ebook.id })
        },
        [navigation, ebooks],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<DigitalEbookModel>) => (
            <View style={styles.itemRow}>
                {/* Source badge isn't sent in MVP (§8) — derive it from the active tab. */}
                <SongbookListItem
                    ebook={item}
                    subtitle={
                        filter === 'purchased'
                            ? translate('native.new_concept.common.purchased')
                            : undefined
                    }
                    onPress={handlePress}
                />
            </View>
        ),
        [filter, handlePress],
    )

    return (
        <View style={styles.root}>
            <NestedScreenHeader title={translate('native.bottom_bar.books_tab')} />
            <FilterChipsRow
                chips={visibleFilters.map(item => ({
                    key: item.key,
                    label: item.getLabel(),
                    isSelected: item.key === filter,
                }))}
                onChipPress={chip => setFilter(chip.key)}
            />
            <FlatList
                data={ebooks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={ListSeparator}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    initialLoading || isLoading ? (
                        <ListLoader />
                    ) : (
                        <LibraryEmptyState variant="songbooks" />
                    )
                }
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg },
                ]}
            />
        </View>
    )
}

const ListSeparator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    listContent: {
        flexGrow: 1,
    },
    itemRow: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    separator: {
        height: layout.marginMd,
    },
})
