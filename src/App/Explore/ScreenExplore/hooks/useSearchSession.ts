import { useEffect, useMemo, useRef } from 'react'

import { useDidUpdate } from '@mu-native/common'
import { Screen, navigationThunks, useNavigation } from '@mu-native/navigation'
import { getFlattenedSelectedFilters, searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import { exploreScoreListStoreChunk } from '../../exploreScoreListStoreChunk.ts'

type TPreviousData = {
    searchTerm: string
}

export const useSearchSession = () => {
    const prevData = useRef<TPreviousData | null>(null)

    const [searchTotalResults, searchTerm, filtersApplied, searchSession] =
        useValues([
            exploreScoreListStoreChunk.props.getTotalItems,
            searchStoreChunk.props.getSearchTerm,
            getFlattenedSelectedFilters,
            searchStoreChunk.props.getSearchSession,
        ])

    const actions = useActions({
        setScreen: navigationThunks.setScreen,
        setSearchTerm: searchStoreChunk.actions.setSearchTerm,
    })

    useEffect(() => {
        if (searchSession?.id) {
            reportEvent(MetricaEvents.SEARCH_SESSION_START, {
                search_type: searchTerm ? 'search' : 'browse',
                search_filters_group: filtersApplied.map(filter => filter.key),
                search_filters: filtersApplied.map(filter => `${filter.value}`),
            })
        }
    }, [searchSession?.id])

    useEffect(() => {
        // Always start with browse main screen. Call setSearchTerm to create new browse session.
        actions.setSearchTerm('')
        actions.setScreen(Screen.browseMain)
        reportEvent(MetricaEvents.BROWSE_MAIN_VIEW)
    }, [])

    useDidUpdate(() => {
        if (!prevData.current) {
            prevData.current = {
                searchTerm,
            }
            return
        }

        if (prevData.current?.searchTerm !== searchTerm) {
            if (searchTerm) {
                actions.setScreen('SearchMain')
                reportEvent(MetricaEvents.SEARCH_MAIN_VIEW)
            } else {
                actions.setScreen(Screen.browseMain)
                reportEvent(MetricaEvents.BROWSE_MAIN_VIEW)
            }
            reportEvent(MetricaEvents.VIEW_PAGE)
        }

        prevData.current = {
            searchTerm,
        }
    }, [searchTerm, searchTotalResults])
}
