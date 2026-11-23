import type { TUserStatisticsDto } from '@mu-native/api'
import { createExtendedStoreChunk } from '@ug/store'

export type CurrentUserCounters = TUserStatisticsDto['counters']

export const countersStoreChunk = createExtendedStoreChunk<{ counters: CurrentUserCounters }>({
    treeKey: 'screens',
    storeKey: 'current_user_counters',
})({
    persist: [],
    initialState: {
        counters: {
            followers_count: 0,
            following_count: 0,
            score_count: 0,
            set_count: 0,
            score_favorite_count: 0,
            course_favorite_count: 0,
            ebook_favorite_count: 0,
            score_purchased_count: 0,
            course_purchased_count: 0,
            ebook_purchased_count: 0,
        },
    },
    actions: {},
})
