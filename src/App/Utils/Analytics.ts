import type {
    TAnalyticsParams,
    TEventParamsMap,
    TRegisteredEventName,
} from '@mu-native/rt-analytics'

// Retain event call signatures without collecting or sending telemetry.
export default function reportEvent<E extends TRegisteredEventName>(
    message: E,
    params?: TEventParamsMap[E] & Record<string, unknown>,
): void
export default function reportEvent(message: string, params?: TAnalyticsParams): void
export default function reportEvent(_message: string, _params?: TAnalyticsParams): void {}
