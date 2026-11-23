import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type { TMarketingSpecialDto, TSaleOfferDto } from '../dto/marketingDto'

import { defineContract } from './defineContract'

/** Seasonal decor only; the purchase and billing endpoints are not migrated yet. */
export const marketingContracts = {
    special: defineContract.get<TMarketingSpecialDto[]>(apiEndpoints.marketingSpecial, {
        version: null,
    }),
    saleOffer: defineContract.get<TSaleOfferDto, { id: number }>(apiEndpoints.marketingSaleOffer, {
        version: '1.1',
    }),
}
