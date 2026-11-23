/**
 * Cancelling the system picker is a normal thing to do, but the module reports it
 * as a rejected promise: `OPERATION_CANCELED` on both platforms
 * (@react-native-documents/picker, PromiseWrapper.swift and PromiseWrapper.java).
 * Read the code rather than the message — the message is a native string and
 * nothing guarantees it stays the same.
 */
export const isPickerCancelled = (error: unknown): boolean =>
    (error as { code?: unknown } | null)?.code === 'OPERATION_CANCELED'
