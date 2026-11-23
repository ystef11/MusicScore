/**
 * `Linking.canOpenURL` does not answer `false` for an empty string — it throws
 * `Invariant Violation: Invalid URL: cannot be empty` synchronously, from inside
 * whatever handler called it. Call sites pass URLs the backend built for them,
 * so an absent one has to be recognised before RN sees it.
 */
export const isOpenableUrl = (url: unknown): url is string =>
    typeof url === 'string' && url.trim().length > 0
