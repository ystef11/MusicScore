import { memo, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { FilterItem } from '../components/FilterItem/FilterItem.tsx'
import { FilterItemGroupTitle } from '../components/FilterItemGroup/FilterItemGroupTitle.tsx'
import { useFilterSelections } from '../contexts/FilterSelectionsContext'
import { formatShortNumber } from '../helpers/common.ts'
import { localizeFilterOptionName } from '../helpers/localizeFilterOptionName'
import { TFilterItem, TFilterKey, TSelectableFilterKey } from '../types/searchTypes'

type Props = {
    filterKey: TFilterKey
    filterItem: TFilterItem
    onItemPress: (
        selections: { filterKey: TSelectableFilterKey; id: TFilterItem['id'] | null }[],
    ) => void
    isLoading?: boolean
    nestingLevel: 1 | 2
    avoidSorting?: boolean
}

const canSelectAll = (
    filterKey: TSelectableFilterKey,
): filterKey is 'instrument' | 'instrumentation' =>
    filterKey === 'instrument' || filterKey === 'instrumentation'

export const FilterItemGroupContainer = memo(
    ({
        filterKey,
        filterItem,
        onItemPress,
        isLoading,
        nestingLevel,
        avoidSorting = false,
    }: Props) => {
        const source = useFilterSelections()
        const [selectedFilters] = useValues([source.getSelectedFilters])

        const hasSelectedChildren = !!filterItem?.children?.find(
            child => !!selectedFilters?.[filterKey]?.[child.id],
        )

        const [isExpanded, setIsExpanded] = useState(hasSelectedChildren)

        const onPress = useCallback(() => {
            if (isLoading) return

            setIsExpanded(value => !value)
        }, [isLoading])

        const isAllSelected = canSelectAll(filterKey)
            ? !!selectedFilters?.[`${filterKey}_any[]`]?.[filterItem.id]
            : false

        const sortedChildren = useMemo(() => {
            if (!filterItem?.children) {
                return []
            }
            const hasGrandchildren = filterItem.children.every(item => item.children)
            if (hasGrandchildren) {
                const copy = [...filterItem.children]
                if (!avoidSorting) {
                    copy.sort((a, b) => b.count - a.count)
                }
                return copy
            }

            const copy: TFilterItem[] = [
                {
                    id: filterItem.id,
                    name: translate('native.filter_screen.select_all'),
                    count: filterItem.count,
                },
                ...(isAllSelected ? [] : filterItem.children),
            ]
            if (!avoidSorting) {
                copy.sort((a, b) => b.count - a.count)
            }
            return copy
        }, [filterItem, isAllSelected, avoidSorting])

        const handlePress = useCallback(
            (filterKey: TSelectableFilterKey, id: TFilterItem['id']) => {
                if (id === filterItem.id && canSelectAll(filterKey)) {
                    onItemPress([
                        {
                            // Clear other current selection in the group
                            filterKey,
                            id: null,
                        },
                        {
                            filterKey: `${filterKey}_any[]`,
                            id: isAllSelected ? null : filterItem.id,
                        },
                    ])
                    return
                }

                const selections: { filterKey: TSelectableFilterKey; id: string | null }[] = [
                    { filterKey, id },
                ]

                if (isAllSelected && canSelectAll(filterKey)) {
                    // Reset Select All group when any of its children changes its state
                    selections.push({
                        filterKey: `${filterKey}_any[]`,
                        id: null,
                    })
                }

                onItemPress(selections)
            },
            [isAllSelected, onItemPress, filterItem.id],
        )

        if (!filterItem) return null

        return (
            <View>
                <FilterItemGroupTitle
                    title={localizeFilterOptionName(filterItem.name, filterKey)}
                    isExpanded={isExpanded}
                    onPress={onPress}
                    key={filterItem.name}
                    count={filterItem.count ? formatShortNumber(filterItem.count) : undefined}
                    nestingLevel={nestingLevel > 1 ? 1 : 0}
                    testID={scoreTestIds.filterGroupId(filterItem.name)}
                />
                {isExpanded &&
                    sortedChildren.map(item => {
                        if (item.children?.length) {
                            return (
                                <FilterItemGroupContainer
                                    filterKey={filterKey}
                                    key={`${item.name}_level2`}
                                    filterItem={item}
                                    onItemPress={onItemPress}
                                    nestingLevel={2}
                                />
                            )
                        }
                        const isSelected =
                            isAllSelected || !!selectedFilters?.[filterKey]?.[item.id]
                        return (
                            <FilterItem
                                key={item.id}
                                onPress={handlePress}
                                filterKey={filterKey}
                                name={item.name}
                                id={item.id}
                                count={item.count}
                                hideCount={item.id === filterItem.id}
                                isSelected={isSelected}
                                nestingLevel={nestingLevel}
                            />
                        )
                    })}
            </View>
        )
    },
)
