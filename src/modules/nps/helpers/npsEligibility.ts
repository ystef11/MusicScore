import {
    NPS_EXCLUDED_SCREEN_NAMES,
    NPS_SCORE_SCREEN_NAMES,
    NPS_SURVEY_TYPE_BY_SESSION,
    type TNpsSurveyType,
} from '../constants/npsConstants'

export function getNpsSurveyTypeForSession(sessionNumber: number): TNpsSurveyType | undefined {
    return NPS_SURVEY_TYPE_BY_SESSION[sessionNumber as keyof typeof NPS_SURVEY_TYPE_BY_SESSION]
}

export function isNpsScoreScreen(routeName: string | null): boolean {
    return routeName !== null && NPS_SCORE_SCREEN_NAMES.has(routeName)
}

export type TNpsEligibilityInput = {
    isAppActive: boolean
    topRouteName: string | null
    isAuthorized: boolean
    isExperimentEnabled: boolean
    sessionNumber: number
    sessionStartedAt: number | null
    shownSlots: readonly string[]
    requestedReviewAt: number | null
    isShownInProcess: boolean
}

export type TNpsIneligibilityReason =
    | 'appInactive'
    | 'blockedRoute'
    | 'scoreRoute'
    | 'loggedOut'
    | 'experimentDisabled'
    | 'sessionNotEligible'
    | 'slotShown'
    | 'reviewRequestedThisSession'
    | 'shownInProcess'

/** Why the survey must not be shown now, or null when it may be. */
export function getNpsIneligibilityReason(
    input: TNpsEligibilityInput,
): TNpsIneligibilityReason | null {
    if (input.isShownInProcess) return 'shownInProcess'
    if (!input.isAppActive) return 'appInactive'
    if (!input.isAuthorized) return 'loggedOut'
    if (!input.isExperimentEnabled) return 'experimentDisabled'
    if (input.topRouteName === null || NPS_EXCLUDED_SCREEN_NAMES.has(input.topRouteName)) {
        return 'blockedRoute'
    }
    if (isNpsScoreScreen(input.topRouteName)) return 'scoreRoute'

    const surveyType = getNpsSurveyTypeForSession(input.sessionNumber)
    if (!surveyType) return 'sessionNotEligible'
    if (input.shownSlots.includes(surveyType)) return 'slotShown'
    if (
        input.requestedReviewAt !== null &&
        input.sessionStartedAt !== null &&
        input.requestedReviewAt >= input.sessionStartedAt
    ) {
        return 'reviewRequestedThisSession'
    }

    return null
}
