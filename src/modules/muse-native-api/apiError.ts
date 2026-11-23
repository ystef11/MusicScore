import { APIStatusCodes } from './apiStatusCodes'
import type { TApiLogger } from './apiTypes'

type APIValidationError = { field: string; message: string }[]

type IErrorMap = {
    [APIStatusCodes.redirect]?: (res: { url: string }) => void
    [APIStatusCodes.forbidden]?: () => void
    [APIStatusCodes.notFound]?: () => void
    [APIStatusCodes.serverError]?: () => void
    [APIStatusCodes.validationError]?: (errors: APIValidationError) => void
}

type TNetworkError = Error

/**
 * @example
 * ```
 *  try {
 *      const submissions = await getStudentSubmission()
 *  } catch (err) {
 *      handleAPIError({
 *         [APIStatusCodes.notFound]() {
 *            // not found error handler
 *         },
 *      })(err)
 *  }
 * ```
 * @todo add typing for error
 */
export const createhandleAPIError =
    (logger: TApiLogger) =>
    (errorMap: Partial<IErrorMap> = {}) =>
    (error: Response | unknown) => {
        const status: keyof IErrorMap = error instanceof Response ? error.status : 0
        const callback = errorMap[status]

        if (!callback) {
            logger.error(error)
        }
        // TODO: validation error
        // callback(
        //     error instanceof Response && status === APIStatusCodes.validationError
        //         ? error.data || []
        //         : error,
        // )
    }

export enum ApiErrorCodes {
    unknown = 'unknown',
    globalBadParams = 'global.bad_params',
    deviceAttestationFailed = 'device.attestation_failed',
    globalTooManyRequests = 'global.too_many_requests',
    globalForbidden = 'global.forbidden',
    globalNotFound = 'global.not_found',
    userProPlusSubscriptionRequired = 'user.pro_plus_subscription_required',
    scoreCountryBlocked = 'score.country_blocked',
    globalErrorParseResponse = 'global.error_parse_response',
    globalDownloadFail = 'global.globalDownloadFail',
}

export function isResponse(error: any): error is Response & { code?: string } {
    if (!error) return false
    // no global Response under the jest environment
    return typeof Response !== 'undefined' && error instanceof Response
}

const networkErrorMessages = [
    // rn fetch (whatwg-fetch поверх XHR)
    'network request failed',
    'network request timed out',
    // NoConnectionError из ensureNetwork
    'no connection',
    // iOS NSURLError
    'internet connection appears to be offline',
    'could not connect to the server',
    'network connection was lost',
    'request timed out',
    'hostname could not be found',
    // Android / OkHttp из нативных модулей
    'unable to resolve host',
    'failed to connect',
]

export function isNetworkError(error: any): error is TNetworkError {
    if (!error || isResponse(error)) return false

    // таймаут нашего API-клиента: createApi обрывает запрос через
    // AbortController (API_REQUEST_TIMEOUT), других abort в приложении нет —
    // значит AbortError = «сеть висела дольше таймаута»
    if (error?.name === 'AbortError') return true

    const message = String(error?.message || '').toLowerCase()

    return networkErrorMessages.some(text => message.includes(text))
}

/**
 * The url is worth adding to a network failure, but not at the cost of hiding what
 * the failure was: isNetworkError recognises an abort by name alone, and a plain
 * `new Error(message)` drops it, so the report filters stop matching.
 */
export function wrapNetworkError(error: any, url: string): TNetworkError {
    const wrapped = new Error(error?.message, { cause: JSON.stringify({ url }) })
    if (error?.name) wrapped.name = error.name
    return wrapped
}

export async function errorMessage(error: any): Promise<string> {
    if (isResponse(error)) {
        try {
            const json = await error.clone().json()
            return (
                json?.fields?.at(0)?.message ||
                json?.message ||
                json.error?.message ||
                json.code?.toString() ||
                ApiErrorCodes.unknown
            )
        } catch (e) {
            return ApiErrorCodes.unknown
        }
    }
    return ApiErrorCodes.unknown
}

export async function responseCode(error: any): Promise<ApiErrorCodes | 'failGetCodeFromResponse'> {
    if (isResponse(error)) {
        try {
            return (await error.clone().json()).code as ApiErrorCodes
        } catch (e) {
            return 'failGetCodeFromResponse'
        }
    }
    return ApiErrorCodes.unknown
}
