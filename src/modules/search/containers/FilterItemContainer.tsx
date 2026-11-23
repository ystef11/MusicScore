import { memo, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { useActions, useValues } from '@ug/store'

import { FilterItem } from '../components/FilterItem/FilterItem'
import { filterTitlesMap } from '../constants/titlesMap'
import { useFilterSelections } from '../contexts/FilterSelectionsContext'
import { ShowMoreButton } from '../elements/ShowMoreButton.tsx'
import { TFilterItem, TRenderFilterSection, TSelectableFilterKey } from '../types/searchTypes'

import { FilterItemGroupContainer } from './FilterItemGroupContainer.tsx'

type Props = {
    filterSection: TRenderFilterSection
    onSelectFilter?: () => void
    isLoading?: boolean
    hideCount?: boolean
}

export const FilterItemContainer = memo(
    ({ filterSection, onSelectFilter, isLoading, hideCount = false }: Props) => {
        const source = useFilterSelections()
        const [selectedFilters] = useValues([source.getSelectedFilters])

        const actions = useActions({
            setSelectedFilters: source.setSelectedFilter,
            clearSelectedFilters: source.clearSelectedFilters,
        })

        const onPress = useCallback(
            (filterKey: TSelectableFilterKey, id: TFilterItem['id']) => {
                if (isLoading) return
                actions.setSelectedFilters({ filterKey, itemId: id })
                onSelectFilter?.()
            },
            [isLoading, actions, onSelectFilter],
        )

        const onItemGroupPress = useCallback(
            (selections: { filterKey: TSelectableFilterKey; id: TFilterItem['id'] | null }[]) => {
                selections.forEach(({ filterKey, id }) => {
                    if (id === null) {
                        actions.clearSelectedFilters(filterKey)
                    } else {
                        actions.setSelectedFilters({
                            filterKey,
                            itemId: id,
                        })
                    }
                })
                onSelectFilter?.()
            },
            [actions, onSelectFilter],
        )

        // Preserve instruments filter fetched from API. Sort all other filters in scope of the experiment
        const avoidSorting = filterSection?.filterKey === 'instrument'
        const sectionItems = useMemo(() => filterSection.items ?? [], [filterSection])
        const sortedItems = useMemo(() => {
            const copy = sectionItems
            if (!avoidSorting) {
                copy.sort((a, b) => b.count - a.count)
            }
            return copy
        }, [avoidSorting, sectionItems])

        const isExpandable = sortedItems.length > 5
        const [showFullList, setShowFullList] = useState(!isExpandable)

        if (!filterSection) return null
        if (filterSection?.filterKey === 'quickFilters') return null

        const items = sortedItems.slice(0, showFullList ? undefined : 5).filter(Boolean)

        const onToggleExpand = () => setShowFullList(value => !value)

        // Get section title for testID
        const sectionTitle = filterTitlesMap[filterSection?.filterKey] || filterSection.filterKey

        return (
            <View>
                {items.map(filter => {
                    if (filter.children?.length) {
                        return (
                            <FilterItemGroupContainer
                                filterKey={filterSection.filterKey}
                                key={`${filter.name}_level1`}
                                filterItem={filter}
                                onItemPress={onItemGroupPress}
                                nestingLevel={1}
                                avoidSorting={avoidSorting}
                            />
                        )
                    }
                    const filterKey = filter.overrideFilterKey ?? filterSection?.filterKey
                    return (
                        <FilterItem
                            id={filter.id as any}
                            filterKey={filterKey ?? ''}
                            sectionTitle={sectionTitle}
                            key={filter.id}
                            name={filter.name}
                            count={filter.count}
                            hideCount={hideCount}
                            onPress={onPress}
                            isSelected={!!selectedFilters?.[filterKey]?.[filter.id]}
                            disabled={filter.disabled}
                        />
                    )
                })}
                {isExpandable && (
                    <ShowMoreButton
                        testID={scoreTestIds.filterShowMoreId(sectionTitle)}
                        onPress={onToggleExpand}
                        expanded={showFullList}
                    />
                )}
            </View>
        )
    },
)
