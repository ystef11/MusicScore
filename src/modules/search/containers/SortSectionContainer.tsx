import { memo } from 'react'

import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { FilterSection } from '../components/FilterSection/FilterSection'
import { searchStoreChunk } from '../store/searchStoreChunk'

import { SortItemContainer } from './SortItemContainer'

type Props = {
    isLoading?: boolean
    onSelectFilter?: () => void
}

export const SortSectionContainer = memo(({ onSelectFilter, isLoading }: Props) => {
    const [sortParams] = useValues([searchStoreChunk.props.getSortParams])
    if (!sortParams) return null

    return (
        <FilterSection
            title={translate('native.sorting.title')}
            isExpanded
            isChevronHidden
            isLoading={isLoading}
        >
            <SortItemContainer
                sortSection={sortParams}
                onSelectFilter={onSelectFilter}
                isLoading={isLoading}
            />
        </FilterSection>
    )
})
