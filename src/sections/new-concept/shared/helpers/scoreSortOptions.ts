import { type TCommonRenderSort } from '@mu-native/search'

const capitalizeFirst = (text: string): string =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

// Maps the score sort catalog to FloatingMenu options, using the capitalized
// catalog name as the label. Hardcoded EN capitalization is the new-concept
// experiment convention — deliberately not the locale keys.
export const buildScoreSortOptions = (
    sortParams: TCommonRenderSort | null | undefined,
): { id: string; label: string }[] =>
    (sortParams ?? []).map(item => ({ id: item.id, label: capitalizeFirst(item.name) }))
