import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TSearchSuggestionsDto } from '../dto/screenDto'

import { defineContract } from './defineContract'

export const searchContracts = {
    /**
     * Typeahead for the score search field. Needs a device-attestation `f` token, which the API
     * transport attaches; without a valid one the backend answers 422 `DEVICE_ATTESTATION_FAILED`.
     * The query is truncated server-side at 64 characters.
     */
    suggestScores: defineContract.get<TSearchSuggestionsDto, { q: string }>(
        apiEndpoints.searchSuggestScores,
        { version: '1.5' },
    ),
}
