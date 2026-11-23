import { getContext } from './context'

const context = getContext()

export const LOG_PREFIX = '[RT Analytics]:'

const assert = (value: unknown, message: string) => {
    if (value === undefined) {
        context.logger.error(`${LOG_PREFIX} ${message}`)
    }
}

const log = (...params: unknown[]) => {
    const rtParams = params?.[1] as Record<string, string>

    context.logger.log(
        `${LOG_PREFIX} event - ${rtParams?.event || ''}, ${JSON.stringify(
            {
                funnel_source: rtParams?.funnel_source,
                value: rtParams?.value,
                productId: rtParams?.productId,
                subscription_type: rtParams?.subscription_type,
                funnel_start_action: rtParams?.funnel_start_action,
                source: rtParams?.source,
                'params.key': rtParams?.['params.key'],
                'params.str_value': rtParams?.['params.str_value'],
                'params.value': rtParams?.['params.value'],
                'quiz_answer.value': rtParams?.['quiz_answer.value'],
                'quiz_answer.question': rtParams?.['quiz_answer.question'],
            },
            null,
            2,
        )}`,
        ...params,
    )
}

const error = (message: string) => {
    context.logger.error(`${LOG_PREFIX} ${message}`)
}

const required = (value: unknown, name: string) => {
    assert(value, `required parameter "${name}" is not provided.`)
}

export default {
    log,
    error,
    assert,
    required,
}
