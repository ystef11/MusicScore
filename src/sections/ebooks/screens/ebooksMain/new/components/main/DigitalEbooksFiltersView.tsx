import { memo, useEffect } from 'react'
import { ScrollView, StyleSheet } from 'react-native'

import { BrandAppLoader } from '@mu-native/ds'
import { FilterSheetBottomButtons } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import { DigitalEbookFilters } from '../../api/digital.ebooks.models'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { digitalEbooksStore } from '../../stores/DigitalEbooksStore'
import { DigitalBooksQuickFilters } from '../filters/DigitalBooksQuickFilters'

type TProps = {
    onDismiss: () => void
    onSearch: () => void
    onClear: () => void
}

const FiltersListView = ({
    onClear,
    onSearch,
    filters,
    isClearDisabled,
}: Omit<TProps, 'onDismiss'> & { filters: DigitalEbookFilters; isClearDisabled: boolean }) => {
    return (
        <>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <DigitalBooksQuickFilters
                    titleKey="quick"
                    type={filters.filter_types.quick}
                    filters={filters.filters.quick}
                />
                <DigitalBooksQuickFilters
                    titleKey="instrument"
                    type={filters.filter_types.instrument}
                    filters={filters.filters.instrument}
                />
                <DigitalBooksQuickFilters
                    titleKey="genre"
                    type={filters.filter_types.genre}
                    filters={filters.filters.genre}
                />
                <DigitalBooksQuickFilters
                    titleKey="sort"
                    type={filters.filter_types.sort}
                    filters={filters.filters.sort}
                />
            </ScrollView>
            <FilterSheetBottomButtons
                count={filters.total_count}
                onClear={onClear}
                onSearch={onSearch}
                isClearDisabled={isClearDisabled}
            />
        </>
    )
}

export const DigitalEbooksFiltersView = memo(({ onDismiss, onSearch, onClear }: TProps) => {
    const [filters, isLoadingFilters, hasAnySelectedFilter] = useValues([
        digitalEbooksStore.props.getFilters,
        digitalEbooksStore.props.getIsLoadingFilters,
        digitalEbooksStore.props.getHasAnySelectedFilter,
    ])
    const actions = useActions({ fetchFilters: digitalEbooksThunk.updateFilterItem })

    useEffect(() => {
        actions.fetchFilters()
    }, [])

    if (isLoadingFilters || !filters) {
        return <BrandAppLoader />
    }

    return (
        <FiltersListView
            onClear={onClear}
            onSearch={onSearch}
            filters={filters}
            isClearDisabled={!hasAnySelectedFilter}
        />
    )
})

const styles = StyleSheet.create({
    contentContainer: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
})
