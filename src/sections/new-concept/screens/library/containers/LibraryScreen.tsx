import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

import { AppText, brandColors, FloatingMenuButton, layout, useAppSafeArea } from '@mu-native/ds'
import {
    RestorePurchasesEmptyState,
    RestorePurchasesFooter,
    useRestoreLibraryPurchases,
} from '@mu-native/library-purchases'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useFocusEffect } from '@mu-native/navigation'
import {
    FilterChipsRow,
    FLOATING_TAB_BAR_HEIGHT,
    LIBRARY_TAB_ROUTE,
    ListLoader,
    reportScoreResultClick,
    ResultsCountRow,
    RootScreenHeader,
    ScoreResultsList,
    SearchEntryButton,
    SearchFieldRow,
    type TResultsListContext,
    useOpenScorePress,
    usePullToRefresh,
    useResultsViewReporter,
    useScreenViewReporter,
    useTabScrollToTop,
} from '@mu-native/new-concept-shared'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'

import { useActions } from '@ug/store'

import { openMySets } from '../../../../../App/profileScreens/users/store/userAsyncActions'
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'
import { LibraryEmptyState } from '../components/LibraryEmptyState'
import { LibraryTilesCarousel } from '../components/LibraryTilesCarousel'
import {
    LIBRARY_FILTERS,
    LIBRARY_SORT_OPTIONS,
    type TLibraryFilterKey,
    type TLibrarySortKey,
} from '../store/libraryFilters'
import { useLibraryScores } from '../store/useLibraryScores'
import { useLibraryScreen, type TLibrarySetTile } from '../store/useLibraryScreen'

const SEARCH_DEBOUNCE_MS = 300

type TSortMenuProps = {
    sort: TLibrarySortKey
    onSelect: (sort: TLibrarySortKey) => void
}

const LibrarySortMenu = ({ sort, onSelect }: TSortMenuProps) => (
    <FloatingMenuButton
        title={translate('native.new_concept.common.sorting_options')}
        options={LIBRARY_SORT_OPTIONS}
        selectedId={sort}
        onSelect={onSelect}
        testID="Library sort menu"
    />
)

