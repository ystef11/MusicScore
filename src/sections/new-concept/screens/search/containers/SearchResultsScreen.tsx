import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    BaseEmptyStateView,
    brandColors,
    layout,
    NativeBottomSheetRef,
    useAppSafeArea,
} from '@mu-native/ds'
import { search as searchIcon } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import {
    buildAppliedFilterChips,
    buildQuizQuickFilters,
    buildScoreSortOptions,
    FilterChipsRow,
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    reportScoreResultClick,
    ResultsCountRow,
    ScoreFilterSheet,
    ScoreResultsList,
    SearchFieldRow,
    type TQuickFilter,
    type TResultsListContext,
    useFilteredScoreSearch,
    useOpenScorePress,
    useResultsViewReporter,
    useScreenViewReporter,
} from '@mu-native/new-concept-shared'
import { quizStoreChunk } from '@mu-native/quiz'
import {
    createFlattenedSelectedFiltersSelector,
    searchStoreChunk,
    type TSelectableFilterKey,
} from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'
import { useRecentSearchRecorder } from '../store/useRecentSearchRecorder'
import { useShazamSearchEntry } from '../store/useShazamSearchEntry'

// Pre-applied refinement on top of the text query: instrument + mastery level.
const SEEDED_FILTER_KEYS = ['instrument', 'complexity']

type TRouteParams = {
    query: string
    // Filters re-applied when arriving from a saved recent search; when present
    // they take the place of the quiz-derived seeds.
    initialFilters?: { filterKey: TSelectableFilterKey; itemId: string }[]
}

