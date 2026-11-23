import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TCommonHelloDto, TDashboardSectionsDto } from '../dto/commonDto'

import { defineContract } from './defineContract'

export const commonContracts = {
    /** Bootstrap: server time, feature switches and the trending search block. Tokenless. */
    hello: defineContract.get<TCommonHelloDto>(apiEndpoints.commonHello, { version: null }),
    /** Ordered Home sections for this client; the app renders the ones it knows. */
    dashboardSections: defineContract.get<TDashboardSectionsDto>(apiEndpoints.dashboardSection, {
        version: null,
    }),
}
