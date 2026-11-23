import { createAnalyticsChannel } from '@muse/analytics'

export const scoreChannel = createAnalyticsChannel('score_events')
export const courseChannel = createAnalyticsChannel('mu_courses')
export const monetizationChannel = createAnalyticsChannel('mu_monetization')
export const viewChannel = createAnalyticsChannel('mu_view')
export const searchChannel = createAnalyticsChannel('mu_search')
export const pushNotificationsChannel = createAnalyticsChannel('mu_push_event')
export const userSessionChannel = createAnalyticsChannel('mu_user_session')
export const songbooksChannel = createAnalyticsChannel('mu_songbooks')
export const npsChannel = createAnalyticsChannel('mu_nps')
export const appPerformanceChannel = createAnalyticsChannel('app_perf_raw')
