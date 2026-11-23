import { useEffect } from 'react'

import { getFlattenedSelectedFilters, searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'

export const useSearchSessionReporter = () => {
    const [searchTerm, filtersApplied, searchSession] = useValues([
        searchStoreChunk.props.getSearchTerm,
        getFlattenedSelectedFilters,
        searchStoreChunk.props.getSearchSession,
    ])

    const actions = useActions({ setSearchTerm: searchStoreChunk.actions.setSearchTerm })

    useEffect(() => {
        actions.setSearchTerm('')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (searchSession?.id) {
            reportEvent(MetricaEvents.SEARCH_SESSION_START, {
                search_type: searchTerm ? 'search' : 'browse',
                search_filters_group: filtersApplied.map(filter => filter.key),
                search_filters: filtersApplied.map(filter => `${filter.value}`),
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchSession?.id])
}
