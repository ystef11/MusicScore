import { useCallback } from 'react'

import { navigationThunks } from '@mu-native/navigation'
import { searchStoreChunk } from '@mu-native/search'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import { exploreScoreListStoreChunk } from '../../exploreScoreListStoreChunk.ts'
import { screenExploreThunks } from '../thunks/thunks'

type Props = {
    scoreListChunk: TUniversalScoreListDynamicStoreChunk
}

export const useSearchInput = ({ scoreListChunk }: Props) => {
    const actions = useActions({
        setScreens: navigationThunks.setScreen,
        cancelSearch: screenExploreThunks.cancelSearch,
        search: screenExploreThunks.search,
        setIsSearchInputFocused: searchStoreChunk.actions.setIsSearchInputFocused,
        changeSuggestions: searchStoreChunk.actions.setSuggestions,
        setSearchTerm: searchStoreChunk.actions.setSearchTerm,
        clearCorrectedQuery: exploreScoreListStoreChunk.actions.setCorrectedQuery,
    })
    const [searchTerm] = useValues([searchStoreChunk.props.getSearchTerm])

    const onCancelSearch = useCallback(() => {
        console.log('[UseSearchInput.onCancelSearch]')
        reportEvent(MetricaEvents.SEARCH_CANCEL, { ui: 'scores' })

        actions.changeSuggestions([])
        actions.cancelSearch(scoreListChunk)
        actions.clearCorrectedQuery('')
    }, [actions, scoreListChunk])

    const onSearchFocus = useCallback(() => {
        reportEvent(MetricaEvents.SEARCH_FOCUS, { ui: 'scores' })
        actions.setIsSearchInputFocused(true)
    }, [actions])

    const onSearchBlur = useCallback(() => {
        actions.setIsSearchInputFocused(false)
    }, [actions])

    const onSubmitEditing = useCallback(() => {
        actions.changeSuggestions([])

        actions.search(scoreListChunk, searchTerm)
    }, [actions, searchTerm, scoreListChunk])

    return {
        onSearchFocus,
        onSearchBlur,
        onChangeText: actions.setSearchTerm,
        onCancelSearch,
        onSubmitEditing,

        searchTerm,
    }
}
