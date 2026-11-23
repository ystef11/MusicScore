import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { THubInfoDto, THubListDto, THubScoresDto, THubSubscriptionDto } from '../dto/hubDto'

import { defineContract } from './defineContract'

export const hubContracts = {
    /** Every mobile hub, visible or not; the client filters on `visible`. */
    list: defineContract.get<THubListDto>(apiEndpoints.hubList, { version: null }),
    info: defineContract.get<THubInfoDto, { hub_id: number }>(apiEndpoints.hubInfo, {
        version: '1.1',
    }),
    /**
     * Scores of a hub, most viewed first, 20 per page with the pagination in `_meta`.
     * The special hubs (popular 111, selected for you 538) go through here too.
     */
    scores: defineContract.get<THubScoresDto, { hub_id: number | string; page: number }>(
        apiEndpoints.hubScores,
        { version: '1.2' },
    ),
    /** Idempotent: following an already followed hub is a no-op. */
    subscribe: defineContract.post<THubSubscriptionDto, { hub_id: number }>(
        apiEndpoints.hubSubscription,
        { version: '1.1' },
    ),
    unsubscribe: defineContract.delete<THubSubscriptionDto, { hub_id: number }>(
        apiEndpoints.hubSubscription,
        { version: '1.1' },
    ),
}
