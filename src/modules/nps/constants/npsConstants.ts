import { Screen } from '@mu-native/navigation'

export const NPS_EXPERIMENT_ID = 8504

export const NPS_CAMPAIGN_NAME = 'app_after_score_view'

export const NPS_SURVEY_TYPE_BY_SESSION = {
    4: 'nps_4th_session',
    7: 'nps_7th_session',
    12: 'nps_12th_session',
} as const

export type TNpsSurveyType =
    (typeof NPS_SURVEY_TYPE_BY_SESSION)[keyof typeof NPS_SURVEY_TYPE_BY_SESSION]

export const NPS_SHOW_DELAY_MS = 10_000

export const NPS_FEEDBACK_MAX_LENGTH = 200

export const NPS_RATING_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

/** Leaving any of these for a non-score route is what arms the survey timer. */
export const NPS_SCORE_SCREEN_NAMES = new Set<string>([
    Screen.loadScore,
    Screen.score,
    Screen.scorePlay,
    Screen.scoreInfo,
    Screen.ScoreDetailsInformationScreen,
    Screen.comments,
    Screen.comments2,
    Screen.pdfDrawingScreen,
    Screen.autogradeScreen,
])

export const NPS_EXCLUDED_SCREEN_NAMES = new Set<string>([
    Screen.start,
    Screen.tourInstall,
    Screen.tourUpdate,
    Screen.notifications, // lives inside the TourInstall navigator
    Screen.screenLongLanding,
    Screen.featuresLandingScreen,
    Screen.pricingLandingScreen,
    Screen.creditsLandingScreen,
    Screen.floatingButtonLanding,
    Screen.noLanding,
    Screen.flashSplash,
    Screen.returnSplash,
    Screen.anniversarySplash,
    Screen.scoreDiscountSplash,
    Screen.restoreOfferScreen,
    Screen.scoreSaleScreen,
    Screen.ebooksPrePaywallScreen,
    Screen.purchaseSuccess,
    Screen.game,
    Screen.giftChecklistScreen,
    Screen.AuthStackScreen,
    'AuthEmailLoginScreen',
    Screen.AuthPasswordScreen,
    Screen.KoreanPrivacyComplianceScreen,
])
