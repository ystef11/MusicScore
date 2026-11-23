const PREFIX = 'tracker'

const TTI_MEASURE_PATTERN = /^tracker-([^-]+)-\d+-tti$/

export type TScreenTrackerMarks = { start: string; tti: string }

let nextInstanceId = 0

/**
 * Marks are global, so each mounted tracker gets its own pair: two instances of one screen
 * (Score Info opened from Score Info) must not measure against each other's start.
 */
export const createScreenTrackerMarks = (screenName: string): TScreenTrackerMarks => {
    nextInstanceId += 1

    return {
        start: `${PREFIX}-${screenName}-${nextInstanceId}-start`,
        // The TTI mark and the TTI measure share the name; the entry type tells them apart.
        tti: `${PREFIX}-${screenName}-${nextInstanceId}-tti`,
    }
}

/** Returns the screen name of a `tracker-<screen>-<n>-tti` measure, or null for any other entry */
export const parseScreenTrackerMeasure = (measureName: string): string | null => {
    const match = measureName.match(TTI_MEASURE_PATTERN)

    return match ? match[1] : null
}

export const clearScreenTrackerEntries = (ttiMeasureName: string) => {
    try {
        performance.clearMarks(ttiMeasureName.replace(/-tti$/, '-start'))
        performance.clearMarks(ttiMeasureName)
        performance.clearMeasures(ttiMeasureName)
    } catch (error) {
        // Cleanup is best effort: a failure only leaves a few entries in the timeline buffer.
    }
}
