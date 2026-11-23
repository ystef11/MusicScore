import { apiRequest, deeplinkContracts } from '@mu-native/api'
import { device } from '@mu-native/common'

import type { DeepLinksValues } from '../types/deepLinks.ts'

type TDeepLink = { action: DeepLinksValues; payload: string }

// The backend sends `action` as a free string; the app only ever receives the values it
// registered in `DeepLinksTypes`, and unknown ones fall through the handlers untouched.
const fetchDeeplinkData = async (
    referrerClickTimestampSeconds?: string,
): Promise<{ deeplinks: TDeepLink[] }> => {
    const { deeplinks } = await apiRequest(deeplinkContracts.mobile, {
        params: {
            device_id: device.uniqueId,
            ...(referrerClickTimestampSeconds ? { referrerClickTimestampSeconds } : {}),
        },
    })
    return { deeplinks: deeplinks as TDeepLink[] }
}

export const deepLinkService = { fetchDeeplinkData }
