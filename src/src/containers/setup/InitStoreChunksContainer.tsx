import { useLoadAbStoreChunk } from '@mu-native/ab'
import { useLoadActivityStore } from '@mu-native/activity'
import { useLoadAnalyticsStoreChunk } from '@mu-native/analytics'
import { useLoadApiStoreChunk } from '@mu-native/api'
import { useLoadAuthStoreChunk } from '@mu-native/auth'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { useLoadDebugStore } from '@mu-native/debug'
import { deferredDeeplinkStoreChunk } from '@mu-native/deferred-deeplink'
import { useLoadDynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { exploreCommonStoreChunk } from '@mu-native/explore-common'
import { useLoadGiftChecklistStoreChunk } from '@mu-native/gift-checklist'
import { useLoadHQSoundfontStore } from '@mu-native/hq-soundfont'
import { hubListStoreChunk } from '@mu-native/hub-common'
import { useLoadHubsStoreChunk } from '@mu-native/hubs'
import { useLoadLocaleStoreChunk } from '@mu-native/locale'
import { useLoadMarketingStoreChunk } from '@mu-native/marketing'
import { useLoadNavigationStoreChunk } from '@mu-native/navigation'
import { useLoadNpsStoreChunk } from '@mu-native/nps'
import { useLoadOfflineScoresStoreChunk } from '@mu-native/offlineScores'
import { omrStoreChunk } from '@mu-native/omr'
import { playlistsStoreChunk } from '@mu-native/playlist-scores'
import { useLoadProfileStoreChunk } from '@mu-native/profile'
import { useLoadPushNotificationsStoreChunk } from '@mu-native/pushNotifications'
import { useLoadQuizStoreChunk } from '@mu-native/quiz'
import { recentlyViewedScoresStoreChunk } from '@mu-native/recently-viewed-scores'
import { useLoadReviewAppStoreChunk } from '@mu-native/reviewApp'
import { useLoadScoreStoreChunk } from '@mu-native/score'
import { useLoadSearchStoreChunk } from '@mu-native/search'
import { shazamScoreListStoreChunk, useLoadShazamStoreChunk } from '@mu-native/shazam'
import { useLoadSongbookStoreChunk } from '@mu-native/songbook'
import { useLoadSystemStoreChunk } from '@mu-native/system'
import { useInjectStoreChunk } from '@ug/store'

import { recommendedCoursesStoreChunk } from '../../../App/Courses/recommendedCourses/recommendedCoursesStoreChunk.ts'
import { bestScoresStoreChunk } from '../../../App/Explore/bestScores/bestScoresStoreChunk.ts'
import { exploreScoreListStoreChunk } from '../../../App/Explore/exploreScoreListStoreChunk.ts'
import { newForYouStoreChunk } from '../../../App/Explore/newForYou/newForYouStoreChunk.ts'
import { trendingStoreChunk } from '../../../App/Explore/trendingScores/trendingStoreChunk.ts'
import { countersStoreChunk } from '../../../App/Library/countersStoreChunk.ts'

export const InitStoreChunksContainer = ({ children }: { children: React.ReactElement }) => {
    useLoadAuthStoreChunk()
    useLoadAbStoreChunk()
    useLoadAnalyticsStoreChunk()
    useLoadApiStoreChunk()
    useLoadDebugStore()
    useLoadLocaleStoreChunk()
    useLoadMarketingStoreChunk()
    useLoadNavigationStoreChunk()
    useLoadProfileStoreChunk()
    useLoadScoreStoreChunk()
    useLoadSongbookStoreChunk()
    useLoadSystemStoreChunk()
    useLoadSearchStoreChunk()
    useLoadShazamStoreChunk()
    useLoadDynamicDecorStoreChunk()
    useLoadReviewAppStoreChunk()
    useLoadNpsStoreChunk()
    useLoadQuizStoreChunk()
    useInjectStoreChunk(countersStoreChunk, 'screens')
    useLoadOfflineScoresStoreChunk()
    useLoadGiftChecklistStoreChunk()
    useLoadHubsStoreChunk()
    useLoadPushNotificationsStoreChunk()
    useLoadActivityStore()
    useLoadHQSoundfontStore()
    useInjectStoreChunk(courseBrowseStoreChunk, 'screens')
    useInjectStoreChunk(hubListStoreChunk, 'screens')
    useInjectStoreChunk(recentlyViewedScoresStoreChunk, 'modules')
    useInjectStoreChunk(exploreCommonStoreChunk, 'modules')

    useInjectStoreChunk(exploreScoreListStoreChunk, 'screens')
    useInjectStoreChunk(shazamScoreListStoreChunk, 'screens')
    useInjectStoreChunk(newForYouStoreChunk, 'screens')
    useInjectStoreChunk(bestScoresStoreChunk, 'screens')
    useInjectStoreChunk(trendingStoreChunk, 'screens')
    useInjectStoreChunk(recommendedCoursesStoreChunk, 'screens')
    useInjectStoreChunk(playlistsStoreChunk, 'screens')
    useInjectStoreChunk(omrStoreChunk, 'modules')
    useInjectStoreChunk(deferredDeeplinkStoreChunk, 'modules')

    return children
}
