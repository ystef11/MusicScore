/**
 * Tapping to focus while a focus is already running cancels the first one, and
 * vision-camera rejects it: `capture/focus-canceled`, "The focus operation has
 * been canceled by a new focus request." Nothing failed — the user tapped again.
 */
export const isFocusCancelled = (error: unknown): boolean =>
    (error as { code?: unknown } | null)?.code === 'capture/focus-canceled'
