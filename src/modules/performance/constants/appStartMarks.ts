export const APP_START_MARKS = {
    jsBundleExecStart: 'appStart.jsBundleExecStart',
    firstRender: 'appStart.firstRender',
    interactive: 'appStart.interactive',
} as const

export const APP_START_MEASURES = {
    nativeInit: 'appStart.phase.nativeInit',
    jsInit: 'appStart.phase.jsInit',
    tti: 'appStart.phase.tti',
    total: 'appStart.total',
} as const

/**
 * Launches above this cap were suspended mid-start (background / headless) and are dropped,
 * never clamped, so the percentiles stay clean. The cap is applied per event, so
 * `App Start Total` may be dropped while its phases are sent: do not assume Total equals the
 * sum of phases within the stored data.
 */
export const MAX_APP_START_DURATION_MS = 180_000
