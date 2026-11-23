import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TAnalyticsSessionDto } from '../dto/abDto'
import type {
    TAnalyticsTrackerDto,
    TAppsFlyerLinkDto,
    TAppsFlyerLinkPayloadDto,
} from '../dto/analyticsDto'

import { defineContract } from './defineContract'

export const analyticsContracts = {
    /** Bootstrap of the analytics client; also creates the device's payment account. */
    tracker: defineContract.get<TAnalyticsTrackerDto>(apiEndpoints.analyticsTracker, {
        version: null,
    }),
    /** Refresh the analytics session; experiments and client time travel in `x-mu-*` headers. */
    session: defineContract.post<TAnalyticsSessionDto>(apiEndpoints.analyticsSession, {
        version: null,
    }),
    /** Bind the AppsFlyer id (and advertising id) to the payment account. */
    linkAppsFlyer: defineContract.post<TAppsFlyerLinkDto, TAppsFlyerLinkPayloadDto>(
        apiEndpoints.appLinkAppsFlyer,
        { version: null },
    ),
}
