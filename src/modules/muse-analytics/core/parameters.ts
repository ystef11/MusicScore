import { getEventParams } from '../helpers/getEventParams'
import type { TAnalyticsExplicitParams, TAnalyticsGlobalParams } from '../types/analytcsParams'
import type { TAnalyticsEvent, TAnalyticsEventParams } from '../types/analyticsTypes'

import { getContext } from './context'
import logger from './logger'

const context = getContext()

const REQUIRED_PARAMS_PUBLIC = ['unified_id', 'screen'] as const

const REQUIRED_PARAMS_AUTHENTICATED = ['user_id', 'payment_account_id'] as const

let globalParams: Partial<TAnalyticsGlobalParams> = {}
let explicitParams: Partial<TAnalyticsExplicitParams> = {}

export const setExplicitParams = (params: Partial<TAnalyticsExplicitParams>) => {
    Object.assign(explicitParams, params)
}

export const setGlobalParams = <TParams extends TAnalyticsEventParams>(
    params: Partial<TParams & TAnalyticsGlobalParams>,
) => {
    Object.assign(globalParams, params)
    logger.log('set global params', params)
}

const getSessionParams = () => {
    const id = context.getSessionId?.() || ''

    return {
        session_id: id,
    }
}

const checkRequiredParams = () => {
    const session = getSessionParams()

    REQUIRED_PARAMS_PUBLIC.forEach(name => {
        logger.required(explicitParams[name], name)
    })

    logger.required(session.session_id, 'session_id')

    if (!explicitParams.user_id) {
        return
    }

    REQUIRED_PARAMS_AUTHENTICATED.forEach(name => {
        logger.required(explicitParams[name], name)
    })
}

export const clearParams = () => {
    globalParams = {}
    explicitParams = {}
}

export const withGlobalParams = ({ event, params, ...restParams }: TAnalyticsEvent) => {
    const { getRealTimeParams, getParameters } = context

    if (getParameters) {
        return {
            event,
            ...restParams,
            ...getParameters(),
            ...getEventParams(params),
        }
    }

    checkRequiredParams()

    return {
        event,
        ...restParams,
        ...explicitParams,
        ...getSessionParams(),
        ...(getRealTimeParams ? getRealTimeParams(event) : {}),
        ...getEventParams(params),
        ...globalParams,
    }
}
