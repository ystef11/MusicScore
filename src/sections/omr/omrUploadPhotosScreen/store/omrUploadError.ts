/**
 * A non-2xx OMR upload body can be whatever the edge served — an HTML error page
 * included. Parsing it without a guard threw a SyntaxError from inside the catch,
 * which escaped the thunk entirely.
 */
export const omrUploadErrorMessage = (error: unknown): string | undefined => {
    if (typeof error !== 'string') return undefined

    try {
        const parsed = JSON.parse(error)
        const message = parsed?.error?.message ?? parsed?.message

        return typeof message === 'string' && message.length > 0 ? message : undefined
    } catch {
        return undefined
    }
}
