import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TArtistInfoDto } from '../dto/artistDto'

import { defineContract } from './defineContract'

export const artistContracts = {
    /** 404 for an unknown id and for an "origin" artist (a user's own name). */
    info: defineContract.get<TArtistInfoDto, { id: number }>(apiEndpoints.artistInfo, {
        version: null,
    }),
}
