import { RefObject, useEffect } from 'react'

import {
    resolveSelectedFilterEntries,
    searchStoreChunk,
    type TRenderFilters,
    type TSelectedFilters,
} from '@mu-native/search'
import { useActions } from '@ug/store'

type TParams = {
    searchTerm: string
    filterParams: TRenderFilters | undefined
    selectedFilters: TSelectedFilters | null
    /** Recording starts only after the initial filter seeding has happened. */
    enabledRef: RefObject<boolean>
}

// Keeps the recent-search entry for the active query in sync with the filters
// the user ends up applying during the search session.
export const useRecentSearchRecorder = ({
    searchTerm,
    filterParams,
    selectedFilters,
    enabledRef,
}: TParams) => {
    const actions = useActions({ addRecentSearch: searchStoreChunk.actions.addRecentSearch })

    useEffect(() => {
        if (!enabledRef.current || !filterParams || !searchTerm) return
        actions.addRecentSearch({
            query: searchTerm,
            filters: resolveSelectedFilterEntries(filterParams, selectedFilters),
        })
    }, [actions, enabledRef, filterParams, selectedFilters, searchTerm])
}
