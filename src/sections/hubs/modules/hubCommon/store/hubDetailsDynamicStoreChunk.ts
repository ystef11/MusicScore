import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { THub } from '../types/hubTypes.ts'

type THubDetailsDynamicStoreChunkState = {
    hub: THub
}

export function createHubDetailsDynamicStoreChunk(key: string, hub: THub) {
    return createExtendedStoreChunk<THubDetailsDynamicStoreChunkState>({
        treeKey: 'modules',
        storeKey: `hub_details_${key}_${hub.id}}`,
    })({
        initialState: { hub },
        actions: {},
    })
}

export type THubDetailsDynamicStoreChunk = ReturnType<typeof createHubDetailsDynamicStoreChunk>

export const HubDetailsContext = createContext<
    ReturnType<THubDetailsDynamicStoreChunk> | undefined
>(undefined)

export function useHubDetailsContext() {
    return useContext(HubDetailsContext)! as THubDetailsDynamicStoreChunk
}
