import { createExtendedStoreChunk } from '@ug/store'

import { TExploreCommonStoreChunkState } from './exploreCommonTypes.ts'

export const exploreCommonStoreChunk = createExtendedStoreChunk<TExploreCommonStoreChunkState>({
    treeKey: 'modules',
    storeKey: 'explore_common',
})({
    initialState: {
        scrollToTop: null,
        homeScreenSections: [],
        isLoadingSections: false,
    },
})
