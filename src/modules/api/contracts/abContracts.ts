import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TAbExperimentsDto, TAbSetVariationPayloadDto } from '../dto/abDto'

import { defineContract } from './defineContract'

export const abContracts = {
    /** Without the API key: it runs before the app has a server time to sign one. */
    experiments: defineContract.get<TAbExperimentsDto>(apiEndpoints.abTest, { version: null }),
    /** Pin a variation; sent with the `x-mu-client-time*` headers. */
    setVariation: defineContract.post<unknown, TAbSetVariationPayloadDto>(apiEndpoints.abTest, {
        version: null,
    }),
}
