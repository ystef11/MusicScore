import * as fs from '@dr.pogodin/react-native-fs'

import { getApi, prepareRawRequest } from '../api'

import type { TAnyContract, TMultipartFields, TMultipartFile } from './defineContract'

const DEFAULT_UPLOAD_TIMEOUT_MS = 45000

export type TUploadOptions = {
    onProgress?: (progress: number) => void
    requestTimeout?: number
}

const isFile = (value: unknown): value is TMultipartFile =>
    typeof value === 'object' && value !== null && 'uri' in value

/** Arrays repeat the field name (`files[]`, or several `file` parts); everything else is one part. */
export const buildFormData = (fields: TMultipartFields): FormData => {
    const formData = new FormData()
    Object.entries(fields).forEach(([name, value]) => {
        const parts = Array.isArray(value) ? value : [value]
        parts.forEach(part => {
            if (part === undefined) return
            // React Native's FormData takes { uri, name, type } for a file part.
            formData.append(name, isFile(part) ? (part as unknown as Blob) : String(part))
        })
    })
    return formData
}

// iOS networking only logs an unreadable file part and never reports back to JS: the XHR
// would hang without firing load, error or timeout.
const assertFilePartsExist = async (fields: TMultipartFields) => {
    const uris = Object.values(fields)
        .flatMap(value => (Array.isArray(value) ? value : [value]))
        .filter(isFile)
        .map(part => part.uri)
        .filter(uri => uri.startsWith('file://') || uri.startsWith('/'))
    const exists = await Promise.all(uris.map(uri => fs.exists(uri)))
    const missing = uris.filter((_, i) => !exists[i])
    if (missing.length) {
        throw new Error('Upload file not found', { cause: missing.join(', ') })
    }
}

const sendOnce = async (
    contract: TAnyContract,
    fields: TMultipartFields,
    { onProgress, requestTimeout = DEFAULT_UPLOAD_TIMEOUT_MS }: TUploadOptions,
): Promise<unknown> => {
    const { url, headers } = await prepareRawRequest(contract.method, contract.url)
    const formData = buildFormData(fields)

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(contract.method, url)
        headers.forEach((value, key) => {
            // XHR sets the multipart boundary itself; a preset Content-Type would drop it.
            if (key.toLowerCase() !== 'content-type') xhr.setRequestHeader(key, value)
        })
        xhr.timeout = requestTimeout

        if (onProgress) {
            xhr.upload.onprogress = event => {
                if (event.lengthComputable) onProgress(event.loaded / event.total)
            }
        }
        xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300) {
                reject(new Response(xhr.responseText, { status: xhr.status }))
                return
            }
            try {
                resolve(JSON.parse(xhr.responseText))
            } catch {
                reject(
                    new Error('ApiErrorParseJSON', {
                        cause: `Failed to parse JSON for url: ${contract.url}`,
                    }),
                )
            }
        }
        xhr.onerror = () => reject(new Error('Network request failed'))
        xhr.ontimeout = () => reject(new Error('Upload timeout'))
        xhr.send(formData)
    })
}

/**
 * Multipart POST over XMLHttpRequest: `fetch` has no upload progress. Runs through the api
 * client's recovery, so an expired token, a stale server clock (498) or a failed attestation
 * is repaired and the upload re-sent with a freshly signed request. Rejects with a `Response`
 * on any other non-2xx status so callers keep using `isResponse` / `responseCode`.
 */
export const uploadMultipart = async (
    contract: TAnyContract,
    fields: TMultipartFields,
    options: TUploadOptions = {},
): Promise<unknown> => {
    await assertFilePartsExist(fields)
    return getApi().recover(() => sendOnce(contract, fields, options), contract.url)
}
