// Imported from the file, not the package index: the index pulls the fetch client and its
// react-native dependencies, which Jest cannot load.
import { apiVersions } from '../../muse-native-api/apiMethods'
import type { Endpoints, HttpMethod } from '../../muse-native-api/apiMethods'

/** Query-string params. Arrays become repeated keys, `undefined` values are dropped. */
export type TQueryParams = Record<string, unknown>
/** Request body. Objects are form-encoded by the client; a multipart contract takes `TMultipartFields`. */
export type TPayload = Record<string, unknown>

/** One file part of a multipart body, in the shape React Native's FormData accepts. */
export type TMultipartFile = { uri: string; name: string; type: string }
/** Multipart fields: a file, several files under one name (`files[]`), or a plain string. */
export type TMultipartFields = Record<
    string,
    string | TMultipartFile | TMultipartFile[] | undefined
>

export type TPagination = {
    currentPage: number
    totalPages: number
    totalItems: number
}

/** Result of a `paginated` contract: the parsed body plus the `X-Pagination-*` headers. */
export type TPaginatedResult<TResponse> = {
    data: TResponse
    pagination: TPagination
}

/**
 * One API operation: method, endpoint, pinned API version and the wire types on both sides.
 *
 * `TParams` / `TPayload` are `void` when the operation takes none; the phantom `_params` /
 * `_payload` members only carry the types and are never set at runtime.
 */
export type TApiContract<
    TParams extends TQueryParams | void = void,
    TBody extends TPayload | void = void,
    TResponse = unknown,
    TPaginated extends boolean = false,
