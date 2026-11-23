import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
    createFilterSelectionsSource,
    createFilterSelectionStoreChunk,
    searchThunks,
    type TRenderFilters,
    type TSelectableFilterKey,
} from '@mu-native/search'
import { createUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import {
    loadMoreScoresWithSelection,
    searchScoresWithSelection,
} from '../../../../App/Explore/exploreAsyncActions'
import { type TSeedFilter } from '../api/filters.ts'

type TOptions = {
    /** Prefix of the per-mount filter-selection chunk key. */
    filterChunkKeyPrefix: string
    /** Key of the screen's score-list chunk. */
    scoresChunkKey: string
    /** Filters pre-applied once the catalog loads, before the first search. */
    getSeedFilters?: (filterParams: TRenderFilters) => TSeedFilter[]
}

// Each mount gets a unique filter-chunk key so two live instances (e.g. one per
// tab) never share an encapsulated selection.
const instanceCounters = new Map<string, number>()

// Owns the full lifecycle of a filterable score search screen: encapsulated
// filter + score-list chunks, catalog loading, one-time filter seeding, and the
// search/load-more/toggle actions. Screens stay purely presentational.
export const useFilteredScoreSearch = ({
    filterChunkKeyPrefix,
    scoresChunkKey,
    getSeedFilters,
}: TOptions) => {
    const instanceKeyRef = useRef<string>(undefined)
    if (!instanceKeyRef.current) {
        const nextInstance = (instanceCounters.get(filterChunkKeyPrefix) ?? 0) + 1
        instanceCounters.set(filterChunkKeyPrefix, nextInstance)
        instanceKeyRef.current = `${filterChunkKeyPrefix}_${nextInstance}`
    }

    // Both chunks are injected on mount and dropped on unmount, so re-entering
    // the screen always starts from a clean query.
    const { chunk: filtersChunk } = useInjectDynamicStoreChunk(
        instanceKeyRef.current,
        key => createFilterSelectionStoreChunk(key),
        'screens',
    )
    const { chunk: scoresChunk } = useInjectDynamicStoreChunk(
        scoresChunkKey,
        key => createUniversalScoreListDynamicStoreChunk(key, 0),
        'screens',
    )

    const [scoreIds, scoresMap, totalItems, isInitialLoading, isLoading] = useValues([
        scoresChunk.props.getScoresIds,
        scoresChunk.props.getScoresMap,
        scoresChunk.props.getTotalItems,
        scoresChunk.props.getIsInitialLoading,
        scoresChunk.props.getIsLoading,
    ])
    const [filterParams, selectedFilters, searchTerm, sortParams, selectedSort] = useValues([
        filtersChunk.props.getFilterParams,
        filtersChunk.props.getSelectedFilters,
        filtersChunk.props.getSearchTerm,
        filtersChunk.props.getSortParams,
        filtersChunk.props.getSelectedSort,
    ])

    const actions = useActions({
        loadFilterParams: searchThunks.loadFilterParamsInto,
        setSearchTerm: filtersChunk.actions.setSearchTerm,
        setSelectedFilter: filtersChunk.actions.setSelectedFilters,
        setSelectedSort: filtersChunk.actions.setSelectedSort,
        runSearch: searchScoresWithSelection,
        runLoadMore: loadMoreScoresWithSelection,
    })

    // Load this screen's own filter catalog once on mount.
    useEffect(() => {
        actions.loadFilterParams(filtersChunk)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const isSeededRef = useRef(false)
    const getSeedFiltersRef = useRef(getSeedFilters)
    getSeedFiltersRef.current = getSeedFilters

    // False until the first search is dispatched — the chunk's own loading flags
    // stay false while the filter catalog loads, which would otherwise flash the
    // empty state on the first frames.
    const [hasSearched, setHasSearched] = useState(false)

    // Pre-apply the seed filters once the catalog is ready, then run the first
    // search with the seeded selection.
    useEffect(() => {
        if (isSeededRef.current || !filterParams) return
        isSeededRef.current = true
        getSeedFiltersRef.current?.(filterParams).forEach(filter =>
            actions.setSelectedFilter({
                filterKey: filter.filterKey,
                itemId: filter.itemId,
                value: true,
            }),
        )
        actions.runSearch(scoresChunk, filtersChunk)
        setHasSearched(true)
    }, [actions, filterParams, filtersChunk, scoresChunk])

    const search = useCallback(
        () => actions.runSearch(scoresChunk, filtersChunk),
        [actions, scoresChunk, filtersChunk],
    )

    const loadMore = useCallback(
        () => actions.runLoadMore(scoresChunk, filtersChunk),
        [actions, scoresChunk, filtersChunk],
    )

    const toggleFilter = useCallback(
        (filterKey: TSelectableFilterKey, itemId: string | number) => {
            actions.setSelectedFilter({ filterKey, itemId })
            actions.runSearch(scoresChunk, filtersChunk)
        },
        [actions, scoresChunk, filtersChunk],
    )

    const setSort = useCallback(
        (itemId: string) => {
            actions.setSelectedSort(itemId)
            actions.runSearch(scoresChunk, filtersChunk)
        },
        [actions, scoresChunk, filtersChunk],
    )

    const selectionsSource = useMemo(
        () => createFilterSelectionsSource(filtersChunk),
        [filtersChunk],
    )

    // Thunk creator handed to the filter sheet so applying filters there fetches
    // with this screen's encapsulated selection rather than the global one.
    const sheetSearch = useCallback(
        () => searchScoresWithSelection(scoresChunk, filtersChunk),
        [scoresChunk, filtersChunk],
    )

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds.map(id => scoresMap[id]).filter(Boolean)
    }, [scoreIds, scoresMap])

    return {
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
        isInitialLoading: isInitialLoading || !hasSearched,
        isLoading,
        isSeededRef,
        setSearchTerm: actions.setSearchTerm,
        search,
        loadMore,
        toggleFilter,
        setSort,
        sheetSearch,
    }
}
