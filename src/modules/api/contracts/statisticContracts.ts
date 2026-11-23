import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TAndroidInstallPayloadDto,
    TInstallEventDto,
    TIosInstallPayloadDto,
    TStatisticSummaryDto,
} from '../dto/purchaseDto'

import { defineContract } from './defineContract'

export const statisticContracts = {
    /** Catalogue counters for the landings; 404 until the first summary is generated. */
    summary: defineContract.get<TStatisticSummaryDto>(apiEndpoints.statisticStatistic, {
        version: '1.1',
    }),
    /** First launch; `device_id` is the mutex key against a retried registration. */
    iosInstall: defineContract.post<TInstallEventDto, TIosInstallPayloadDto, { device_id: string }>(
        apiEndpoints.statisticIosInstall,
        { version: '1.2' },
    ),
    /** Call last on first launch so an existing account (found through transactions) gets the install. */
    androidInstall: defineContract.post<
        TInstallEventDto,
        TAndroidInstallPayloadDto,
        { device_id: string }
    >(apiEndpoints.statisticAndroidInstall, { version: '1.1' }),
}
