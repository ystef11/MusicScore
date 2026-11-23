import { getStoreValue } from '@mu-native/common'
import { searchStoreChunk } from '@mu-native/search'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'

type TSuggestionSelectedParams = {
    /** Raw input text at the moment of the tap, untrimmed */
    prefixAtTap: string
    /** How many suggestions were shown in the list at the moment of the tap */
    shownSize: number
    /** 1-based position of the tapped suggestion — the MRR contract with analytics */
    tappedIndex: number
    /** Text the results screen opens with (the trimmed suggestion) */
    finalText: string
}

// Must be called after searchStoreChunk.actions.setSearchTerm(finalText) has
// dispatched: the search_query_id is minted there, and this event has to carry
// the same id as the Search Browse Results View it leads to — the id is the
// only link in the "suggestion → results → click" funnel.
export const reportSuggestionSelected = ({
    prefixAtTap,
    shownSize,
    tappedIndex,
    finalText,
}: TSuggestionSelectedParams) => {
    reportEvent(MetricaEvents.SEARCH_SUGGESTION_SELECTED, {
        search_type: 'search',
        search_session_text: finalText,
        search_query_id: getStoreValue(searchStoreChunk.props.getSearchQueryId),
        // Unknown keys are packed into params.key/value/str_value by packCustomParams.
        suggest_prefix_at_tap: prefixAtTap,
        suggest_shown_size: shownSize,
        suggest_tapped_index: tappedIndex,
    })
}
