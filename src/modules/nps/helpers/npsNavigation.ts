import { NavigationService } from '@mu-native/navigation'

import { isNpsScoreScreen } from './npsEligibility'

export const getTopRouteName = (): string | null => {
    try {
        return NavigationService.getTopRoute()?.name ?? null
    } catch {
        return null
    }
}

export type TNpsTriggerAction = 'arm' | 'disarm' | 'none'

/** Leaving a score route for a known non-score route arms the timer; any score route disarms it. */
export function getNpsTriggerAction(
    wasOnScore: boolean,
    routeName: string | null,
): TNpsTriggerAction {
    if (isNpsScoreScreen(routeName)) return 'disarm'
    if (wasOnScore && routeName !== null) return 'arm'

    return 'none'
}
