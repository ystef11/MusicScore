import { NativeModules } from 'react-native'

import { abStorage, abStoreChunk, getExperimentsIds } from '@mu-native/ab'
import {
    apiConstants,
    apiEndpoints,
    getMinRequiredAPIHeaders,
    getServerTimestamp,
    getMuseAppHeaders,
} from '@mu-native/api'
import type { TCommonHelloDto } from '@mu-native/api'
import { store } from '@mu-native/common'

import SentryUtils from '../Utils/Sentry'

const updateServerTimeInHeadlessJS = async () => {
    const headers = await getMinRequiredAPIHeaders()
    const response = await fetch(`${apiConstants.apiProdUrl}${apiEndpoints.commonHello}`, {
        headers,
    })
    const json: TCommonHelloDto = await response.json()
    return json.timestamp * 1000
}

export default {
    baseUrl: apiConstants.apiProdUrl,
    getClientId: async (): Promise<string> => {
        try {
            const nativeMD5 = NativeModules.NativeMD5
            const clientId: string = await nativeMD5.getClientId()
            return clientId
        } catch (error) {
            SentryUtils.sendMessage('getClientId', error)
            return ''
        }
    },
    buildHeaders: async (): Promise<Headers> => {
        const state = store.getState()
        // in HeadlessJS mode on Android store can't init in time
        const isHeadless = !state.modules
        const sessionId = isHeadless ? null : abStoreChunk?.props?.getSession?.(state)?.id
        const experimentsIds = isHeadless ? null : getExperimentsIds(state)
        const unifiedId = abStorage.get('unifiedId') as string | undefined

        let serverTimestamp: number
        if (isHeadless) {
            serverTimestamp = await updateServerTimeInHeadlessJS()
        } else {
            serverTimestamp = getServerTimestamp(state)
        }
        const headers = await getMuseAppHeaders({ get: () => serverTimestamp })

        if (sessionId) headers.set('X-MU-SESSION-ID', sessionId)
        if (unifiedId) headers.set('X-MU-UNIFIED-ID', unifiedId)
        if (experimentsIds) headers.set('x-mu-ab-experiment', experimentsIds)

        return headers
    },
}
