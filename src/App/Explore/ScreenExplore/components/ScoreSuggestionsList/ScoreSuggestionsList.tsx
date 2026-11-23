import { searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

import { NewScoreSuggestionsList } from './NewScoreSuggestionsList.tsx'

export const ScoreSuggestionsList = () => {
    const [isSearchFocused] = useValues([searchStoreChunk.props.getIsSearchInputFocused])

    if (!isSearchFocused) return null
    return <NewScoreSuggestionsList />
}
