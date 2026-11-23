/**
 * Forward-compat block reading (§1.3 / §1.4).
 *
 * The set of response keys is stable: a known block always arrives — even when
 * empty (`items: []`) or when it failed to assemble server-side (also `items: []`,
 * indistinguishable from empty by design). A missing key means only "block
 * unknown to this client version" → silently skipped. `readBlock` collapses all
 * of these into one safe shape so callers never branch on presence.
 */
import type { TApiBlock, TApiFilterChip, TApiMeta } from './types'

export type TReadBlock<TItem> = {
    items: TItem[]
    /** Teaser "(N)" — falls back to `items.length` when the block omits it. */
    totalCount: number
    /** Present only on paged blocks. */
    meta?: TApiMeta
    /** Preset query for a single-preset "View all". */
    params?: Record<string, unknown>
    /** Chip row for a filterable block. */
    filters: TApiFilterChip[]
}

const EMPTY: TReadBlock<never> = { items: [], totalCount: 0, filters: [] }

/**
 * Normalize a block envelope. Missing key, empty block and failed block all
 * resolve to `{ items: [] }` — the client treats them identically.
 */
export const readBlock = <TItem>(block: TApiBlock<TItem> | undefined): TReadBlock<TItem> => {
    if (!block || !Array.isArray(block.items)) return EMPTY
    return {
        items: block.items,
        totalCount: block.total_count ?? block.items.length,
        meta: block._meta,
        params: block.params,
        filters: Array.isArray(block.filters) ? block.filters : [],
    }
}
