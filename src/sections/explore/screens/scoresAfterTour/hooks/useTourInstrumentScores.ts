import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { store } from '@mu-native/common'
import { getFirstTourInstrument, getFirstTourLevel } from '@mu-native/quiz'
import {
    getComplexityFilterIdByTourLevel,
    getFiltersAsQueryParams,
    getInstrumentFilterIdByTourValue,
    getSortAsQueryParams,
    searchStoreChunk,
    type TFilterItem,
} from '@mu-native/search'
import { useValues } from '@ug/store'
import debounce from 'lodash.debounce'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import { performSearch } from '../../../../../App/Services/SearchProvider.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'

const RECOMMENDATIONS_COUNT = 3
const SEARCH_DEBOUNCE_MS = 300

const buildSearchOptions = (searchText: string, instrumentId?: string, complexityId?: string) => {
    const state = store.getState()
    const filters = { ...getFiltersAsQueryParams(state) }

    if (instrumentId) {
        filters.instrument = instrumentId
    }

    if (complexityId) {
        filters.complexity = complexityId
    }

    const sortParams = getSortAsQueryParams(state)

    return {
        ...filters,
        ...sortParams,
        text: searchText,
        page: 1,
        sort: sortParams.sort || 'relevance',
        // Официальные скоры платные и в подборке после тура не нужны.
        type: 'non-official',
    }
}

const searchWithFallback = async (
    searchText: string,
    instrumentId: string | undefined,
    complexityId: string | undefined,
    isStale: () => boolean,
) => {
    const firstSearch = await performSearch(
        buildSearchOptions(searchText, instrumentId, complexityId),
    )

    if (!firstSearch || firstSearch?.scores.length > 0 || isStale()) return firstSearch

    if (instrumentId && complexityId) {
        const byInstrument = await performSearch(buildSearchOptions(searchText, instrumentId))

        if (!byInstrument || byInstrument.scores.length > 0 || isStale()) return byInstrument
    }

    if (!instrumentId && !complexityId) return firstSearch

    return performSearch(buildSearchOptions(searchText))
}

export const useTourInstrumentScores = (searchTerm: string, goBack: () => void) => {
    const [firstTourInstrument, firstTourLevel, filterParams] = useValues([
        getFirstTourInstrument,
        getFirstTourLevel,
        searchStoreChunk.props.getFilterParams,
    ])
    const [scores, setScores] = useState<MSScoreT[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [debouncedTerm, setDebouncedTerm] = useState('')
    const requestIdRef = useRef(0)
    const reportedTermRef = useRef('')

    const debouncedSetTerm = useMemo(() => debounce(setDebouncedTerm, SEARCH_DEBOUNCE_MS), [])

    useEffect(() => {
        debouncedSetTerm(searchTerm.trim())
    }, [searchTerm, debouncedSetTerm])

    useEffect(() => () => debouncedSetTerm.cancel(), [debouncedSetTerm])

    const fetchScores = useCallback(async () => {
        const requestId = ++requestIdRef.current
        setIsLoading(true)

        try {
            const instrumentsData = filterParams?.instrument?.items?.reduce(
                (acc, item) => [...acc, ...(item.children ? item.children : [])],
                [] as TFilterItem[],
            )

            const instrumentId = getInstrumentFilterIdByTourValue(
                instrumentsData,
                firstTourInstrument,
            )

            const complexityId = getComplexityFilterIdByTourLevel(
                filterParams?.complexity?.items,
                firstTourLevel,
            )

            const response = await searchWithFallback(
                debouncedTerm,
                instrumentId,
                complexityId,
                () => requestId !== requestIdRef.current,
            )

            if (requestId !== requestIdRef.current) return

            const resultScores = response?.scores ?? []

            setScores(debouncedTerm ? resultScores : resultScores.slice(0, RECOMMENDATIONS_COUNT))

            if (debouncedTerm && debouncedTerm !== reportedTermRef.current) {
                reportedTermRef.current = debouncedTerm

                reportEvent(MetricaEvents.FIRST_SESSION_MODAL_SEARCH, { text: debouncedTerm })

                if (response && resultScores.length === 0) {
                    reportEvent(MetricaEvents.FIRST_SESSION_MODAL_SEARCH_EMPTY, {
                        text: debouncedTerm,
                    })
                }
            }
        } finally {
            if (requestId === requestIdRef.current) setIsLoading(false)
        }
    }, [firstTourInstrument, firstTourLevel, filterParams, debouncedTerm])

    useEffect(() => {
        if (firstTourInstrument && filterParams) fetchScores()
        else goBack()
    }, [firstTourInstrument, firstTourLevel, filterParams, debouncedTerm])

    return {
        scores,
        isLoading,
        firstTourInstrument,
    }
}
