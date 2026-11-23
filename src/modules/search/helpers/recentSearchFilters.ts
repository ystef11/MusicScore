import type {
    TFilterKey,
    TRecentSearchFilter,
    TRenderFilters,
    TSelectableFilterKey,
    TSelectedFilters,
} from '../types/searchTypes'

// Resolves the current filter selection into displayable entries (key + id +
// human-readable name) for the recent-searches history. Selections whose item
// can't be found in the catalog (e.g. stale ids) are silently dropped.
export const resolveSelectedFilterEntries = (
    filterParams: TRenderFilters | undefined,
    selectedFilters: TSelectedFilters | null,
): TRecentSearchFilter[] => {
    if (!filterParams || !selectedFilters) return []

    return Object.entries(selectedFilters).flatMap(([filterKey, selection]) => {
        const selectedIds = Object.entries(selection ?? {})
            .filter(([, value]) => !!value)
            .map(([itemId]) => itemId)
        if (!selectedIds.length) return []

        // Instruments nest one level deep — flatten so children resolve too.
        const items =
            filterParams[filterKey as TFilterKey]?.items?.flatMap(item => [
                item,
                ...(item.children ?? []),
            ]) ?? []

        return selectedIds.flatMap(itemId => {
            const item = items.find(candidate => String(candidate.id) === String(itemId))
            if (!item) return []
            return [
                {
                    filterKey: filterKey as TSelectableFilterKey,
                    itemId: String(item.id),
                    name: item.name,
                },
            ]
        })
    })
}
