import { searchStoreChunk } from '@mu-native/search'

import MetricaEvents from '../../constants/MetricaEvents'
import reportEvent from '../../Utils/Analytics'

import { fetchSuggestions } from './searchService'

export function requestSuggestions(searchText: string) {
    return async (dispatch: (...args: Array<any>) => any) => {
        if (!searchText) {
            dispatch(searchStoreChunk.actions.setSuggestions([]))
        } else {
            const value = searchText.trim()
            const suggestions = await fetchSuggestions(value)
            reportEvent(MetricaEvents.BROWSE_SUGGESTION_REQUEST, {
                value,
            })
            dispatch(searchStoreChunk.actions.setSuggestions(suggestions))
        }
    }
}
