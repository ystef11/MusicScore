import type {
    TAnalyticsConfig,
    TAnalyticsEventParams,
} from '../types/analyticsTypes'

type TLazyEvent = () => void
type TAnalyticsInternalContext = {
    configured: boolean
    trackingEnabled: boolean
    lazyEvents: TLazyEvent[]
    shouldSendLazyEvents: boolean
} & TAnalyticsConfig<TAnalyticsEventParams>

const initialContext: TAnalyticsInternalContext = {
    configured: false,
    trackingEnabled: true,
    lazyEvents: [] as TLazyEvent[],
    shouldSendLazyEvents: false,
} as TAnalyticsInternalContext

let context = initialContext

export const setContext = (config: Partial<TAnalyticsInternalContext>) => {
    Object.assign(context, config)
}

export const clearContext = () => {
    context = initialContext
}

export const getContext = () => context
