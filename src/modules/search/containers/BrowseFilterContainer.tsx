import { memo, useCallback } from 'react'

import { KeyboardSpacer } from '@mu-native/ds'

import reportEvent from '../../../App/Utils/Analytics'
import FilterInstrumentsCount from '../components/FilterInstrumentsCount/FilterIntrumentsCount'
import { filterAnalyticsMapExpand } from '../constants/filterAnalyticsMap'
import { TFilterKey, TRenderFilters } from '../types/searchTypes'

import { FilterSectionContainer } from './FilterSectionContainer'

type Props = {
    onSelectFilter?: () => void
    isLoading?: boolean
    filters: TRenderFilters | undefined
}

function renderFilterSection({
    filters,
    sectionKey,
    onSelectFilter,
    isLoading,
    onExpandSection,
}: {
    filters: TRenderFilters | undefined
    sectionKey: TFilterKey | 'instrument_count'
    onSelectFilter?: () => void
    isLoading?: boolean
    onExpandSection: (data: { filterKey: string; isExpanded: boolean }) => void
}) {
    if (sectionKey === 'instrument_count') {
        return (
            <FilterInstrumentsCount
                key="instrument_count"
                onSelectFilter={onSelectFilter}
                isLoading={isLoading}
            />
        )
    }

    return (
        <FilterSectionContainer
            filterSection={filters?.[sectionKey]}
            key={filters?.[sectionKey]?.filterKey}
            onSelectFilter={onSelectFilter}
            isLoading={isLoading}
            keepExpanded
            isChevronHidden
            onExpandSection={onExpandSection}
        />
    )
}

export const BrowseFilterContainer = memo(({ onSelectFilter, isLoading, filters }: Props) => {
    const onExpandSection = useCallback((data: { filterKey: string; isExpanded: boolean }) => {
        if (data.isExpanded) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const event = filterAnalyticsMapExpand[data.filterKey]
            if (!event) return
            reportEvent(event)
        }
    }, [])

    if (!filters) return null

    const sections: (TFilterKey | 'instrument_count')[] = [
        'popular',
        'complexity',
        'type',
        'scoreFormat',
        'instrumentation',
        'instrument',
        'genres',
        'instrument_count',
        'recordingType',
        'license',
    ]

    return (
        <>
            {sections.map(sectionKey =>
                renderFilterSection({
                    sectionKey,
                    filters,
                    onExpandSection,
                    isLoading,
                    onSelectFilter,
                }),
            )}
            <KeyboardSpacer defaultBottomSpacing={0} openedSpacing={16} />
        </>
    )
})
