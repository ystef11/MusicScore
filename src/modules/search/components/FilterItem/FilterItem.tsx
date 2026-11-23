import { memo } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { FilterItemCheck } from '@mu-native/ds'

import { formatShortNumber } from '../../helpers/common'
import { localizeFilterOptionName } from '../../helpers/localizeFilterOptionName'
import { TFilterItem, TSelectableFilterKey } from '../../types/searchTypes'

type Props = {
    onPress: (filterKey: TSelectableFilterKey, id: TFilterItem['id']) => void
    isSelected?: boolean
    nestingLevel?: 0 | 1 | 2
    disabled?: boolean
    hideCount?: boolean
    filterKey: TSelectableFilterKey
    sectionTitle?: string // Added section title for testID
    name: TFilterItem['name']
    count?: TFilterItem['count']
    id: TFilterItem['id']
}

export const FilterItem = memo(
    ({
        filterKey,
        sectionTitle,
        id,
        name,
        count,
        onPress,
        isSelected = false,
        nestingLevel = 0,
        disabled = false,
        hideCount = false,
    }: Props) => {
        const handlePress = () => {
            onPress(filterKey, id)
        }

        if (count === 0) return null

        const translateFilterName = localizeFilterOptionName(name, filterKey)

        let _count: string | undefined
        if (count) {
            _count = formatShortNumber(count)
        }

        return (
            <FilterItemCheck
                testID={scoreTestIds.filterOptionId(sectionTitle || filterKey, name)}
                onPress={handlePress}
                id={filterKey}
                name={translateFilterName}
                selected={isSelected}
                count={_count}
                hideCount={hideCount}
                nestingLevel={nestingLevel}
                disabled={disabled}
            />
        )
    },
)
