import { Alert } from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'

import { store } from '@mu-native/common'
import { debugStore } from '@mu-native/debug'
import { translate } from '@mu-native/locale'
import { getUrl } from '@muse/url/native'
import {
    apiEndpoints,
    ApiErrorCodes,
    apiVersions,
    createApi,
    errorMessage,
    HttpMethod,
    isNetworkError,
    isResponse,
    responseCode,
    THeaderParams,
} from '@muse-native/api'

import { apiConstants } from './constants/apiConstants'
import { requestWithAttestation } from './helpers/appCheckAttestation'
import { getMuseAppHeaders } from './helpers/getMuseAppHeaders'
import { decideNotAuthorized, sessionExpiredError } from './helpers/notAuthorized'
import { notifyRequestStart } from './helpers/requestObserver'
import {
    attestApp,
    reportAttestationAutoRetry,
    updateTimestampService,
} from './services/apiServices'
import { apiStoreChunk, getServerTimestamp } from './store/apiStoreChunk'

export { isResponse, responseCode, ApiErrorCodes, errorMessage, isNetworkError }
export { apiEndpoints } from '@muse-native/api'

type TParams = {
    f: { get(): string | null }
    token: {
        get(urlPath?: string): string | null
        getExpiresAt?: () => number | null
        getRefresh(): string | null
        set(token: string | null): void
        setRefresh(refreshToken: string | null): void
        // eslint-disable-next-line camelcase
        requestRefresh(refreshToken: string): Promise<void>
        /** Ends a session that cannot be refreshed. */
        endSession?(): void
    }
    headerParams: THeaderParams
}

let api: ReturnType<typeof createApi>
let transport: Pick<TParams, 'token' | 'headerParams'> | undefined

export const getApi = () => {
    if (!api) {
        throw new Error('getApi', { cause: "API wasn't configured yet" })
    }

    return api
}

/**
 * URL and headers for a request that bypasses `fetch` (the multipart upload runs on
 * XMLHttpRequest for progress events). Same version, token, attestation and app headers
 * as `getApi()` would send, signed with the live server clock so a long-open screen
 * does not submit an hour-old API key.
 */
export const prepareRawRequest = async (
    method: HttpMethod,
    url: string,
    headerParams: THeaderParams = [],
) => {
    if (!transport) {
        throw new Error('prepareRawRequest', { cause: "API wasn't configured yet" })
    }
    const state = store.getState()
    const token = transport.token.get(url)
    const f = apiStoreChunk.props.getF(state)
    const headers = await getMuseAppHeaders({ get: () => getServerTimestamp(state) }, [
        ...transport.headerParams,
        ...headerParams,
    ])

    return {
        url: getUrl({
            url: apiBaseUrl + url,
            params: {
                v: apiVersions[method]?.[url as keyof (typeof apiVersions)[HttpMethod]]?.v,
                ...(token ? { token } : {}),
                ...(f ? { f } : {}),
            },
        }),
        headers,
    }
}

export const handleError = (error: unknown) => {
    try {
        api.handleError({})(error)
    } catch (error) {
        console.log('HANDLE ERROR', error)
    }
}

export const showApiAlertError = (
    error: { message?: string; messageTitle?: string } | undefined,
) => {
    if (!error) return
    if ('message' in error) {
        const { messageTitle = translate('native.alerts.error_title') } = error
        Alert.alert(messageTitle, error.message)
    }
}

type TApiLaunchArguments = {
    apiBaseUrl?: string
}

const apiBaseUrlFromLaunchArgs = LaunchArguments.value<TApiLaunchArguments>().apiBaseUrl

const apiBaseUrl = apiBaseUrlFromLaunchArgs ?? apiConstants.apiProdUrl

export const setupApi = ({ token, headerParams }: Pick<TParams, 'token' | 'headerParams'>) => {
    transport = { token, headerParams }
    api = createApi({
        endPoint: apiBaseUrl,
        // endPoint: apiConstants.apiVPSUrl,
        f: { get: () => apiStoreChunk.props.getF(store.getState()) },
        logger: {
            debug: request => {
                if (debugStore.props.getIsEnabled(store.getState())) {
                    store.dispatch(debugStore.actions.addApi(request))
                }
            },
            debugEnabled: () => debugStore.props.getIsEnabled(store.getState()),
            error: async error => {
                try {
                    console.log('[Api.error]', error)
                    if (error instanceof Response) {
                        console.log('API ERROR', await (error as Response).json())
                    } else {
                        console.log('API ERROR', error)
                    }
                } catch (e: any) {
                    console.log('[Api.error.error]', e)
                }
            },
        },
        onRequest: notifyRequestStart,
        timestamp: { get: () => getServerTimestamp(store.getState()) },
        token,
        headerParams,
        getAppHeaders: getMuseAppHeaders,
    })

    api.setCommonErrorCallbacks({
        async onRepeatRequest(executeRequest) {
            await new Promise(res => {
                setTimeout(res, 5000)
            })

            return executeRequest()
        },
        async onNotAuthorized(executeRequest, errorResponse) {
            if (errorResponse?.url && [apiEndpoints.authRefresh, apiEndpoints.authLogin, apiEndpoints.authOauth].some(path => errorResponse.url.includes(path))) {
                throw errorResponse
            }
            const currentRefreshToken = token.getRefresh()
            const action = decideNotAuthorized({
                accessToken: token.get(),
                refreshToken: currentRefreshToken,
            })

            if (action !== 'refresh') {
                // Only a session that still holds an access token has anything
                // to end; without one the request was simply unauthenticated,
                // and ending it again would show the force-logout screen twice.
                if (action === 'endSession') token.endSession?.()
                throw sessionExpiredError()
            }

            await token.requestRefresh(currentRefreshToken as string)
            return executeRequest()
        },
        async onUpdateServerTimestamp(executeRequest) {
            const response = await updateTimestampService()
            store.dispatch(apiStoreChunk.actions.setServerTimestamp(response.timestamp * 1000))

            return executeRequest()
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        async onPassAttestation(executeRequest: () => Promise<unknown>) {
            return requestWithAttestation({
                attest: attestApp,
                request: executeRequest,
                isRejected: async error =>
                    isResponse(error) &&
                    (await responseCode(error)) === ApiErrorCodes.deviceAttestationFailed,
                onRepeated: reportAttestationAutoRetry('backend'),
            })
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        async onTokenExpired(executeRequest: () => Promise<unknown>) {
            const currentRefreshToken = token.getRefresh()
            if (!currentRefreshToken) return null

            await token.requestRefresh(currentRefreshToken)
            return executeRequest()
        },
    })
}
