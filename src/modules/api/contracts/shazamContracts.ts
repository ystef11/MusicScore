import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TShazamSearchDto, TShazamSearchParamsDto, TShazamTokenDto } from '../dto/shazamDto'

import { defineContract } from './defineContract'

/** Both endpoints need the attestation token (422 `DEVICE_ATTESTATION_FAILED`) and are rate limited. */
export const shazamContracts = {
    token: defineContract.get<TShazamTokenDto>(apiEndpoints.shazamToken, { version: null }),
    /** Header-paginated; cascades song → artist → empty unless `mode` pins the artist fallback. */
    search: defineContract.get<TShazamSearchDto, TShazamSearchParamsDto>(
        apiEndpoints.shazamSearch,
        { version: '1.5', paginated: true },
    ),
}
