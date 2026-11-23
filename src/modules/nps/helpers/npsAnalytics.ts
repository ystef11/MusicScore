import { NPS_CAMPAIGN_NAME } from '../constants/npsConstants'

export type TNpsStep = 'rating' | 'comment'

export function getNpsTrigger(sessionNumber: number) {
    return `session_${sessionNumber}`
}

export function npsEventParams(
    sessionNumber: number,
    extra: { nps_rating_score?: number; nps_feedback_text?: string; step?: TNpsStep } = {},
) {
    return {
        nps_campaign_name: NPS_CAMPAIGN_NAME,
        nps_trigger_name: getNpsTrigger(sessionNumber),
        ...extra,
    }
}
