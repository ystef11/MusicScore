import { createExtendedStoreChunk } from '@ug/store'

type TApiState = {
    timestamp: number // ms
    timestampOffset: number // ms
    f: string | null
    jws: string | null
    reconnectCount: number
}

export const apiStoreChunk = createExtendedStoreChunk<TApiState>({
    treeKey: 'modules',
    storeKey: 'api',
})({
    initialState: {
        timestamp: Date.now(),
        timestampOffset: 0,
        f: null,
        jws: null,
        reconnectCount: 0,
    },
    actions: {
        setPartialFieldsCustom: (apiPartialsFields: Partial<TApiState>) => ({
            ...apiPartialsFields,
        }),
        setServerTimestamp: (timestamp: number) => ({
            timestamp,
            timestampOffset: Date.now() - timestamp,
        }),

        reset: () => {
            return { jws: null, f: null }
        },
    },
})

// do not use createSelector since it memoizes data; we need fresh calculation at each call
export const getServerTimestamp = (state: any) => {
    return Date.now() - apiStoreChunk.props.getTimestampOffset(state)
}
