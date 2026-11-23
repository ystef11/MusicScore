import { useCallback, useMemo } from 'react'

import { translate } from '@mu-native/locale'
import { useAppRoute } from '@mu-native/navigation'
import {
    buildAppliedFilterChips,
    buildScoreSortOptions,
    FilterChipsRow,
    NestedScreenHeader,
    ResultsCountRow,
    type TQuickFilter,
} from '@mu-native/new-concept-shared'
import { resolveInitialFilters, TFilterSelectionStoreChunk } from '@mu-native/search'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import { searchScoresWithSelection } from '../../../../../App/Explore/exploreAsyncActions.ts'

import { TExploreScoresParams } from './ExploreScoresScreen.tsx'

type TProps = {
    filtersChunk: TFilterSelectionStoreChunk
    scoresChunk: TUniversalScoreListDynamicStoreChunk
    onOpenFilters: () => void
}

export const ExploreScoresScreenHeader = ({ filtersChunk, scoresChunk, onOpenFilters }: TProps) => {
    const { initialFilters } = useAppRoute<TExploreScoresParams>()

    const [totalItems, isInitialLoading] = useValues([
        scoresChunk.props.getTotalItems,
        scoresChunk.props.getIsInitialLoading,
    ])
    const [filterParams, selectedFilters, sortParams, selectedSort] = useValues([
        filtersChunk.props.getFilterParams,
        filtersChunk.props.getSelectedFilters,
        filtersChunk.props.getSortParams,
        filtersChunk.props.getSelectedSort,
    ])
    const actions = useActions({
        setSelectedFilter: filtersChunk.actions.setSelectedFilters,
        setSelectedSort: filtersChunk.actions.setSelectedSort,
        search: searchScoresWithSelection,
    })

    const onToggleQuickFilter = useCallback(
        (filter: TQuickFilter) => {
            actions.setSelectedFilter({ filterKey: filter.filterKey, itemId: filter.itemId })
            actions.search(scoresChunk, filtersChunk)
        },
        [actions, filtersChunk, scoresChunk],
    )

    const onSelectSort = useCallback(
        (id: string) => {
            actions.setSelectedSort(id)
            actions.search(scoresChunk, filtersChunk)
        },
        [actions, filtersChunk, scoresChunk],
    )

    const quickFilters = useMemo<TQuickFilter[]>(() => {
        // Filters applied on arrival — the genre replayed from a "View all" /
        // "Browse by genre" tap, plus anything toggled since — shown as selected
        // chips so the active refinement is visible, not just reflected in results.
        const appliedChips = buildAppliedFilterChips(filterParams, selectedFilters)
        const appliedKeys = new Set(appliedChips.map(chip => chip.key))
        const defaultChips = resolveInitialFilters(filterParams, initialFilters)
            .filter(filter => !appliedKeys.has(`${filter.filterKey}:${filter.itemId}`))
            .map(filter => ({
                ...filter,
                isSelected: !!selectedFilters?.[filter.filterKey]?.[filter.itemId],
            }))
        return [...appliedChips, ...defaultChips]
    }, [filterParams, initialFilters, selectedFilters])

    return (
        <NestedScreenHeader title={translate('native.new_concept.home.explore_scores')}>
            <FilterChipsRow
                chips={quickFilters}
                onChipPress={onToggleQuickFilter}
                onOpenFilters={onOpenFilters}
            />
            <ResultsCountRow
                countText={
                    isInitialLoading
                        ? ''
                        : translate('native.new_concept.home.scores_count', {
                              count: totalItems.toLocaleString('en-US'),
                          })
                }
                sortOptions={buildScoreSortOptions(sortParams)}
                selectedSortId={selectedSort}
                onSelectSort={onSelectSort}
            />
        </NestedScreenHeader>
    )
}
