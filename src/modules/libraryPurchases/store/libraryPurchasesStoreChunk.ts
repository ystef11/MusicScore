import { createExtendedStoreChunk } from '@ug/store'

/**
 * How long the "Checking for purchases" state stays on after a restore tap.
 * The backend check is async with no completion signal, so the client keeps
 * the spinner for a fixed window (surviving screen exits/revisits).
 */
export const RESTORE_CHECK_WINDOW_MS = 5 * 60 * 1000

type TLibraryPurchasesState = {
    /** Epoch ms of the last "Restore purchase" tap; null when no check is pending. */
    restoreRequestedAt: number | null
    /** Purchased-list total when the check started — a later increase means the restore delivered. */
    purchasedCountAtRequest: number | null
}

export const libraryPurchasesStoreChunk = createExtendedStoreChunk<TLibraryPurchasesState>({
    storeKey: 'libraryPurchases',
    treeKey: 'modules',
})({
    persist: [],
    initialState: {
        restoreRequestedAt: null,
        purchasedCountAtRequest: null,
    },
    actions: {
        startRestoreCheck: (payload: { requestedAt: number; purchasedCount: number | null }) => ({
            restoreRequestedAt: payload.requestedAt,
            purchasedCountAtRequest: payload.purchasedCount,
        }),
        finishRestoreCheck: () => ({
            restoreRequestedAt: null,
            purchasedCountAtRequest: null,
        }),
    },
})
