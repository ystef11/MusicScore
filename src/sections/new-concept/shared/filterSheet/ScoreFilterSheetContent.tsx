import { memo, useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { getStoreValue } from '@mu-native/common'
import { platform } from '@mu-native/common/constants/platform'
import { AppText, IconSource, layout } from '@mu-native/ds'
import { electricGuitar } from '@mu-native/icons/electricGuitar'
import { piano } from '@mu-native/icons/piano'
import { reedSax } from '@mu-native/icons/reedSax'
import { string as stringInstrument } from '@mu-native/icons/string'
import { vocal } from '@mu-native/icons/vocal'
import { woodwind } from '@mu-native/icons/woodwind'
import { translate } from '@mu-native/locale'
import {
    FilterItemGroupContainer,
    FilterSelectionsProvider,
    FilterSelectionsSource,
    FilterSheetBottomButtons,
    searchStoreChunk,
    type TFilterItem,
    type TRenderFilters,
    type TSelectableFilterKey,
} from '@mu-native/search'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import { screenExploreThunks } from '../../../../App/Explore/ScreenExplore/thunks/thunks'
import reportEvent from '../../../../App/Utils/Analytics'

import { FilterChipsSection } from './FilterChipsSection'
import { FilterExpanderToggle } from './FilterExpanderToggle'
import { FilterSheetSection } from './FilterSheetSection'
import { InstrumentTilesGrid, TInstrumentTile } from './InstrumentTilesGrid'

type TSearchThunk = (
    chunk: TUniversalScoreListDynamicStoreChunk,
    searchTerm: string,
) => (dispatch: any, getState?: any) => Promise<unknown> | unknown

type TGroupSelection = { filterKey: TSelectableFilterKey; id: TFilterItem['id'] | null }

type Props = {
    onClose: () => void
    storeChunk: TUniversalScoreListDynamicStoreChunk
    filters: TRenderFilters | undefined
    selections: FilterSelectionsSource
    onSearch?: TSearchThunk
}

const capitalizeFirst = (text: string): string =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

// The instruments highlighted as icon tiles, in design order. Tiles render only
// for instruments actually present in the catalog.
const FEATURED_INSTRUMENTS: { getLabel: () => string; match: string; icon: IconSource }[] = [
    { getLabel: () => translate('native.instrument.piano'), match: 'piano', icon: piano },
    {
        getLabel: () => translate('native.instrument.violin'),
        match: 'violin',
        icon: stringInstrument,
    },
    {
        getLabel: () => translate('native.instrument.saxophone'),
        match: 'saxophone alto',
        icon: reedSax,
    },
    {
        getLabel: () => translate('native.instrument.guitar'),
        match: 'guitar',
        icon: electricGuitar,
    },
    { getLabel: () => translate('native.instrument.flute'), match: 'flute', icon: woodwind },
    { getLabel: () => translate('native.instrument.voice'), match: 'vocals', icon: vocal },
]

const flattenInstrumentItems = (items: TFilterItem[] | undefined): TFilterItem[] =>
    (items ?? []).flatMap(item => [item, ...flattenInstrumentItems(item.children)])

const matchesWord = (name: string, word: string) =>
    name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .includes(word)

export const ScoreFilterSheetContent = memo(
    ({ onClose, storeChunk, filters, selections, onSearch }: Props) => {
        const [isInstrumentsExpanded, setIsInstrumentsExpanded] = useState(false)

        const [isLoading, selectedFilters, selectedFiltersQuantity] = useValues([
            storeChunk.props.getIsLoading,
            selections.getSelectedFilters,
            selections.getSelectedFiltersQuantity,
        ])

        const actions = useActions({
            setSelectedFilter: selections.setSelectedFilter,
            clearSelectedFilters: selections.clearSelectedFilters,
            resetFilters: selections.resetAllSelectedFilters,
            onSelectFilter: onSearch ?? screenExploreThunks.search,
        })

        const triggerSearch = useCallback(() => {
            const value = getStoreValue(searchStoreChunk.props.getSearchTerm)
            actions.onSelectFilter(storeChunk, value)
        }, [actions, storeChunk])

        const onToggleItem = useCallback(
            (filterKey: TSelectableFilterKey, itemId: TFilterItem['id']) => {
                if (isLoading) return
                actions.setSelectedFilter({ filterKey, itemId })
                triggerSearch()
            },
            [isLoading, actions, triggerSearch],
        )

        const onItemGroupPress = useCallback(
            (groupSelections: TGroupSelection[]) => {
                groupSelections.forEach(({ filterKey, id }) => {
                    if (id === null) {
                        actions.clearSelectedFilters(filterKey)
                    } else {
                        actions.setSelectedFilter({ filterKey, itemId: id })
                    }
                })
                triggerSearch()
            },
            [actions, triggerSearch],
        )

        const onResetFilters = useCallback(() => {
            actions.resetFilters()
            triggerSearch()
            reportEvent(MetricaEvents.SEARCH_FILTERS_RESET, { ui: 'scores' })
        }, [actions, triggerSearch])

        const instrumentSection = filters?.instrument
        const instrumentTiles = useMemo<TInstrumentTile[]>(() => {
            const flattened = flattenInstrumentItems(instrumentSection?.items)
            return FEATURED_INSTRUMENTS.flatMap(({ getLabel, match, icon }) => {
                // Prefer the exact catalog item; otherwise the tile controls the
                // whole family (e.g. "Saxophone" → Alto/Tenor/… Saxophone).
                const exact = flattened.filter(
                    candidate => candidate.name.trim().toLowerCase() === match,
                )
                const family = exact.length
                    ? exact
                    : flattened.filter(candidate => matchesWord(candidate.name, match))
                if (!family.length) return []
                const itemIds = family.map(item => item.id)
                return [
                    {
                        label: getLabel(),
                        icon,
                        itemIds,
                        isSelected: itemIds.some(id => !!selectedFilters?.instrument?.[id]),
                    },
                ]
            })
        }, [instrumentSection, selectedFilters])

        const onToggleInstrumentTile = useCallback(
            (tile: TInstrumentTile) => {
                if (isLoading) return
                const nextValue = !tile.isSelected
                tile.itemIds.forEach(itemId =>
                    actions.setSelectedFilter({
                        filterKey: 'instrument',
                        itemId,
                        value: nextValue,
                    }),
                )
                triggerSearch()
            },
            [isLoading, actions, triggerSearch],
        )

        const hasActiveFilters = selectedFiltersQuantity > 0

        return (
            <FilterSelectionsProvider source={selections}>
                <ScrollView
                    testID={scoreTestIds.filtersModal}
                    contentContainerStyle={styles.contentContainer}
                >
                    <AppText
                        font="f32w400Accent"
                        rawText={translate('native.new_concept.common.filters')}
                        style={styles.title}
                    />
                    {!!instrumentTiles.length && (
                        <FilterSheetSection title={translate('native.filter_screen.instruments')}>
                            <InstrumentTilesGrid
                                tiles={instrumentTiles}
                                onToggle={onToggleInstrumentTile}
                            />
                            {isInstrumentsExpanded && (
                                <View style={styles.hierarchyList}>
                                    {instrumentSection?.items?.map(item =>
                                        item.children?.length ? (
                                            <FilterItemGroupContainer
                                                key={`${item.name}_group`}
                                                filterKey="instrument"
                                                filterItem={item}
                                                onItemPress={onItemGroupPress}
                                                nestingLevel={1}
                                                avoidSorting
                                            />
                                        ) : null,
                                    )}
                                </View>
                            )}
                            <FilterExpanderToggle
                                label={translate('native.new_concept.filter_sheet.all_instruments')}
                                isExpanded={isInstrumentsExpanded}
                                onToggle={setIsInstrumentsExpanded}
                            />
                        </FilterSheetSection>
                    )}
                    <FilterChipsSection
                        title={translate('native.sorting_type.difficulty_level')}
                        section={filters?.complexity}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                    />
                    <FilterChipsSection
                        title={translate('native.filter_screen.ensemble')}
                        section={filters?.instrumentation}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                        allChipLabel={translate('native.new_concept.filter_sheet.all_ensembles')}
                        collapsedCount={5}
                        expanderLabel={translate('native.new_concept.filter_sheet.all_ensembles')}
                    />
                    <FilterChipsSection
                        title={translate('native.filter_screen.genre')}
                        section={filters?.genres}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                        collapsedCount={5}
                        expanderLabel={translate('native.new_concept.filter_sheet.all_genres')}
                        formatName={capitalizeFirst}
                    />
                    <FilterChipsSection
                        title={translate('native.sorting_type.score_type')}
                        section={filters?.type}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                    />
                    <FilterChipsSection
                        title={translate('native.filter_screen.status')}
                        section={filters?.recordingType}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                    />
                    <FilterChipsSection
                        title={translate('native.filter_screen.format')}
                        section={filters?.scoreFormat}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                    />
                    <FilterChipsSection
                        title={translate('native.filter_screen.license')}
                        section={filters?.license}
                        selectedFilters={selectedFilters}
                        onToggleItem={onToggleItem}
                        onItemGroupPress={onItemGroupPress}
                    />
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
        paddingHorizontal: layout.baseMarginFromEdges,
        width: '100%',
        maxWidth: platform.isTablet ? layout.maxTabletWidth : undefined,
        alignSelf: 'center',
    },
    title: {
        marginTop: layout.marginSm,
    },
    hierarchyList: {
        marginTop: layout.marginXs,
    },
})
