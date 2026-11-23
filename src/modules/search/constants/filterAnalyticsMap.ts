import MetricaEvents from '../../../App/constants/MetricaEvents'

import { browseFiltersKeys } from './titlesMap'

export const filterAnalyticsMapExpand = {
    [browseFiltersKeys.instrument]: MetricaEvents.BROWSE_EXPAND_INSTRUMENT_FILTER,
    [browseFiltersKeys.genres]: MetricaEvents.BROWSE_EXPAND_GENRE_FILTER,
    [browseFiltersKeys.instrumentation]: MetricaEvents.BROWSE_EXPAND_ENSEMBLE_FILTER,
    [browseFiltersKeys.type]: MetricaEvents.BROWSE_EXPAND_STATUS_FILTER,
    [browseFiltersKeys.complexity]: MetricaEvents.BROWSE_EXPAND_COMPLEXITY_FILTER,
    [browseFiltersKeys.recordingType]: MetricaEvents.BROWSE_EXPAND_STATUS_FILTER,
    [browseFiltersKeys.license]: MetricaEvents.BROWSE_EXPAND_LICENSE_FILTER,
    [browseFiltersKeys.scoreFormat]: MetricaEvents.BROWSE_EXPAND_FORMAT_FILTER,
} as const
