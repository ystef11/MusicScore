import type { TFilterKey, TRenderFilters, TSelectableFilterKey } from '../types/searchTypes'

// A pre-selected filter passed into a scores screen. Either an exact `itemId`
// (e.g. quiz level via its stable id) or a human `name` (e.g. an instrument or
// a genre card) — both are resolved against the loaded filter catalog.
export type TInitialFilter = {
    filterKey: TSelectableFilterKey
    itemId?: string
    name?: string
}

export type TResolvedInitialFilter = {
    key: string
    label: string
    filterKey: TSelectableFilterKey
    itemId: string
}

const normalize = (s: string) => s.trim().toLowerCase()

export function resolveInitialFilters(
    filterParams: TRenderFilters | undefined,
    initialFilters: TInitialFilter[] | undefined,
): TResolvedInitialFilter[] {
    if (!filterParams || !initialFilters) return []

    return initialFilters
        .map(initial => {
            const section = filterParams[initial.filterKey as TFilterKey]
            // Filters can be hierarchical (e.g. an instrument group with nested
            // children), so flatten one level before matching.
            const flattened = section?.items.flatMap(item => [item, ...(item.children ?? [])]) ?? []

            const targetName = initial.name ? normalize(initial.name) : undefined
            const found = flattened.find(item => {
                if (initial.itemId) return item.id === initial.itemId
                if (targetName) return normalize(item.name) === targetName
                return false
            })

            if (!found) return undefined

            return {
                key: `${initial.filterKey}:${found.id}`,
                label: found.name,
                filterKey: initial.filterKey,
                itemId: found.id,
            }
        })
        .filter((item): item is TResolvedInitialFilter => item !== undefined)
}
