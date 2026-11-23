import type {
    TAnalyticsChannel,
    TAnalyticsEvent,
    TAnalyticsEventParams,
    TAnalyticsChannelConfig,
} from '../types/analyticsTypes'

// Channels remain callable but never collect, buffer or transmit events.
export const createAnalyticsChannel = <
    TChannelEvent extends TAnalyticsEvent,
    TChannelParams extends TAnalyticsEventParams = TAnalyticsEventParams,
>(
    name: string,
    _config?: TAnalyticsChannelConfig<TChannelParams>,
): TAnalyticsChannel<TChannelEvent, TChannelParams> => ({
    name,
    setParams: () => {},
    setContext: () => {},
    send: () => {},
    sendImmediately: () => {},
    sendOnce: () => {},
    sendImmediatelyOnce: () => {},
})
