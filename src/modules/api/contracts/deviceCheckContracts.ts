import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TAppAttestPayloadDto,
    TAppCheckPayloadDto,
    TDeviceNonceDto,
    TDeviceTokenDto,
} from '../dto/deviceCheckDto'

import { defineContract } from './defineContract'

/**
 * Device attestation. The backend answers 403 for anything it cannot verify; the app treats a
 * 403 from `verifyAppCheck` as a spent nonce and retries once before falling back to App Attest.
 */
export const deviceCheckContracts = {
    nonce: defineContract.get<TDeviceNonceDto>(apiEndpoints.appDF, { version: null }),
    /**
     * iOS fallback. 429 after 200 attempts per IP and day. Pinning v1.1 would turn a bad nonce
     * into a 422 instead of the 403 the retry logic keys on, so the contract stays unversioned.
     */
    verifyAppAttest: defineContract.post<TDeviceTokenDto, TAppAttestPayloadDto>(
        apiEndpoints.appDC2,
        { version: null },
    ),
    /** 403 carries `error_code: 'device.validation_token_outdated'` when the token or nonce expired. */
    verifyAppCheck: defineContract.post<TDeviceTokenDto, TAppCheckPayloadDto>(apiEndpoints.appDI, {
        version: null,
    }),
}
