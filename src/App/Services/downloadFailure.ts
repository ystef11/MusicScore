type TDownloadFailure = {
    id: number
    statusCode: number | undefined
    url: string | undefined
}

/**
 * `Error download scoreId: <id>` used to be the whole story, which made
 * IOS-4NRP and ANDROID-15S8 undiagnosable: 3.1k users, no status, no url. The
 * description goes into the error's `cause`, which SentryUtils forwards as
 * extra, so the message (and therefore the issue grouping) stays as it was.
 *
 * Score file urls are signed — the query string is dropped rather than reported.
 */
export const describeDownloadFailure = ({ id, statusCode, url }: TDownloadFailure): string => {
    const status = statusCode ?? 'none'
    const location = url ? url.split('?')[0] : 'unknown'

    return `status[${status}] ${id} ${location}`
}

/**
 * iOS reports a dead transport with a localized message — the same failure reads
 * `要求逾時。`, `Se ha agotado el tiempo de espera.` or `リクエストがタイムアウトになりました。` —
 * so text matching can never cover it. RNFS names those errors
 * `<domain>:<code>` (RNFSException.mm), and NSURLErrorDomain is transport-only:
 * file failures arrive as NSCocoaErrorDomain or the library's own `RNFS` domain.
 *
 * Android rejects every failure under one code and keeps the Java text, which is
 * English, so there it has to be the message.
 */
const androidTransportText = [
    'timeout',
    'timed out',
    'connection closed',
    'failure in ssl library',
    'failed to connect',
    'unable to resolve host',
    'connection reset',
    'software caused connection abort',
    'unexpected end of stream',
]

export const isTransportFailure = (error: unknown): boolean => {
    const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown }

    if (String(code ?? '').startsWith('NSURLErrorDomain:')) return true

    const text = String(message ?? '').toLowerCase()

    return androidTransportText.some(signature => text.includes(signature))
}
