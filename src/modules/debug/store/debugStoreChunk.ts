import { createExtendedStoreChunk } from '@ug/store'

import { getTime } from '../helpers/getTime'
import type { TEvent, TEventMap, TRequest, TRequestMap } from '../types/debugTypes'

type TDebugModuleState = {
    analytics: TEvent[]
    api: TRequest[]
    event: TEventMap | null
    isEnabled: boolean
    request: TRequestMap | null
}

export const debugStore = createExtendedStoreChunk<TDebugModuleState>({
    treeKey: 'modules',
    storeKey: 'debug',
})({
    persist: ['analytics', 'api', 'isEnabled'],
    initialState: {
        analytics: [],
        api: [],
        event: null,
        isEnabled: false,
        request: null,
    },
    actions: {
        addAnalytics: (event: Omit<TEvent, 'time'>, state) => ({
            analytics: [{ ...event, time: getTime() }, ...state.analytics],
        }),
        addApi: (event: TRequest, state) => ({
            api: [{ ...event, time: getTime() }, ...state.api],
        }),
        reset: () => ({ analytics: [], api: [] }),
        setEvent: (event: TEvent | null) => {
            if (!event) return { event }

            return {
                event: Object.keys(event.data)
                    .sort()
                    .map(key => ({ key, value: JSON.stringify(event.data[key]) })),
            }
        },
        setRequest: (request: TRequest | null) => {
            if (!request) return { request }

            return {
                request: Object.keys(request)
                    .sort()
                    // @ts-ignore
                    .map(key => ({ key, value: JSON.stringify(request[key]) })),
            }
        },
    },
})
