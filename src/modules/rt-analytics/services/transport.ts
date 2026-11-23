// No analytics queue, persistent storage, network transport or backup endpoint.
import type { TAnalyticsEvent } from '@muse/analytics'
import type { TSettingsResponse } from '../types/rtAnalyticsTypes'

export const getSettings = async (): Promise<TSettingsResponse | null> => null
export const getExtraSettings = async () => null
export const transport = {
    send: (_event: TAnalyticsEvent, _channel: string) => {},
    queue: (_event: TAnalyticsEvent, _channel: string) => {},
    setOptions: (_options: TSettingsResponse) => {},
    flush: () => {},
}
