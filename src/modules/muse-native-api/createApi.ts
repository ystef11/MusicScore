import { toQueryString } from '@muse/url'
import { getUrl } from '@muse/url/native'

import { ApiErrorCodes, createhandleAPIError, isNetworkError, wrapNetworkError } from './apiError'
import { apiVersions, Endpoints, HttpMethod } from './apiMethods'
import { HandledAPIStatusCodes } from './apiStatusCodes'
import type { TApiLogger, THeaderParams } from './apiTypes'
import { checkRequestStatus } from './checkRequestStatus'

type TObject = Record<string | number, unknown>
type TRequestPublicConfig = { returnJSON?: boolean }
type TGetProps = {
    url: string
    params?: TObject
    headerParams?: THeaderParams
    config?: TRequestPublicConfig
}
type TPostProps = TGetProps & { payload?: TObject | FormData; requestTimeout?: number }
type TCreateApi = {
    endPoint: string
    f: { get(): string | null }
    logger: TApiLogger
    /** Called when a request starts; the returned callback runs once it settles */
    onRequest?: (url: string) => (() => void) | undefined
    timestamp: { get(): number }
    token: {
        get(urlPath?: string): string | null
        getExpiresAt?: () => number | null
        getRefresh(): string | null
        set(token: string | null): void
        setRefresh(refreshToken: string): void
        requestRefresh(refreshToken: string): Promise<void>
        /** Ends a session that cannot be refreshed. */
        endSession?(): void
    }
    headerParams: THeaderParams
    getAppHeaders: (timeStamp: { get(): number }, params: THeaderParams) => Promise<any>
}
type TApiRequestApiConfig = Omit<RequestInit, 'body'> & {
    requestTimeout?: number
    body?: TObject | FormData
} & TRequestPublicConfig
type TCommonErrorCallbacks = {
    onRepeatRequest: <T>(
        executeRequest: () => Promise<T>,
        response?: Response,
    ) => ReturnType<typeof executeRequest>
    onNotAuthorized: <T>(
        executeRequest: () => Promise<T>,
        response?: Response,
    ) => ReturnType<typeof executeRequest>
    onUpdateServerTimestamp: <T>(
        executeRequest: () => Promise<T>,
        response?: Response,
    ) => ReturnType<typeof executeRequest>
    onPassAttestation: <T>(
        executeRequest: () => Promise<T>,
        response?: Response,
    ) => ReturnType<typeof executeRequest>
    onTokenExpired: <T>(
        executeRequest: () => Promise<T>,
        response?: Response,
    ) => ReturnType<typeof executeRequest>
}

