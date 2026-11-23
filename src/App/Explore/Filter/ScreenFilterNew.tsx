import { memo, useCallback } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { getStoreValue } from '@mu-native/common'
import {
    BrowseFilterContainer,
    FilterSelectionsProvider,
    FilterSelectionsSource,
    FilterSheetBottomButtons,
    searchStoreChunk,
    SortSectionContainer,
    TRenderFilters,
} from '@mu-native/search'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import reportEvent from '../../Utils/Analytics'
import { screenExploreThunks } from '../ScreenExplore/thunks/thunks'

type SearchThunk = (
    chunk: TUniversalScoreListDynamicStoreChunk,
    searchTerm: string,
) => (dispatch: any, getState?: any) => Promise<unknown> | unknown

type Props = {
    onClose: () => void
    storeChunk: TUniversalScoreListDynamicStoreChunk
    filters: TRenderFilters | undefined
    selections: FilterSelectionsSource
    onSearch?: SearchThunk
}

export const ScreenFilterNew = memo(
    ({ onClose, storeChunk, filters, selections, onSearch }: Props) => {
        const [isLoading, selectedFiltersQuantity, selectedSort] = useValues([
            storeChunk.props.getIsLoading,
            selections.getSelectedFiltersQuantity,
            selections.getSelectedSort,
        ])
        const actions = useActions({
            resetFilters: selections.resetAllSelectedFilters,
            resetSort: selections.resetSelectedSort,
            onSelectFilter: onSearch ?? screenExploreThunks.search,
        })

        const onResetFilters = useCallback(() => {
            const value = getStoreValue(searchStoreChunk.props.getSearchTerm)
            actions.resetFilters()
            actions.resetSort()
            actions.onSelectFilter(storeChunk, value)
            reportEvent(MetricaEvents.SEARCH_FILTERS_RESET, { ui: 'scores' })
        }, [actions, storeChunk])

        const hasActiveFilters =
            selectedFiltersQuantity > 0 || (!!selectedSort && selectedSort !== 'relevance')

        const onSelectFilter = useCallback(() => {
            const value = getStoreValue(searchStoreChunk.props.getSearchTerm)
            actions.onSelectFilter(storeChunk, value)
        }, [actions, storeChunk])

        return (
            <FilterSelectionsProvider source={selections}>
                <ScrollView
                    testID={scoreTestIds.filtersModal}
                    contentContainerStyle={styles.contentContainer}
                >
                    <BrowseFilterContainer
                        filters={filters}
                        onSelectFilter={onSelectFilter}
                        isLoading={isLoading}
                    />
                    <SortSectionContainer isLoading={isLoading} onSelectFilter={onSelectFilter} />
                </ScrollView>
                <FilterSheetBottomButtons
                    onClear={onResetFilters}
                    onSearch={onClose}
                    isClearDisabled={!hasActiveFilters}
                />
            </FilterSelectionsProvider>
        )
    },
)

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: 20,
    },
})
