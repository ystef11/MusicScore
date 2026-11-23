import { appPerformanceChannel, packCustomParams } from '@mu-native/rt-analytics'

export type TPerformanceEventParams = Record<string, string | number | boolean | undefined>

export type TPerformanceEvent = {
    event: string
    value?: number
    screen?: string | null
    previous_screen?: string | null
    params?: TPerformanceEventParams
}

export type TPerformanceLogger = {
    send: (event: TPerformanceEvent) => void
}

/**
 * A param must not be named after a column of another channel's table (`score_id` is one), or
 * `packCustomParams` promotes it to a top-level field that this table has no column for.
 */
export const buildPerformanceEventPayload = ({
    event,
    value,
    screen,
    previous_screen,
    params,
}: TPerformanceEvent) => ({
    event,
    params: packCustomParams({ value, screen, previous_screen, ...params }),
})

export const performanceLogger: TPerformanceLogger = {
    send: event => appPerformanceChannel.send(buildPerformanceEventPayload(event) as any),
}
