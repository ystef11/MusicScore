/** Response bodies carry the reason a request was refused; cap it so a stray
 *  HTML error page can't blow up the mailto URL a bug report is sent through. */
const MAX_BODY_CHARS = 1000

/**
 * A failed request reaches error reporting as a Response, and JSON.stringify on
 * one yields only its envelope — status, headers, `bodyUsed: false` — while the
 * body that says WHY it was refused is dropped (MUP-14110). Read the body out
 * so the report carries the reason.
 */
export const describeError = async (error: unknown): Promise<string> => {
    if (!(error instanceof Response)) return JSON.stringify(error)

    let body: string
    try {
        body = (await error.clone().text()).slice(0, MAX_BODY_CHARS)
    } catch (e) {
        body = `<unreadable: ${(e as Error)?.message ?? 'unknown'}>`
    }

    return JSON.stringify({ status: error.status, url: error.url, body })
}
