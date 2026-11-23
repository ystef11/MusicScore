export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'OPTIONS'
export const apiEndpoints = {
    scoreInfo: '/score/info',
    scoreSearch: '/score/search',
    scoreView: '/score/view',
    scorePublisherCheck: '/score/publisher/check',
    scoreShare: '/score/share',
    scoreSets: '/score/sets',
    scoreDownload: '/score/download',
    scoreComment: '/score/comment',
    scoreBuy: '/score/buy',
    scoreRating: '/rating/score',
    scoreLink: '/score/link',
    scoreAnnotation: '/score/annotation',
    scoreSimilar: '/score/similar-scores',

    songInfo: '/song/info',

    courseRating: '/rating/course',
    courseProgressLesson: '/course/progress/lesson',
    courseSearch: '/course/search',
    coursePurchased: '/course/purchased',
    courseInfo: '/course/info',
    courseFeedback: '/course/feedback',
    courseFavorite: '/course/favorite',
    courseContent: '/course/content',
    courseComment: '/course/comment',
    courseBuy: '/course/buy',
    courseSection: '/course/section',

    ebookSectionList: '/ebook/section/list',
    ebookSectionInfo: '/ebook/section/info',
    ebookFavorite: '/ebook/favorite',
    ebookPurchased: '/ebook/purchased',
    ebookSearch: '/ebook/search',
    ebookInfo: '/ebook/info',
    ebookRating: '/rating/ebook',
    ebookComment: '/ebook/comment',
    ebookSimilar: '/ebook/similar',
    ebookBuy: '/ebook/buy',
    ebookUrlFull: '/ebook/url/full',
    ebookUrlPreview: '/ebook/url/preview',

    contentLike: '/content/like',

    quizQuiz: '/quiz/quiz',
    quizAnswer: '/quiz/question-answer',

    artistInfo: '/artist/info',
    artistAutoComplete: '/artist/auto-complete',

    songAutoComplete: '/song/auto-complete',

    scoreUpload: '/score/upload',

    userFeedDashboard: '/user/feed/dashboard',
    userProfileInfo: '/user/profile/info',
    userProfileStatistics: '/user/profile/statistics',
    userFollowersSubscribe: '/user/follower/subscribe',
    userFeedMobPushSubscribe: '/user/feed/mobpush/subscribe',
    userFeedNotificationCount: '/user/feed/notification-count',
    userMe: '/user/me',
    userFeedback: '/user/feedback',
    userBalance: '/user/balance',
    userAttributes: '/user/attributes',
    userFollowerFollower: '/user/follower/follower',
    userFollowerFollowing: '/user/follower/following',

    hubScores: '/hub/scores',
    hubInfo: '/hub/info',
    hubList: '/hub/list',
    hubSubscription: '/subscription/hub',

    statisticIosTransactionSource: '/statistic/ios/transaction/source',
    statisticAndroidInstall: '/statistic/android/install',
    statisticIosInstall: '/statistic/ios/install',
    statisticStatistic: '/statistic/statistic',

    collectionUploaded: '/collection/uploaded',
    collectionSet: '/collection/set',
    collectionSets: '/collection/sets',
    collectionFavorites: '/collection/favorites',
    collectionScoreOrders: '/collection/score-orders',

    purchaseTransactionDeviceIosImport: '/purchase/transaction/device/ios/import',
    purchaseTransactionDeviceAndroidPurchaseToken:
        '/purchase/transaction/device/android/purchase-token',
    purchaseTransactionAndroid: '/purchase/transaction/android',
    purchaseServiceAccess: '/purchase/service/access',
    purchaseTransactionContentStorage: '/purchase/transaction/content-storage',
    billingBonusCredit: '/billing/bonus-credit',

    marketingSaleOffer: '/marketing/sale-offer',
    marketingSpecial: '/marketing/special',

    authRefresh: '/auth/refresh',
    authCapcha: '/auth/capcha',
    authLogin: '/auth/login',
    authEmailCheck: '/auth/email-check',
    authUsernameCheck: '/auth/username-check',
    authOauth: '/auth/oauth',
    authOauthUserCheck: '/auth/oauth-user-check',
    commonHello: '/common/hello',
    dashboardSection: '/dashboard/section',
    analyticsRt: '/analytics/rt',
    analyticsSession: '/analytics/session',
    analyticsTracker: '/analytics/tracker',
    abTest: '/ab/test',

    appDC2: '/app/d/c2',
    appDF: '/app/d/f',
    appDI: '/app/d/i',
    appLinkAppsFlyer: '/app/link/appsflyer',

    shazamToken: '/shazam/token',
    shazamSearch: '/shazam/search',

    searchSuggestions: 'https://musescore.com/static/musescore/search/suggestions/',
    ebookSuggestions: 'https://musescore.com/static/musescore/search/ebook_suggestions/',

    playlistSearch: '/playlist/search',
    playlistInfo: '/playlist/info',

    screenHome: '/screen/home',
    screenSearch: '/screen/search',
    screenLibrary: '/screen/library',
    screenLearn: '/screen/learn',
    libraryScores: '/library/scores',
    librarySongbooks: '/library/songbooks',
    libraryCourses: '/library/courses',
    libraryResync: '/library/resync',
    userEmailActivation: '/user/notification/email-activation',
    notificationPushToken: '/notification/push-token',
    searchSuggestScores: '/search/suggest/scores',

    uploadOmrFile: '/score/omr/convert?v=1.5',
    uploadOmrPdfFile: '/score/omr/convert',
    userSearchHistory: '/score/user-search-info',
    authMobWeb: '/auth/quick',
    deeplinkData: '/deeplink/mobile',
} as const

