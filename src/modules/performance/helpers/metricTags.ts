/**
 * Performance marks and measures cannot carry arbitrary data, so tags for a measure are kept
 * here by measure name until the observer reports it.
 */
export type TMetricTags = Record<string, string | number | boolean | undefined>

const metricTagsStorage = new Map<string, TMetricTags>()

export const setMetricTags = (measureName: string, tags: TMetricTags) => {
    metricTagsStorage.set(measureName, tags)
}

export const getMetricTags = (measureName: string) => metricTagsStorage.get(measureName)

export const removeMetricTags = (measureName: string) => {
    metricTagsStorage.delete(measureName)
}
