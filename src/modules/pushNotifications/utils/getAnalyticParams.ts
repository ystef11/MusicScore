import { abStorage } from '@mu-native/ab'
import { getCountry } from '@mu-native/common'
import { convertUserRights } from '@mu-native/marketing'
import { getDeviceParams, getExperimentParams } from '@mu-native/rt-analytics'
import { mmkvStorageEngine } from '@muse-native/persist-engines'

import { pushNotificationsStorage } from '../storage/pushNotificationsStorage'
import { TNotification } from '../types/pushNotificationsServiceTypes'

const getPushParamsForAnalytic = (notification: TNotification) => {
    return {
        subject: notification?.data.attributes?.message,
        bm_campaign_name: notification?.data.attributes?.campaign_name,
        bm_campaign_id: notification?.data.attributes?.campaign_id,
        bm_action_name: notification?.data.attributes?.action_name,
        url: notification?.data.attributes?.url,
        push_type: notification?.data.attributes?.push_type,
        push_sent_time: Math.trunc(notification?.data.attributes?.sent_timestamp || 0),
        push_title: notification?.data.attributes?.title,
        push_message: notification?.data.attributes?.message,
    }
}

export const getAnalyticParams = (notification: TNotification) => {
    const abParams = mmkvStorageEngine.get(['unifiedId', 'experiments', 'session'], 'ab_modules')
    const authParams = mmkvStorageEngine.get(['access', 'outdatedAccesses', 'user'], 'auth_modules')
    const marketingParams = mmkvStorageEngine.get(
        ['paymentAccountId', 'paymentAccountDeviceId', 'rights'],
        'marketing_modules',
    )

    return {
        ...getDeviceParams(),
        // @ts-ignore
        ...getExperimentParams(abParams?.experiments),
        // @ts-ignore
        ...convertUserRights(marketingParams?.rights || [], null, null),
        ...getPushParamsForAnalytic(notification),
        notification: JSON.stringify(notification),
        push_token: pushNotificationsStorage.get('sentToken'),
        type: 'mu_push_event',
        country: getCountry(),
        // @ts-ignore
        session_id: abParams?.session?.id,
        unified_id: abStorage.get('unifiedId'),
        // @ts-ignore
        user_id: authParams?.user?.id,
        payment_account_id: marketingParams?.paymentAccountId,
        payment_account_device_id: marketingParams?.paymentAccountDeviceId,
    }
}