export type Endpoints = (typeof apiEndpoints)[keyof typeof apiEndpoints]

type ApiMethod = Record<HttpMethod, Partial<Record<Endpoints, { v: string }>>>
export const apiVersions: ApiMethod = {
    GET: {
        [apiEndpoints.scoreInfo]: { v: '1.4' },
        [apiEndpoints.scoreView]: { v: '1.2' },
        // [apiEndpoints.scoreSearch]: { v: '1.4' },
        [apiEndpoints.scoreSearch]: { v: '1.4' },
        // [apiEndpoints.scoreSearch]: { v: '1.3' },
        [apiEndpoints.shazamSearch]: { v: '1.5' },
        [apiEndpoints.scorePublisherCheck]: { v: '1.1' },
        [apiEndpoints.scoreShare]: { v: '1.1' },
        [apiEndpoints.scoreSimilar]: { v: '1.1' },
        [apiEndpoints.scoreSets]: { v: '1.1' },
        [apiEndpoints.scoreDownload]: { v: '1.1' },
        [apiEndpoints.scoreComment]: { v: '1.1' },

        [apiEndpoints.songInfo]: { v: '1.1' },

        [apiEndpoints.userFeedDashboard]: { v: '1.2' },
        [apiEndpoints.userProfileInfo]: { v: '1.1' },
        [apiEndpoints.userFeedNotificationCount]: { v: '1.1' },
        [apiEndpoints.userBalance]: { v: '1.1' },

        [apiEndpoints.hubScores]: { v: '1.2' },
        [apiEndpoints.hubInfo]: { v: '1.1' },

        [apiEndpoints.collectionUploaded]: { v: '1.2' },
        [apiEndpoints.collectionSet]: { v: '1.2' },
        [apiEndpoints.collectionFavorites]: { v: '1.2' },

        [apiEndpoints.statisticStatistic]: { v: '1.1' },

        [apiEndpoints.quizQuiz]: { v: '1.1' },
        [apiEndpoints.quizAnswer]: { v: '1.1' },

        [apiEndpoints.purchaseTransactionDeviceAndroidPurchaseToken]: { v: '1.1' },
        [apiEndpoints.purchaseServiceAccess]: { v: '1.1' },

        [apiEndpoints.marketingSaleOffer]: { v: '1.1' },

        [apiEndpoints.courseProgressLesson]: { v: '1.1' },
        [apiEndpoints.courseSearch]: { v: '1.1' },
        [apiEndpoints.coursePurchased]: { v: '1.1' },
        [apiEndpoints.courseInfo]: { v: '1.1' },
        [apiEndpoints.courseFavorite]: { v: '1.2' },
        [apiEndpoints.courseContent]: { v: '1.1' },
        [apiEndpoints.courseComment]: { v: '1.1' },

        // Redesign API v2 (new-concept) — all on v1.5 by default
        [apiEndpoints.screenHome]: { v: '1.5' },
        [apiEndpoints.screenSearch]: { v: '1.5' },
        [apiEndpoints.screenLibrary]: { v: '1.5' },
        [apiEndpoints.screenLearn]: { v: '1.5' },
        [apiEndpoints.libraryScores]: { v: '1.5' },
        [apiEndpoints.librarySongbooks]: { v: '1.5' },
        [apiEndpoints.libraryCourses]: { v: '1.5' },
        [apiEndpoints.searchSuggestScores]: { v: '1.5' },

        [apiEndpoints.ebookSectionList]: { v: '1.1' },
        [apiEndpoints.ebookSectionInfo]: { v: '1.1' },
        [apiEndpoints.ebookSearch]: { v: '1.1' },
        [apiEndpoints.ebookFavorite]: { v: '1.1' },
        [apiEndpoints.ebookPurchased]: { v: '1.1' },
        [apiEndpoints.ebookInfo]: { v: '1.3' },
        [apiEndpoints.ebookSimilar]: { v: '1.1' },
        [apiEndpoints.ebookUrlFull]: { v: '1.1' },
        [apiEndpoints.ebookUrlPreview]: { v: '1.1' },
    },

    POST: {
        [apiEndpoints.scoreView]: { v: '1.1' },
        [apiEndpoints.scoreComment]: { v: '1.1' },
        [apiEndpoints.scoreBuy]: { v: '1.1' },
        [apiEndpoints.scoreRating]: { v: '1.1' },
        [apiEndpoints.scoreAnnotation]: { v: '1.5' },

        [apiEndpoints.courseRating]: { v: '1.1' },

        [apiEndpoints.userFollowersSubscribe]: { v: '1.1' },
        [apiEndpoints.userFeedMobPushSubscribe]: { v: '1.1' },
        [apiEndpoints.userFeedback]: { v: '1.1' },

        [apiEndpoints.hubSubscription]: { v: '1.1' },

        [apiEndpoints.statisticIosTransactionSource]: { v: '1.1' },
        [apiEndpoints.statisticAndroidInstall]: { v: '1.1' },
        [apiEndpoints.statisticIosInstall]: { v: '1.2' },

        [apiEndpoints.quizAnswer]: { v: '1.1' },

        [apiEndpoints.purchaseTransactionAndroid]: { v: '1.1' },

        [apiEndpoints.courseFeedback]: { v: '1.1' },
        [apiEndpoints.courseFavorite]: { v: '1.1' },
        [apiEndpoints.courseComment]: { v: '1.1' },
        [apiEndpoints.courseBuy]: { v: '1.1' },

        [apiEndpoints.contentLike]: { v: '1.1' },
        [apiEndpoints.purchaseTransactionDeviceIosImport]: { v: '1.3' },
        [apiEndpoints.uploadOmrFile]: { v: '1.5' },
    },

    PUT: {
        [apiEndpoints.userFeedMobPushSubscribe]: { v: '1.1' },
        [apiEndpoints.userAttributes]: { v: '1.1' },

        [apiEndpoints.courseProgressLesson]: { v: '1.1' },

        [apiEndpoints.collectionSet]: { v: '1.1' },

        [apiEndpoints.authLogin]: { v: '1.2' },

        [apiEndpoints.scoreUpload]: { v: '1.5' },
    },

    DELETE: {
        [apiEndpoints.scoreSets]: { v: '1.1' },

        [apiEndpoints.userFollowersSubscribe]: { v: '1.1' },
        [apiEndpoints.userMe]: { v: '1.1' },

        [apiEndpoints.hubSubscription]: { v: '1.1' },

        [apiEndpoints.courseFavorite]: { v: '1.1' },
        [apiEndpoints.courseComment]: { v: '1.1' },

        [apiEndpoints.contentLike]: { v: '1.1' },

        [apiEndpoints.collectionUploaded]: { v: '1.1' },

        [apiEndpoints.collectionSet]: { v: '1.1' },
    },

    OPTIONS: {
        [apiEndpoints.scoreSearch]: { v: '1.3' },
        [apiEndpoints.uploadOmrFile]: { v: '1.5' },
    },
}
