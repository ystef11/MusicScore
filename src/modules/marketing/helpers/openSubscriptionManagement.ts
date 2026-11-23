/* eslint-disable import/no-relative-packages */
import { deepLinkToSubscriptions } from '../services/storeBilling'

import SentryUtils from '../../../App/Utils/Sentry'

export const openSubscriptionManagement = (skuAndroid?: string) => {
    deepLinkToSubscriptions({ skuAndroid }).catch(error =>
        SentryUtils.sendMessage('deepLinkToSubscriptions', error),
    )
}
