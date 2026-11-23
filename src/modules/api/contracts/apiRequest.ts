import type { THeaderParams } from '@muse-native/api'
import * as Sentry from '../../../App/Utils/Sentry'

import { getApi } from '../api'

import type {
    TAnyContract,
    TContractInput,
    TContractResult,
    TMultipartFields,
    TPayload,
    TQueryParams,
} from './defineContract'
import { uploadMultipart } from './multipartUpload'
import { readPaginationHeaders } from './pagination'

const isDev = __DEV__

export class ContractViolationError extends Error {
    constructor(contract: TAnyContract, cause: unknown) {
        super(`API response violates contract ${contract.method} ${contract.url}`, { cause })
        this.name = 'ContractViolationError'
    }
}

/**
 * Runtime check policy: a developer must see a broken contract immediately, a user must not.
 * Dev builds throw; production reports to Sentry and hands the raw body on unchanged.
 */
function applyParse<C extends TAnyContract>(contract: C, raw: unknown) {
    if (!contract.parse) return raw
    try {
        return contract.parse(raw)
    } catch (cause) {
        const error = new ContractViolationError(contract, cause)
        if (isDev) throw error
        Sentry.captureException(error, {
            tags: { apiContract: `${contract.method} ${contract.url}` },
        })
        return raw
    }
}

type TRequestExtras = {
    /** Per-request headers, same as the `headerParams` of the underlying client. */
    headerParams?: THeaderParams
    requestTimeout?: number
    /** Upload progress 0..1; only a multipart contract (`defineContract.upload`) reports it. */
    onProgress?: (progress: number) => void
}

type TResolvedInput = { params?: TQueryParams; payload?: TPayload | TMultipartFields }

/** The input argument is optional when the contract declares neither params nor payload. */
type TRequestArgs<C extends TAnyContract> = keyof TContractInput<C> extends never
    ? [input?: TRequestExtras]
    : [input: TContractInput<C> & TRequestExtras]

/**
 * Execute a contract. Both sides are checked at compile time: `input` must match the declared
 * params/payload exactly, the result is the declared response (wrapped in `{ data, pagination }`
 * for paginated contracts).
 */
export async function apiRequest<C extends TAnyContract>(
    contract: C,
    ...args: TRequestArgs<C>
): Promise<TContractResult<C>> {
    const input = (args[0] ?? {}) as TResolvedInput & TRequestExtras
    const { params, payload, headerParams, requestTimeout, onProgress } = input

    if (contract.multipart) {
        const raw = await uploadMultipart(contract, (payload ?? {}) as TMultipartFields, {
            onProgress,
            requestTimeout,
        })
        return applyParse(contract, raw) as TContractResult<C>
    }

    const api = getApi()
    const request = { url: contract.url, params, headerParams }

    if (contract.paginated) {
        if (contract.method !== 'GET') {
            throw new Error(`Paginated contract ${contract.url} must be a GET`)
        }
        const response = await api.get<Response>({ ...request, config: { returnJSON: false } })
        const data = applyParse(contract, await response.json())
        return {
            data,
            pagination: readPaginationHeaders(response.headers),
        } as TContractResult<C>
    }

    let raw: unknown
    switch (contract.method) {
        case 'GET':
            raw = await api.get<unknown>(request)
            break
        case 'OPTIONS':
            raw = await api.options<unknown>(request)
            break
        case 'DELETE':
            raw = await api.delete<unknown>(request)
            break
        case 'POST':
            raw = await api.post<unknown>({ ...request, payload, requestTimeout })
            break
        case 'PUT':
            raw = await api.put<unknown>({ ...request, payload })
            break
        default:
            throw new Error(`Unsupported method ${String(contract.method)}`)
    }
    return applyParse(contract, raw) as TContractResult<C>
}
