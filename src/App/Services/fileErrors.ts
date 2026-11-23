const NOT_FOUND_SIGNATURES = ['ENOENT', 'no such file', 'does not exist']

/**
 * RNFS reports a missing file as an `ENOENT` code on Android and as plain text
 * in the message on iOS, so both have to be read.
 */
export const isFileNotFoundError = (error: unknown): boolean => {
    if (!error) return false

    const { code, message } = error as { code?: unknown; message?: unknown }
    if (code === 'ENOENT') return true

    const text = typeof error === 'string' ? error : String(message ?? '')

    return NOT_FOUND_SIGNATURES.some(signature => text.includes(signature))
}
