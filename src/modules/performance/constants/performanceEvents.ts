/**
 * Event names of the `app_perf_raw` channel. They live here rather than in `RT_EVENTS` because
 * `reportEvent` cannot route them: its channel map holds no perf entry, so passing one of these
 * to it drops the event. Send them through `performanceLogger` only.
 */
export const PERFORMANCE_EVENTS = {
    APP_START_NATIVE_INIT: 'App Start Native Init',
    APP_START_JS_INIT: 'App Start JS Init',
    APP_START_TTI: 'App Start TTI',
    APP_START_TOTAL: 'App Start Total',
    NETWORK_REQUESTS: 'Network Requests',
} as const

export const FSR_EVENT_PREFIX = 'FSR'

/** First Screen Render event name, e.g. `FSR Score` */
export const getScreenRenderEventName = (screenName: string) => `${FSR_EVENT_PREFIX} ${screenName}`
