import { hubConstants } from '@mu-native/hub-common'
import { createUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

export const newForYouStoreChunk = createUniversalScoreListDynamicStoreChunk(
    'new_for_you',
    hubConstants.hubNewForYou.id,
)
