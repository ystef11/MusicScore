import { apiRequest, libraryContracts } from '@mu-native/api'
import type { TLibraryResyncDto } from '@mu-native/api'

/**
 * POST /v2/library/resync (MUP-13967) — asks the backend to re-pull external
 * SMP/SMD purchases for the current user (lost webhook, score published after
 * the sale, refunds).
 *
 * Contract notes (backend memo 2026-08-10):
 * - fire-and-forget: the backend only queues a background pass and never
 *   returns a result — always `{"status":"queued"}`, even when there is
 *   nothing to pick up. The client refetches the purchased tab afterwards.
 * - no SLA: don't await delivery on a fixed timeout; the purchased tab and
 *   pull-to-refresh pick up whatever the pass grants.
 * - rate limited to 1 request per sliding hour per user → HTTP 429.
 * - for unactivated accounts (unverified email, banned, consents) the call
 *   still answers `queued` and BURNS the hourly limit while doing nothing —
 *   the restore UI must be hidden until the email is verified.
 */
export type TLibraryResyncResponse = TLibraryResyncDto

export const restoreLibraryPurchasesRequest = () => apiRequest(libraryContracts.resync)
