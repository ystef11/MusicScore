import { marketingConstants } from '@mu-native/marketing'

import { EVERY_HOW_MANY_DAYS_SHOW } from '../constants/anniversaryConstants'

const { maxDaysToShowAnniversary } = marketingConstants

export const getShowDays = (days: number | null): number => {
    if (!days) return 0
    if (days >= maxDaysToShowAnniversary) return maxDaysToShowAnniversary
    const periodsPassed = Math.floor(days / EVERY_HOW_MANY_DAYS_SHOW)
    return periodsPassed * EVERY_HOW_MANY_DAYS_SHOW
}
