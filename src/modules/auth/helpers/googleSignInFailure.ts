/**
 * Status codes from @react-native-google-signin, which surfaces the Play
 * Services ApiException as a string `code`. 7 and 8 describe the state of the
 * device and Google's own services, not anything the app did:
 *
 *   7  NETWORK_ERROR   — no route to Google while signing in
 *   8  INTERNAL_ERROR  — Play Services failed on its own side
 *
 * Everything else (12500, a non-recoverable sign-in failure, above all) stays
 * worth reporting: those point at configuration or at the account.
 */
const NETWORK_ERROR = '7'
const INTERNAL_ERROR = '8'

const readCode = (error: unknown): string =>
    String((error as { code?: unknown } | null)?.code ?? '')

export const isGoogleSignInNetworkError = (error: unknown): boolean =>
    readCode(error) === NETWORK_ERROR

export const isTransientGoogleSignInError = (error: unknown): boolean => {
    const code = readCode(error)

    return code === NETWORK_ERROR || code === INTERNAL_ERROR
}
