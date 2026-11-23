import { platform } from '@mu-native/common'

import type { TAccessRight, TAccessRightResponse } from '../types/marketingTypes'
import { TAccessRightsResponse } from '../types/marketingTypes'

const createServiceObject = (item: TAccessRightResponse) => ({
    serviceName: item.service_name,
    productId: item.product_id,
    dateAccess: item.date_access,
    lifetime: item.lifetime,
    trial: item.trial,
    isPaymentPending: platform.isAndroid && item.payment_state === 0,
    valid: !!item.lifetime || item.date_access * 1000 > Date.now(),
    autoRenew: item.auto_renew,
})

export const validateServiceJSON = (responseJSON: TAccessRightsResponse) => {
    if (!Array.isArray(responseJSON) && responseJSON?.service_access) {
        return Array.isArray(responseJSON.service_access)
    }

    return !!(responseJSON && Array.isArray(responseJSON))
}
export const convertToAccessRights = (
    responseJSON: TAccessRightsResponse,
): TAccessRight[] | null => {
    if (!Array.isArray(responseJSON) && responseJSON?.service_access) {
        return responseJSON.service_access?.map((item: TAccessRightResponse) =>
            createServiceObject(item),
        )
    }

    if (Array.isArray(responseJSON))
        return responseJSON?.map((item: TAccessRightResponse) => createServiceObject(item))

    return null
}
