import { DebugAnalyticsScreen } from '@mu-native/debug-analytics-screen'
import { DebugApiScreen } from '@mu-native/debug-api-screen'
import { DebugEventScreen } from '@mu-native/debug-event-screen'
import { DebugRequestScreen } from '@mu-native/debug-request-screen'
import { DebugScreen } from '@mu-native/debug-screen'
import { EbookWebViewScreen } from '@mu-native/ebook-web-view-screen'
import {
    EbooksCategoryScreen,
    EbooksDetailsScreen,
    EbooksDigitalPromoScreen,
    EbooksFavoriteScreen,
    EbooksPurchasedScreen,
    EbooksSimilarScreen,
} from '@mu-native/ebooks-main-screen'
import { translate } from '@mu-native/locale'
import { TNavigatorParams } from '@mu-native/navigation'
import { ScoreSaleScreen } from '@mu-native/score-sale-screen'

import { NavHeader } from '../../../App/Components/NavHeader/NavHeader'
import { ebooksScreens } from '../tabNavigator/ebooks/ebooksScreens'
import { profileScreens } from '../tabNavigator/profile/profileScreens'

import { mainAppScreens } from './mainAppScreens'

export const mainAppStack: TNavigatorParams[] = [
    // root stack
    {
        name: mainAppScreens.tabNavigator,
        component: require('../tabNavigator/TabNavigator').TabNavigator,
        options: { headerShown: false },
    },
    // screens
    {
        name: mainAppScreens.activity,
        component: require('../../../App/feedScreens/activityScreen/ActivityScreenContainer')
            .default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.addSet,
        component: require('../../../App/profileScreens/users/containers/UserAddSetContainer')
            .default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.allHubs,
        component: require('../../../App/Explore/Hub/containers/hubs/ScreenHubs').ScreenHubs,
        options: { headerShown: false },
    },
    
    {
        name: mainAppScreens.artist,
        component: require('../../../App/Artist/containers/ArtistScreenContainer')
            .ArtistScreenContainerFunc,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.comments,
        component: require('@mu-native/score-comments-screen').ScoreCommentsScreen,
        options: { headerShown: false, presentation: 'transparentModal' },
    },
    {
        name: mainAppScreens.comments2,
        component: require('@mu-native/score-comments-screen').ScoreCommentsScreen2,
    },
    {
        name: mainAppScreens.courseMain,
        component: require('../../../App/Courses/Containers/screen/ScreenCourse').default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.createEditSet,
        component:
            require('../../../App/profileScreens/users/containers/UserCreateEditSetContainer')
                .UserCreateEditSetContainer,
        options: { headerShown: false },
    },
    
    {
        name: mainAppScreens.followers,
        component:
            require('../../../App/profileScreens/users/containers/UserFollowerScreenContainer')
                .default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.game,
        component: require('@mu-native/game-screen').GameScreen,
        options: { gestureEnabled: false, headerShown: false },
    },
    {
        name: mainAppScreens.hubMain,
        component: require('../../../App/Explore/Hub/containers/ScreenHub').ScreenHubContainer,
        options: {
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.myProfileFavorites,
        component: require('../../../App/Library/Favorites/ScreenFavorites').default,
        options: {
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.mySheetmusic,
        component: require('../../../App/Library/MyScores/ScreenMyScores').default,
        options: {
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.profileMain,
        component: require('../../../App/profileScreens/users/UserProfileScreenContainer').default,
        options: {
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.myProfileMain,
        component: require('@mu-native/profile-screen').ProfileScreen,
        options: {
            headerShown: true,
            header: () => <NavHeader isProfile />,
            headerTransparent: true,
        },
    },
    // The new-concept flow pushes the profile screen onto this flat stack, so the
    // About/Engineer Menu screens it navigates to must be registered here too (they
    // otherwise live only in the profile tab's profileStack).
    {
        name: profileScreens.about,
        component:
            require('../../../App/profileScreens/profileScreen/aboutScreen/AboutScreeContainer')
                .AboutScreenContainer,
        options: { headerShown: false },
    },
    {
        name: profileScreens.engineerMenu,
        component:
            require('../../../App/profileScreens/engineerMenuScreen/EngineerMenuScreenContainer')
                .default,
        options: { headerShown: false },
    },
    {
        name: profileScreens.ab,
        component: require('@mu-native/ab').ABScreen,
        options: { headerShown: true },
    },
    {
        name: mainAppScreens.profileSet,
        component: require('../../../App/profileScreens/users/containers/UserSetsScreenContainer')
            .UserSetsScreenContainer,
        options: {
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.profileSheetMusic,
        component: require('../../../App/profileScreens/users/containers/UserSetScreenContainer')
            .UserSetScreenContainer,
        options: {
            headerShown: false,
        },
    },
    
    {
        name: mainAppScreens.score,
        component: require('@mu-native/score-screen').ScoreScreen,
        options: { headerShown: false, gestureEnabled: false },
    },
    {
        name: mainAppScreens.scoreInfo,
        component: require('@mu-native/score-screen').ScoreInfoScreen,
        // iOS 26 makes the back swipe full-screen by default, and that native
        // recognizer beats the preview's JS PanResponder — a page swipe popped the
        // screen (MUP-14171). Back stays available from the screen edge.
        options: { headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: false },
    },
    {
        name: mainAppScreens.scorePlay,
        component: require('@mu-native/score-screen').ScorePlayScreen,
        options: { headerShown: false, gestureEnabled: false },
    },
    {
        name: mainAppScreens.ScoreDetailsInformationScreen,
        component: require('@mu-native/score-screen').ScoreDetailsInformationScreen,
        options: { gestureEnabled: false },
    },
    {
        name: mainAppScreens.loadScore,
        component: require('@mu-native/load-score-screen').LoadScoreScreen,
        options: { headerShown: false, gestureEnabled: false },
    },
    {
        name: mainAppScreens.scoreRecently,
        component: require('../../../App/Explore/RecentlyViewed/ScreenScoreRecentlyContainer')
            .ScreenScoreRecentlyContainer,
        options: {
            headerShown: false,
        },
    },
    
    
    {
        name: mainAppScreens.searchCourses,
        component: require('../../../App/Courses/ScreenSearchCourses').default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.orders,
        component: require('../../../App/Library/Orders/OrdersScores').default,
        options: {
            headerShown: true,
            header: () => <NavHeader headerTitle={translate('native.ordersTitle')} />,
        },
    },
    {
        name: mainAppScreens.ordersCourses,
        component: require('../../../App/Library/OrdersCourses/OrdersCourses').default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.songBook,
        component: require('../../../App/Library/SongBook/ScreenSongBook').default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.songSheetmusic,
        component: require('../../../App/Artist/containers/CompositionScreenContainer')
            .CompositionScreenContainerFunc,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.userSetting,
        component:
            require('../../../App/feedScreens/activityScreen/containers/ScreenSettingsContainer')
                .ScreenSettingsContainer,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.debug,
        component: DebugScreen,
        options: { headerShown: true },
    },
    {
        name: mainAppScreens.debugAnalytics,
        component: DebugAnalyticsScreen,
        options: { headerShown: true },
    },
    {
        name: mainAppScreens.debugEvent,
        component: DebugEventScreen,
        options: { headerShown: true },
    },
    {
        name: mainAppScreens.debugApi,
        component: DebugApiScreen,
        options: { headerShown: true },
    },
    {
        name: mainAppScreens.debugRequest,
        component: DebugRequestScreen,
        options: { headerShown: true },
    },
    
    
    {
        name: mainAppScreens.pedalSettings,
        component: require('@mu-native/bluetooth-pedal-screen').default,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.pedalFeedback,
        component: require('@mu-native/feedback-pedal-screen').FeedbackPedalScreen,
        options: { headerShown: false },
    },
    
    {
        name: mainAppScreens.ebookWebView,
        component: EbookWebViewScreen,
        options: {
            headerShown: true,
            header: () => <NavHeader noNotifications />,
        },
    },
    
    {
        name: mainAppScreens.autoGradeOnboardingScreen,
        component: require('@mu-native/auto-grade-onboarding-screen').AutoGradeOnboardingScreen,
        options: {
            gestureEnabled: false,
            headerShown: false,
        },
    },
    
    
    {
        name: mainAppScreens.scoresAfterTour,
        component: require('@mu-native/scores-after-tour-screen').ScoresAfterTourScreen,
        options: {
            headerShown: false,
            animation: 'slide_from_bottom',
            gestureEnabled: false,
        },
    },
    {
        name: mainAppScreens.autogradeScreen,
        component: require('@mu-native/autograde-screen').AutogradeScreen,
        options: {
            gestureEnabled: false,
            headerShown: false,
        },
    },
    {
        name: mainAppScreens.makePublic,
        component: require('@mu-native/make-public').MakePublicScreen,
        options: {
            headerShown: true,
            header: () => (
                <NavHeader
                    headerTitle={translate('native.make_public.screen_title')}
                    noNotifications
                />
            ),
        },
    },
    {
        name: mainAppScreens.makePublicManageAccess,
        component: require('@mu-native/make-public').ManageAccessScreen,
        options: {
            headerShown: true,
            header: () => (
                <NavHeader
                    headerTitle={translate('native.make_public.manage_access')}
                    noNotifications
                />
            ),
        },
    },
    {
        name: mainAppScreens.makePublicCopyright,
        component: require('@mu-native/make-public').CopyrightSettingsScreen,
        options: {
            headerShown: true,
            header: () => (
                <NavHeader
                    headerTitle={translate('native.make_public.copyright_settings')}
                    noNotifications
                />
            ),
        },
    },
    {
        name: ebooksScreens.ebookDetailsStack,
        component: EbooksDetailsScreen,
    },
    {
        name: ebooksScreens.ebooksCategoryMain,
        component: EbooksCategoryScreen,
    },
    {
        name: ebooksScreens.ebooksFavoriteScreen,
        component: EbooksFavoriteScreen,
    },
    {
        name: ebooksScreens.ebooksSimilarScreen,
        component: EbooksSimilarScreen,
    },
    {
        name: ebooksScreens.ebooksPurchasedScreen,
        component: EbooksPurchasedScreen,
    },
    
    {
        name: mainAppScreens.subscriptionSettings,
        component: require('@mu-native/subscription-settings-screen').SubscriptionSettingsScreen,
        options: {
            headerShown: true,
            header: () => (
                <NavHeader headerTitle={translate('native.manage.subscription')} noNotifications />
            ),
        },
    },
    {
        name: mainAppScreens.newForYouScoreList,
        component: require('../../../App/Explore/newForYou/NewForYouScoreListScreen')
            .NewForYouScoreListScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.trendingScores,
        component: require('../../../App/Explore/trendingScores/TrendingScoreListScreen')
            .TrendingScoreListScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.bestScores,
        component: require('../../../App/Explore/bestScores/BestScoresListScreen')
            .BestScoresListScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.recommendedCourses,
        component: require('../../../App/Courses/recommendedCourses/RecommendedCoursesScreen')
            .RecommendedCoursesScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.playlistScores,
        component: require('@mu-native/new-concept-home-screen').PlaylistScoresScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.giftChecklistScreen,
        component: require('@mu-native/gift-checklist-screen').GiftChecklistScreen,
        options: { headerShown: false },
    },
    
    {
        name: mainAppScreens.screenOmrMain,
        component: require('@mu-native/omr-main-screen').OmrMainScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.screenOmrUploadPhotos,
        component: require('@mu-native/omr-upload-photos-screen').OmrUploadPhotosScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.screenOmrUploadSuccess,
        component: require('@mu-native/omr-success-upload-screen').OmrSuccessUploadScreen,
        options: { headerShown: false },
    },
    {
        name: mainAppScreens.pdfDrawingScreen,
        component: require('@mu-native/score-screen').PdfDrawingScreen,
        options: { headerShown: false, gestureEnabled: false },
    },
    {
        name: mainAppScreens.shazamResults,
        component: require('@mu-native/shazam').ShazamResultsScreen,
    },
]
