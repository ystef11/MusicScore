import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TPushTokenPayloadDto } from '../dto/analyticsDto'

import { defineContract } from './defineContract'

export const notificationContracts = {
    /** Bind the device's push token to its payment account; body is `1`. */
    pushToken: defineContract.post<1, TPushTokenPayloadDto>(apiEndpoints.notificationPushToken, {
        version: null,
    }),
}
