// Analytics is removed; keep the public API for existing application callers.
const noop = () => {}
export const initAnalytics = noop
export const rtAnalyticsService = {
    initAnalytics,
    flushEvents: noop,
    sendEventImmediately: (_event: Record<string, unknown>, _channelName: string) => {},
    updateUserAttributes: async (_options?: { force?: boolean }) => {},
    getIsAnalyticsTestEnabled: () => false,
    getTimeDiff: () => 0,
    getIPCountry: (): string | null => null,
}
