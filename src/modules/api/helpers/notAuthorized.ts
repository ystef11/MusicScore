export type TNotAuthorizedAction = 'refresh' | 'endSession' | 'reject'

/**
 * A session holding an access token but no refresh token cannot recover: every
 * request answers 401 and there is nothing to refresh with. It has to end, the
 * way an expired refresh token already ends it.
 */
export const decideNotAuthorized = ({
    accessToken,
    refreshToken,
}: {
    accessToken?: string | null
    refreshToken?: string | null
}): TNotAuthorizedAction => {
    if (refreshToken) return 'refresh'

    return accessToken ? 'endSession' : 'reject'
}

/**
 * The text stays "Not authorized." — commentActionsAsync and authServices match
 * on it. The flag is what keeps the report out of Sentry.
 */
export const sessionExpiredError = () =>
    Object.assign(new Error('Not authorized.'), { sessionExpired: true })

export const isSessionExpiredError = (error: unknown): boolean =>
    Boolean((error as { sessionExpired?: boolean } | null)?.sessionExpired)