export const createApi = ({
    endPoint,
    f,
    logger,
    onRequest,
    timestamp,
    token,
    headerParams,
    getAppHeaders,
}: TCreateApi) => {
    let commonErrorCallbacks: TCommonErrorCallbacks = {
        onRepeatRequest: async <T>(executeRequest: () => Promise<T>) => executeRequest(),
        onNotAuthorized: async <T>(executeRequest: () => Promise<T>) => executeRequest(),
        onUpdateServerTimestamp: async <T>(executeRequest: () => Promise<T>) => executeRequest(),
        onPassAttestation: async <T>(executeRequest: () => Promise<T>) => executeRequest(),
        onTokenExpired: async <T>(executeRequest: () => Promise<T>) => executeRequest(),
    }

    const API_REQUEST_TIMEOUT = 15000

    const processRequest = async (
        url: string,
        config: TApiRequestApiConfig,
        params: TObject = {},
        specificHeaderParams: THeaderParams = [],
    ) => {
        const headers = await getAppHeaders(timestamp, [...headerParams, ...specificHeaderParams])
        const body =
            config.body && headers?.map?.['content-type'] !== 'multipart/form-data'
                ? toQueryString(config.body as Record<string, unknown>, false)
                : config.body || undefined

        const v = apiVersions[config.method as HttpMethod]?.[url as Endpoints]?.v
        const requestParams: any = {
            ...{ v },
            ...params,
            ...(token.get(url) ? { token: token.get(url) } : {}),
            ...(f.get() ? { f: f.get() } : {}),
        }

        const controller = new AbortController()
        const timeout = setTimeout(
            () => controller.abort(),
            config.requestTimeout || API_REQUEST_TIMEOUT,
        )

        const response = await fetch(getUrl({ url: endPoint + url, params: requestParams }), {
            ...config,
            headers,
            body: body as string | FormData | undefined,
            signal: controller.signal,
        })
        clearTimeout(timeout)

        if (logger.debugEnabled()) {
            logger.debug({
                body,
                headers: JSON.stringify(headers),
                method: config.method,
                params: JSON.stringify(requestParams),
                response: JSON.stringify(await response.clone().json()),
                status: response.status,
                url: endPoint + url,
            })
        }
        return checkRequestStatus({ res: response, url, returnJSON: config.returnJSON })
    }

    const wrapErrors = async <T>(executeRequest: () => Promise<T>, url: string): Promise<T> => {
        // Opened before the first attempt and closed once the request settles, retries included.
        // Kept outside `recoverErrors` so the recovery flow, awaited or not, stays as it was.
        const finishRequest = onRequest?.(url)

        try {
            return await recoverErrors(executeRequest, url)
        } finally {
            finishRequest?.()
        }
    }

    const recoverErrors = async <T>(executeRequest: () => Promise<T>, url: string): Promise<T> => {
        try {
            const tokenExpiresAt = token.getExpiresAt?.()
            if (
                token.get(url) &&
                typeof tokenExpiresAt === 'number' &&
                tokenExpiresAt < Date.now()
            ) {
                return commonErrorCallbacks.onTokenExpired(executeRequest)
            }

            const result = await executeRequest()
            return result as T
        } catch (error) {
            if (!(error instanceof Response)) {
                if (isNetworkError(error)) {
                    throw wrapNetworkError(error, url)
                }
                throw error
            }
            const response = error as Response
            let code: string | undefined
            try {
                code = (await response.clone().json()).code
                // eslint-disable-next-line no-empty
            } catch {}

            if (code === ApiErrorCodes.deviceAttestationFailed) {
                return (await commonErrorCallbacks.onPassAttestation(executeRequest)) as T
            }

            if (response.status === HandledAPIStatusCodes.notAthorized) {
                return (await commonErrorCallbacks.onNotAuthorized(executeRequest, error)) as T
            }

            if (response.status === HandledAPIStatusCodes.updateServerTime) {
                return (await commonErrorCallbacks.onUpdateServerTimestamp(executeRequest)) as T
            }

            if (response.status === HandledAPIStatusCodes.repeatRequest) {
                return (await commonErrorCallbacks.onRepeatRequest(executeRequest)) as T
            }

            throw error
        }
    }

    return {
        setCommonErrorCallbacks(callbacks: TCommonErrorCallbacks) {
            commonErrorCallbacks = callbacks
        },
        get<T>({ url, params = {}, headerParams = [], config = {} }: TGetProps) {
            const request = () =>
                processRequest(url, { ...config, method: 'GET' }, params, headerParams)
            return wrapErrors<T>(request, url)
        },
        post<T>({ url, payload = {}, requestTimeout, params = {}, headerParams = [] }: TPostProps) {
            return wrapErrors<T>(
                () =>
                    processRequest(
                        url,
                        { method: 'POST', requestTimeout, body: payload },
                        params,
                        headerParams,
                    ),
                url,
            )
        },
        put<T>({ url, payload = {}, params = {} }: TPostProps) {
            return wrapErrors<T>(
                () => processRequest(url, { method: 'PUT', body: payload }, params),
                url,
            )
        },
        delete<T>({ url, params = {} }: TGetProps) {
            return wrapErrors<T>(() => processRequest(url, { method: 'DELETE' }, params), url)
        },
        options<T>({ url, params = {}, headerParams = [] }: TGetProps) {
            return wrapErrors<T>(
                () => processRequest(url, { method: 'OPTIONS' }, params, headerParams),
                url,
            )
        },
        /**
         * Run a request that bypasses `fetch` (e.g. an XMLHttpRequest upload) through the same
         * 401 / 498 / attestation recovery as the methods above. `executeRequest` is re-invoked
         * on a retry, so it must build a fresh request each time.
         */
        recover<T>(executeRequest: () => Promise<T>, url: string) {
            return wrapErrors<T>(executeRequest, url)
        },
        handleError: createhandleAPIError(logger),
    }
}

/**
 * @example
 * const api = createApi({ endPoint: 'https://api.musescore.com/v2' })
 *
 * const updateServerTime = () => async dispatch => {
 *  const { timestamp } = await api.get<{ timestamp: number }>({ url: '/common/hello' })
 *  dispatch(updateServerTimestamp(timestamp))
 * }
 *
 * const refreshToken = () => async (dispatch, getState) => {
 *   const refreshToken = getRefreshToken(getState())
 *
 *   if (!refreshToken) {
 *     if (!isNoAuthState(getState())) {
 *         dispatch(logout())
 *     }
 *     return null
 *   }
 *
 *   const newLoginData = await api.post<{ refreshToken: string; token: string }>({
 *     url: '/auth/refresh',
 *     payload: { refresh_token: refreshToken },
 *     params: { device_id: '' },
 *   })
 *
 *   if (!newLoginData) {
 *     if (!isNoAuthState(getState())) {
 *         dispatch(logout())
 *     }
 *     return null
 *   }
 *
 *   if (newLoginData.refreshToken) {
 *     dispatch(changeRefreshToken(newLoginData.refreshToken))
 *   }
 *
 *   if (newLoginData.token) {
 *     dispatch(changeAuthToken(newLoginData.token))
 *   }
 * }
 *
 */
