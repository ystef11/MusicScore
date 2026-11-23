import { memo, useCallback, useState } from 'react'

import { scoreTestIds } from '@mu/mu-mobile-test-id'

import { FilterSection } from '../components/FilterSection/FilterSection'
import { filterTitlesMap } from '../constants/titlesMap'
import { TRenderFilterSection } from '../types/searchTypes'

import { FilterItemContainer } from './FilterItemContainer'

type Props = {
    filterSection: TRenderFilterSection | undefined
    isChevronHidden?: boolean
    keepExpanded?: boolean
    onSelectFilter?: () => void
    onExpandSection?: ({
        filterKey,
        isExpanded,
    }: {
        filterKey: string
        isExpanded: boolean
    }) => void
    isLoading?: boolean
}

export const FilterSectionContainer = memo(
    ({
        filterSection,
        isChevronHidden = false,
        keepExpanded = false,
        onSelectFilter,
        isLoading,
        onExpandSection,
    }: Props) => {
        const [isExpanded, setIsExpanded] = useState(keepExpanded || isChevronHidden)

        const onSectionPress = useCallback(() => {
            setIsExpanded(prevState => {
                onExpandSection?.({
                    filterKey: filterSection?.filterKey || '',
                    isExpanded: !prevState,
                })
                return !prevState
            })
        }, [filterSection?.filterKey, onExpandSection])

        if (!filterSection?.items?.length) return null
        if (filterSection.filterKey === 'quickFilters') return null

        const sectionTitle = filterTitlesMap[filterSection?.filterKey] || filterSection.filterKey

        return (
            <FilterSection
                testID={scoreTestIds.filterSectionId(sectionTitle)}
                title={sectionTitle}
                isExpanded={isExpanded}
                onSectionPress={onSectionPress}
                isChevronHidden={isChevronHidden}
                isLoading={isLoading}
            >
                <FilterItemContainer
                    filterSection={filterSection}
                    onSelectFilter={onSelectFilter}
                    isLoading={isLoading}
                    hideCount={filterSection?.hideCount}
                />
            </FilterSection>
        )
    },
)
