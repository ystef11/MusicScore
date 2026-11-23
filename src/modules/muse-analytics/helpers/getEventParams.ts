import {
    TAnalyticsEventCustomParams,
    TAnalyticsEventCustomParamsMappedGeneric,
} from '../types/analyticsTypes'

export const getEventParams = <T extends TAnalyticsEventCustomParams>(params?: T) => {
    if (!params) return {} as TAnalyticsEventCustomParamsMappedGeneric<T>

    return params
}
