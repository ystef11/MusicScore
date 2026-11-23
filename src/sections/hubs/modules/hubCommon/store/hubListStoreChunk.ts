import { createExtendedStoreChunk, createSelector } from '@ug/store'

import { hubConstants } from '../constants/hubConstants.ts'
import { THub } from '../types/hubTypes.ts'

type THubListStoreChunkState = {
    hubs: THub[]
}

export const hubListStoreChunk = createExtendedStoreChunk<THubListStoreChunkState>({
    storeKey: 'hub_list',
    treeKey: 'screens',
})({
    initialState: {
        hubs: [],
    },
})

export const getHubsList = createSelector(hubListStoreChunk.props.getHubs, hubs => {
    return [...hubConstants.predefinedHubs, ...hubs]
})
