/* eslint-disable import/no-relative-packages */
import { generalModule } from '@mu-native/common'

import SentryUtils from '../../../App/Utils/Sentry'

const getGoogleUserId = async () => {
    try {
        const { googleUserId } = await generalModule.getGoogleUserId()
        return googleUserId
    } catch (error) {
        SentryUtils.sendMessage('getGoogleUserId', error)
        return null
    }
}

export const nativeBillingHelpers = {
    get getGoogleUserId() {
        return getGoogleUserId
    },
}
