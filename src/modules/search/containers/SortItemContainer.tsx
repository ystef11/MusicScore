import { memo, useCallback } from 'react'

import { FilterSortItem } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { useFilterSelections } from '../contexts/FilterSelectionsContext'
import { TCommonRenderSort } from '../types/searchTypes'

type Props = {
    onSelectFilter?: () => void
    isLoading?: boolean
    sortSection?: TCommonRenderSort
}

export const SortItemContainer = memo(({ sortSection, onSelectFilter, isLoading }: Props) => {
    const source = useFilterSelections()
    const [selectedSort] = useValues([source.getSelectedSort])

    const actions = useActions({
        setSelectedSort: source.setSelectedSort,
    })

    const onPress = useCallback(
        async (itemId: string) => {
            if (isLoading) return
            actions.setSelectedSort(itemId)
            onSelectFilter?.()
        },
        [isLoading, actions, onSelectFilter],
    )

    if (!sortSection) return null

    return (
        <>
            {sortSection.map(sortItem => {
                return (
                    <FilterSortItem
                        key={sortItem.id}
                        onPress={onPress}
                        name={sortItem.name}
                        id={sortItem.id}
                        isSelected={selectedSort === sortItem.id}
                    />
                )
            })}
        </>
    )
})