export const LibraryScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const listRef = useTabScrollToTop<FlatList<MSScoreT>>(LIBRARY_TAB_ROUTE)

    const [filter, setFilter] = useState<TLibraryFilterKey>('all')
    const [sort, setSort] = useState<TLibrarySortKey>('recent')
    const [isSearching, setIsSearching] = useState(false)
    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const timer = setTimeout(
            () => setSearchQuery(searchInput.trim()),
            searchInput ? SEARCH_DEBOUNCE_MS : 0,
        )
        return () => clearTimeout(timer)
    }, [searchInput])

    const {
        tiles,
        scoresTabs,
        sets,
        scoresSeed,
        hasData,
        refresh: refreshScreen,
    } = useLibraryScreen()
    const {
        scores,
        totalCount,
        isLoading,
        loadMore,
        refresh: refreshScores,
        offlineCount,
    } = useLibraryScores({
        filter,
        sort,
        searchQuery: isSearching ? searchQuery : '',
        seed: scoresSeed,
    })

    // §7: the screen is personal and uncached — a liked/purchased score must
    // appear on return. The controller already refetches on focus; refresh the
    // scores list too (skipping the first focus, which the mount fetch covers).
    const isFirstFocusRef = useRef(true)
    useFocusEffect(
        useCallback(() => {
            if (isFirstFocusRef.current) {
                isFirstFocusRef.current = false
                return
            }
            refreshScores()
        }, [refreshScores]),
    )

    const refreshAll = useCallback(
        () => Promise.all([refreshScreen(), refreshScores()]),
        [refreshScreen, refreshScores],
    )
    const { isRefreshing, onRefresh } = usePullToRefresh(refreshAll)

    // A chip shows when its tab has content (§7): `all` always, uploaded/purchased
    // per `scores.tabs`, offline per local content; the active chip stays visible.
    const availableFilters = useMemo(
        () =>
            LIBRARY_FILTERS.filter(
                item =>
                    item.key === 'all' ||
                    item.key === filter ||
                    (item.key === 'uploads' && scoresTabs?.uploaded) ||
                    (item.key === 'purchased' && scoresTabs?.purchased) ||
                    (item.key === 'offline' && offlineCount > 0),
            ),
        [scoresTabs, offlineCount, filter],
    )

    const filterChips = useMemo(
        () => availableFilters.map(item => ({ ...item, isSelected: item.key === filter })),
        [availableFilters, filter],
    )

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_LIBRARY_VIEW)

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: Screen.libraryMain,
            blockName: 'Scores',
            searchType: 'browse',
            filters: [
                { key: 'library_filter', value: filter },
                ...(searchQuery ? [{ key: 'text', value: searchQuery }] : []),
            ],
            sort,
        }),
        [filter, searchQuery, sort],
    )

    useResultsViewReporter({
        scores,
        totalCount,
        context: analyticsContext,
        enabled: !isLoading,
    })

    const openScore = useOpenScorePress('Library')

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            if (!score) return
            reportScoreResultClick(score, scores.indexOf(score), totalCount, analyticsContext)
            openScore(score)
        },
        [openScore, scores, totalCount, analyticsContext],
    )

    const handleFilterChipPress = useCallback(
        (chip: { key: TLibraryFilterKey }) => {
            if (chip.key === 'offline') {
                reportEvent(MetricaEvents.LIBRARY_MY_SCORES_ORDERS_CLICK, {
                    'params.key': ['place'],
                    'params.str_value': ['offline'],
                    'params.value': [0],
                })
            }
            setFilter(chip.key)
        },
        [],
    )

    const handleSearchPress = useCallback(() => setIsSearching(true), [])

    const handleSearchCancel = useCallback(() => {
        setIsSearching(false)
        setSearchInput('')
        setSearchQuery('')
    }, [])

    const { openMySets: handleMySetsPress } = useActions({ openMySets })
    const handleOfflinePress = useCallback(() => navigation.navigate(Screen.songBook), [navigation])

    const handleSavedPress = useCallback(() => {
        navigation.push(Screen.librarySavedScores)
    }, [navigation])

    const handleSongbooksPress = useCallback(() => {
        navigation.push(Screen.librarySongbooks)
    }, [navigation])

    const handleSetPress = useCallback(
        (set: TLibrarySetTile) => {
            navigation.push(Screen.librarySet, { setId: set.id, title: set.title })
        },
        [navigation],
    )

    const listHeader = useMemo(() => {
        if (isSearching) {
            return (
                <View>
                    <SearchFieldRow
                        onCancel={handleSearchCancel}
                        autoFocus
                        value={searchInput}
                        onChangeText={setSearchInput}
                        onClear={() => setSearchInput('')}
                        placeholder={translate('native.new_concept.library.search_placeholder')}
                        isLoading={isLoading}
                    />
                    <FilterChipsRow chips={filterChips} onChipPress={handleFilterChipPress} />
                    <ResultsCountRow
                        countText={translate('native.new_concept.common.results_count', {
                            count: String(totalCount),
                        })}
                        sortOptions={LIBRARY_SORT_OPTIONS}
                        selectedSortId={sort}
                        onSelectSort={setSort}
                        sortMenuTestID="Library sort menu"
                    />
                </View>
            )
        }
        return (
            <View style={styles.header}>
                <RootScreenHeader
                    search={
                        <SearchEntryButton
                            placeholder={translate('native.new_concept.library.search_placeholder')}
                            onPress={handleSearchPress}
                        />
                    }
                />
                <LibraryTilesCarousel
                    sets={sets}
                    showSaved={tiles.savedScores}
                    showSongbooks={tiles.songbooks}
                    onOfflinePress={handleOfflinePress}
                    onMySetsPress={handleMySetsPress}
                    onSavedPress={handleSavedPress}
                    onSongbooksPress={handleSongbooksPress}
                    onSetPress={handleSetPress}
                />
                <View style={styles.scoresHeader}>
                    <AppText font="f24w600" rawText={translate('native.library.my_scores_title')} />
                    <LibrarySortMenu sort={sort} onSelect={setSort} />
                </View>
                <FilterChipsRow chips={filterChips} onChipPress={handleFilterChipPress} />
            </View>
        )
    }, [
        isSearching,
        searchInput,
        isLoading,
        totalCount,
        sets,
        tiles,
        filterChips,
        sort,
        handleFilterChipPress,
        handleSearchPress,
        handleSearchCancel,
        handleOfflinePress,
        handleMySetsPress,
        handleSavedPress,
        handleSongbooksPress,
        handleSetPress,
    ])

    // SMP/SMD "Restore purchase" (MUP-13968) — shown on the purchased filter
    // only: as the list footer when there are results, inside the empty state
    // otherwise. `currentCount` is passed only while the purchased filter is
    // active so the delivery detection compares purchased totals.
    const isPurchasedFilter = filter === 'purchased' && !(isSearching && searchQuery)
    const { isRestoring, isRestoreAvailable, restorePurchases } = useRestoreLibraryPurchases({
        currentCount: isPurchasedFilter && !isLoading ? totalCount : undefined,
        // Poll only while the purchased filter is on-screen — on other filters
        // the count wouldn't be comparable anyway.
        refreshPurchasedList: isPurchasedFilter ? refreshScores : undefined,
    })

    const listEmpty = useMemo(() => {
        if (isLoading) return <ListLoader />
        if (isPurchasedFilter) {
            return (
                <RestorePurchasesEmptyState
                    isRestoring={isRestoring}
                    onRestorePress={restorePurchases}
                    showRestoreAction={isRestoreAvailable}
                    style={styles.purchasedEmptyState}
                />
            )
        }
        return <LibraryEmptyState variant={isSearching && searchQuery ? 'search' : 'scores'} />
    }, [
        isLoading,
        isSearching,
        searchQuery,
        isPurchasedFilter,
        isRestoring,
        isRestoreAvailable,
        restorePurchases,
    ])

    const listFooter =
        isPurchasedFilter && isRestoreAvailable && scores.length > 0 ? (
            <RestorePurchasesFooter isRestoring={isRestoring} onRestorePress={restorePurchases} />
        ) : undefined

    return (
        // `hasData` is "a load has succeeded", not "the list is non-empty", so an empty
        // library still reports instead of timing out.
        <TrackedScreen screenName={PerformanceScreen.library} interactive={hasData}>
            <View style={[styles.root, { paddingTop: insets.top }]}>
                {isSearching && listHeader}
                <ScoreResultsList
                    ref={listRef}
                    scores={scores}
                    onScorePress={handleScorePress}
                    enablePlayShortcut
                    onEndReached={loadMore}
                    ListHeaderComponent={isSearching ? undefined : listHeader}
                    ListEmptyComponent={listEmpty}
                    ListFooterComponent={listFooter}
                    contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                />
            </View>
        </TrackedScreen>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    scoresHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: layout.marginSm,
        paddingBottom: layout.marginXm,
    },
    header: {
        marginBottom: layout.marginMd,
    },
    purchasedEmptyState: {
        // Keeps the message in the upper half of the list area (LibraryEmptyState parity).
        minHeight: 320,
    },
})