export const SearchResultsScreen = () => {
    const navigation = useAppNavigation()
    const { query = '', initialFilters } = useAppRoute<TRouteParams>()
    const insets = useAppSafeArea()
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const [quizAnswers] = useValues([quizStoreChunk.props.getQuizAnswers])

    const {
        filtersChunk,
        scoresChunk,
        selectionsSource,
        filterParams,
        selectedFilters,
        searchTerm,
        sortParams,
        selectedSort,
        scores,
        totalItems,
        isInitialLoading,
        isLoading,
        isSeededRef,
        setSearchTerm,
        search,
        loadMore,
        toggleFilter,
        setSort,
        sheetSearch,
    } = useFilteredScoreSearch({
        filterChunkKeyPrefix: 'search_results_query',
        scoresChunkKey: 'search-scores',
        getSeedFilters: params => {
            if (initialFilters?.length) return initialFilters

            // Quiz answers allow multiple choices per group, but seed filters combine
            // with AND — pre-applying e.g. Guitar + Ukulele matches almost no scores.
            // Keep only the first answer per group (instrument, genre, …) so the
            // default search stays broad.
            const seededGroups = new Set<string>()
            return buildQuizQuickFilters(quizAnswers, params, null).filter(filter => {
                if (!SEEDED_FILTER_KEYS.includes(filter.filterKey)) return false
                if (seededGroups.has(filter.filterKey)) return false
                seededGroups.add(filter.filterKey)
                return true
            })
        },
    })

    const actions = useActions({
        addToSearchHistory: searchStoreChunk.actions.addToSearchHistory,
        setGlobalSearchTerm: searchStoreChunk.actions.setSearchTerm,
    })

    const [draftTerm, setDraftTerm] = useState(query)

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_SEARCH_RESULTS_VIEW)

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    // Seed the route query into the encapsulated chunk.
    useEffect(() => {
        setSearchTerm(query)
        setDraftTerm(query)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    useEffect(
        () => () => {
            actions.setGlobalSearchTerm('')
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    useRecentSearchRecorder({ searchTerm, filterParams, selectedFilters, enabledRef: isSeededRef })

    const flattenedFiltersSelector = useMemo(
        () => createFlattenedSelectedFiltersSelector(filtersChunk.props.getSelectedFilters),
        [filtersChunk],
    )
    const [flattenedFilters, searchQueryId] = useValues([
        flattenedFiltersSelector,
        searchStoreChunk.props.getSearchQueryId,
    ])

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: Screen.searchResults,
            searchType: 'search',
            filters: flattenedFilters,
            sort: selectedSort ?? 'relevance',
            searchQuery: searchTerm,
            searchQueryId,
            place: 'Search Results',
        }),
        [flattenedFilters, selectedSort, searchTerm, searchQueryId],
    )

    useResultsViewReporter({
        scores,
        totalCount: totalItems,
        context: analyticsContext,
        enabled: !isInitialLoading && !isLoading,
    })

    useEffect(() => {
        if (isInitialLoading || isLoading || scores.length > 0) return
        reportEvent(MetricaEvents.SEARCH_NO_RESULTS_PAGE_VIEW, {
            screen: 'SearchNoResults',
            search_session_text: searchTerm,
        })
    }, [isInitialLoading, isLoading, scores.length, searchTerm])

    const openScore = useOpenScorePress('Search Results')

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(score, scores.indexOf(score), totalItems, analyticsContext)
            openScore(score)
        },
        [openScore, scores, totalItems, analyticsContext],
    )

    const handleBack = useCallback(() => navigation.goBack(), [navigation])

    const { trailingButton: shazamButton, briefingSheet: shazamBriefingSheet } =
        useShazamSearchEntry()

    const onOpenFilters = useCallback(() => sheetRef.current?.present(), [])
    const onCloseFilters = useCallback(() => sheetRef.current?.dismiss(), [])

    const onSubmitSearch = useCallback(() => {
        // An empty query is a valid search — it shows unfiltered results.
        const trimmed = draftTerm.trim()
        setSearchTerm(trimmed)
        actions.setGlobalSearchTerm(trimmed)
        if (trimmed) actions.addToSearchHistory(trimmed)
        search()
    }, [actions, draftTerm, setSearchTerm, search])

    const onToggleQuickFilter = useCallback(
        (filter: TQuickFilter) => toggleFilter(filter.filterKey, filter.itemId),
        [toggleFilter],
    )

    const listEmpty = useMemo(() => {
        if (isInitialLoading || isLoading) return <ListLoader />
        return (
            <View style={styles.emptyState}>
                <BaseEmptyStateView
                    icon={searchIcon}
                    title={translate('native.search.no.results')}
                    description={translate('native.new_concept.common.check_spelling_hint')}
                />
            </View>
        )
    }, [isInitialLoading, isLoading])

    const quickFilters = useMemo(() => {
        const appliedChips = buildAppliedFilterChips(filterParams, selectedFilters)
        const appliedKeys = new Set(appliedChips.map(chip => chip.key))
        const quizChips = buildQuizQuickFilters(quizAnswers, filterParams, selectedFilters).filter(
            chip => !appliedKeys.has(chip.key),
        )
        return [...appliedChips, ...quizChips]
    }, [quizAnswers, filterParams, selectedFilters])

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <SearchFieldRow
                onBack={handleBack}
                value={draftTerm}
                onChangeText={setDraftTerm}
                onSubmitEditing={onSubmitSearch}
                onClear={() => setDraftTerm('')}
                autoFocus={false}
                trailingButton={shazamButton}
            />
            <FilterChipsRow
                chips={quickFilters}
                onChipPress={onToggleQuickFilter}
                onOpenFilters={onOpenFilters}
            />
            <ResultsCountRow
                countText={
                    isInitialLoading
                        ? ''
                        : translate('native.new_concept.common.results_count', {
                              count: totalItems.toLocaleString('en-US'),
                          })
                }
                sortOptions={buildScoreSortOptions(sortParams)}
                selectedSortId={selectedSort}
                onSelectSort={setSort}
            />
            <View style={styles.list}>
                <ScoreResultsList
                    scores={scores}
                    onScorePress={handleScorePress}
                    onEndReached={loadMore}
                    ListEmptyComponent={listEmpty}
                    contentTopInset={layout.marginMd}
                    contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
            </View>
            <ScoreFilterSheet
                sheetRef={sheetRef}
                chunk={scoresChunk}
                filters={filterParams}
                onClose={onCloseFilters}
                selections={selectionsSource}
                onSearch={sheetSearch}
            />
            {shazamBriefingSheet}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    list: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        minHeight: 320,
    },
})
