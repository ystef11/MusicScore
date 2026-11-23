import type { TAnalytics } from '../types/analyticsTypes'

// Preserve callers without retaining profiles, identifiers, or analytics configuration.
const noop = () => {}
const analytics: TAnalytics = {
    enableTracking: noop,
    disableTracking: noop,
    setGlobalParams: noop,
    setUser: noop,
    setPaymentAccountId: noop,
    setUnifiedId: noop,
    setExperiments: noop,
    setScreen: noop,
    configure: noop,
    initialize: noop,
}
export const createAnalytics = () => analytics