> = {
    readonly method: HttpMethod
    readonly url: Endpoints
    /**
     * The `v` pinned in `apiVersions` for this method + url, or `null` when the endpoint is
     * unversioned. Mismatches throw in dev and fail `contracts.test.ts`: the DTO describes
     * one version of the wire shape, so bumping `v` must revisit the contract.
     */
    readonly version: string | null
    readonly paginated: TPaginated
    /** Body is sent as multipart/form-data over XMLHttpRequest (upload progress); see `defineContract.upload`. */
    readonly multipart: boolean
    /**
     * Optional runtime check of the body. Throw to signal a contract violation: rethrown in dev,
     * reported to Sentry and the raw body returned in production.
     */
    readonly parse?: (raw: unknown) => TResponse
    readonly _params?: TParams
    readonly _payload?: TBody
    readonly _response?: TResponse
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TAnyContract = TApiContract<any, any, any, boolean>

export type TContractParams<C extends TAnyContract> =
    C extends TApiContract<infer P, infer _B, infer _R, infer _G> ? P : never
export type TContractPayload<C extends TAnyContract> =
    C extends TApiContract<infer _P, infer B, infer _R, infer _G> ? B : never
export type TContractResponse<C extends TAnyContract> =
    C extends TApiContract<infer _P, infer _B, infer R, infer _G> ? R : never
export type TContractResult<C extends TAnyContract> =
    C extends TApiContract<infer _P, infer _B, infer R, infer G>
        ? G extends true
            ? TPaginatedResult<R>
            : R
        : never

/** Call-site input: `params` and/or `payload`, each present only when the contract declares it. */
export type TContractInput<C extends TAnyContract> = (TContractParams<C> extends void
    ? unknown
    : { params: TContractParams<C> }) &
    (TContractPayload<C> extends void ? unknown : { payload: TContractPayload<C> })

type TContractOptions<TResponse> = {
    version: string | null
    /** Read the `X-Pagination-*` headers too; `apiRequest` then returns `{ data, pagination }`. */
    paginated?: boolean
    parse?: (raw: unknown) => TResponse
}

type TPaginatedOptions<TResponse> = TContractOptions<TResponse> & { paginated: true }
type TPlainOptions<TResponse> = TContractOptions<TResponse> & { paginated?: false }
type TUploadContractOptions<TResponse> = Omit<TContractOptions<TResponse>, 'paginated'>

const registry = new Map<string, TAnyContract>()

const contractKey = (method: HttpMethod, url: string) => `${method} ${url}`

const isDev = __DEV__

export const getPinnedVersion = (method: HttpMethod, url: Endpoints): string | null =>
    apiVersions[method]?.[url]?.v ?? null

/** Contracts registered so far, for consistency tests. */
export const getRegisteredContracts = (): readonly TAnyContract[] => [...registry.values()]

export function contractConsistencyError(contract: TAnyContract): string | null {
    const pinned = getPinnedVersion(contract.method, contract.url)
    if (pinned !== contract.version) {
        return (
            `Contract ${contractKey(contract.method, contract.url)} declares version ` +
            `${JSON.stringify(contract.version)} but apiVersions pins ${JSON.stringify(pinned)}. ` +
            'Re-check the DTO against the new response shape, then update the contract version.'
        )
    }
    return null
}

function register<C extends TAnyContract>(contract: C): C {
    const key = contractKey(contract.method, contract.url)
    if (isDev) {
        if (registry.has(key)) {
            throw new Error(`Contract ${key} is defined twice`)
        }
        const error = contractConsistencyError(contract)
        if (error) throw new Error(error)
    }
    registry.set(key, contract)
    return contract
}

function define<
    TParams extends TQueryParams | void,
    TBody extends TPayload | void,
    TResponse,
    TPaginated extends boolean,
>(
    method: HttpMethod,
    url: Endpoints,
    { version, parse }: TContractOptions<TResponse>,
    paginated: TPaginated,
    multipart = false,
): TApiContract<TParams, TBody, TResponse, TPaginated> {
    return register({ method, url, version, paginated, multipart, parse })
}

/**
 * Whether the contract is paginated is read from the `paginated` option, so the result type
 * (`{ data, pagination }` or the bare body) always matches what `apiRequest` does at runtime.
 */
function reader(method: HttpMethod) {
    function contract<TResponse, TParams extends TQueryParams | void = void>(
        url: Endpoints,
        options: TPaginatedOptions<TResponse>,
    ): TApiContract<TParams, void, TResponse, true>
    function contract<TResponse, TParams extends TQueryParams | void = void>(
        url: Endpoints,
        options: TPlainOptions<TResponse>,
    ): TApiContract<TParams, void, TResponse, false>
    function contract<TResponse, TParams extends TQueryParams | void = void>(
        url: Endpoints,
        options: TContractOptions<TResponse>,
    ) {
        return define<TParams, void, TResponse, boolean>(
            method,
            url,
            options,
            options.paginated === true,
        )
    }
    return contract
}

function writer(method: HttpMethod) {
    function contract<
        TResponse,
        TBody extends TPayload | void = void,
        TParams extends TQueryParams | void = void,
    >(
        url: Endpoints,
        options: TPaginatedOptions<TResponse>,
    ): TApiContract<TParams, TBody, TResponse, true>
    function contract<
        TResponse,
        TBody extends TPayload | void = void,
        TParams extends TQueryParams | void = void,
    >(
        url: Endpoints,
        options: TPlainOptions<TResponse>,
    ): TApiContract<TParams, TBody, TResponse, false>
    function contract<
        TResponse,
        TBody extends TPayload | void = void,
        TParams extends TQueryParams | void = void,
    >(url: Endpoints, options: TContractOptions<TResponse>) {
        return define<TParams, TBody, TResponse, boolean>(
            method,
            url,
            options,
            options.paginated === true,
        )
    }
    return contract
}

/**
 * Declare an API operation. Type arguments carry the contract; the object argument carries
 * the runtime facts. Response first, then params (and payload for writes):
 *
 * ```ts
 * export const scoreInfo = defineContract.get<TScoreInfoDto, { id: number; usage: string }>(
 *     apiEndpoints.scoreInfo,
 *     { version: '1.4' },
 * )
 * ```
 */
export const defineContract = {
    get: reader('GET'),
    options: reader('OPTIONS'),
    delete: reader('DELETE'),
    post: writer('POST'),
    put: writer('PUT'),
    /**
     * Multipart POST. `TFields` names every part; `apiRequest` builds the FormData, sends it
     * over XMLHttpRequest and reports `onProgress` (0..1).
     */
    upload<TResponse, TFields extends TMultipartFields>(
        url: Endpoints,
        options: TUploadContractOptions<TResponse>,
    ) {
        return define<void, TFields, TResponse, false>('POST', url, options, false, true)
    },
}
