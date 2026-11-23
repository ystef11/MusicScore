import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TAndroidPurchaseTokenDto,
    TAndroidReceiptPayloadDto,
    TIosReceiptPayloadDto,
    TPurchaseContentStorageDto,
    TPurchaseContentStoragePayloadDto,
    TScoreBuyPayloadDto,
    TScoreOrdersDto,
    TServiceAccessRightDto,
} from '../dto/purchaseDto'

import { defineContract } from './defineContract'

/**
 * Store purchases and credits. Every call is scoped to the device's payment account, which the
 * backend derives from the client headers; the receipt endpoints also take `device_id` as a
 * mutex key so a retried registration is not processed twice.
 */
export const purchaseContracts = {
    /** 404 when the device has no payment account or no rights at all. */
    serviceAccess: defineContract.get<TServiceAccessRightDto[]>(
        apiEndpoints.purchaseServiceAccess,
        {
            version: '1.1',
        },
    ),
    androidPurchaseTokens: defineContract.get<TAndroidPurchaseTokenDto[]>(
        apiEndpoints.purchaseTransactionDeviceAndroidPurchaseToken,
        { version: '1.1' },
    ),
    /** Body is the account's rights after the purchase (`serviceAccess`). */
    registerAndroidReceipt: defineContract.post<
        TServiceAccessRightDto[],
        TAndroidReceiptPayloadDto,
        { device_id: string }
    >(apiEndpoints.purchaseTransactionAndroid, { version: '1.1' }),
    /** Body is the account's rights after the import (`serviceAccess`). */
    importIosReceipt: defineContract.post<
        TServiceAccessRightDto[],
        TIosReceiptPayloadDto,
        { device_id: string }
    >(apiEndpoints.purchaseTransactionDeviceIosImport, { version: '1.3' }),
    getContentStorage: defineContract.get<TPurchaseContentStorageDto>(
        apiEndpoints.purchaseTransactionContentStorage,
        { version: null },
    ),
    /** Empty body. */
    setContentStorage: defineContract.post<unknown, TPurchaseContentStoragePayloadDto>(
        apiEndpoints.purchaseTransactionContentStorage,
        { version: null },
    ),
    buyScoreByCredit: defineContract.post<[], TScoreBuyPayloadDto>(apiEndpoints.scoreBuy, {
        version: '1.1',
    }),
    /**
     * Grant the advent-calendar gift for day `type`; the body is the updated balance, empty when
     * another request for the device is in flight. The caller reloads the balance anyway.
     */
    bonusCredit: defineContract.post<unknown, void, { type: number }>(
        apiEndpoints.billingBonusCredit,
        { version: null },
    ),
    scoreOrders: defineContract.get<TScoreOrdersDto, { page: number }>(
        apiEndpoints.collectionScoreOrders,
        { version: null },
    ),
}
