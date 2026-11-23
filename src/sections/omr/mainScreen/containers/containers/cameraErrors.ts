const codeOf = (error: unknown) => (error as { code?: unknown } | null)?.code

/**
 * The OS took the camera away — another app holds it, or a policy restricts it
 * (often right after the app went to background). Nothing to fix on our side.
 */
const UNAVAILABLE_CODES = [
    'device/camera-already-in-use',
    'system/camera-is-restricted',
    'system/max-cameras-in-use',
]

export const isCameraUnavailable = (error: unknown): boolean =>
    UNAVAILABLE_CODES.includes(codeOf(error) as string)

/**
 * `supportsFocus` is computed for the centre of the frame only; a tap outside the
 * autofocus area is refused with `device/focus-not-supported`. The user sees
 * nothing either way.
 */
export const isFocusUnsupported = (error: unknown): boolean =>
    codeOf(error) === 'device/focus-not-supported'
