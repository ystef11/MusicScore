import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TDeeplinkMobileDto, TDeeplinkMobileParamsDto } from '../dto/analyticsDto'

import { defineContract } from './defineContract'

export const deeplinkContracts = {
    /** Deferred deep links for a fresh install, matched by device fingerprint; consumed on read. */
    mobile: defineContract.get<TDeeplinkMobileDto, TDeeplinkMobileParamsDto>(
        apiEndpoints.deeplinkData,
        { version: null },
    ),
}
