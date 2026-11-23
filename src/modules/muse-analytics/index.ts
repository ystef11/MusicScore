import { createAnalytics } from './core/analytics'

export { createAnalyticsChannel } from './core/channel'

export type {
    TAnalyticsEvent,
    TAnalyticsTransport,
    TAnalytics,
    TLogger,
    TAnalyticsEventCustomParams,
} from './types/analyticsTypes'
export type { TAnalyticsGlobalParams, TAnalyticsRealTimeParams } from './types/analytcsParams'

const analytics = createAnalytics()

export { analytics }
