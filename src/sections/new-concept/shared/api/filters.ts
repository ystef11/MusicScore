/**
 * Turn a v2 filter-chip / block `params` dict into search seed filters (§2.4, §3).
 *
 * A chip's `params` is a ready `GET /score/search` query — genre item ids are the
 * stable slug keys ("classical"), instrument/complexity ids are numeric. Both are
 * exactly the `itemId`s the filter-selection store uses, so no catalog lookup is
 * needed: each `{ key: [v, …] }` becomes `{ filterKey: key, itemId: v }`.
 */
import type { TSelectableFilterKey } from '@mu-native/search'

export type TSeedFilter = { filterKey: TSelectableFilterKey; itemId: string | number }

const toFilterKey = (paramKey: string): TSelectableFilterKey =>
    // Strip a trailing `[]` (§4 lists `genres[]`/`instrument[]`); keys are already
    // camelCase for the selectable filters we replay (genres/instrument/complexity).
    paramKey.replace(/\[\]$/, '') as TSelectableFilterKey

export const v2ParamsToSeedFilters = (
    params: Record<string, unknown> | undefined,
): TSeedFilter[] => {
    if (!params) return []
    const seeds: TSeedFilter[] = []
    Object.entries(params).forEach(([paramKey, value]) => {
        const filterKey = toFilterKey(paramKey)
        const values = Array.isArray(value) ? value : [value]
        values.forEach(item => {
            if (item != null) seeds.push({ filterKey, itemId: item as string | number })
        })
    })
    return seeds
}
