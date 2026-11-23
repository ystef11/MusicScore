import { quizConstants } from '@mu-native/quiz'
import {
    resolveSelectedFilterEntries,
    type TRenderFilters,
    type TSelectableFilterKey,
    type TSelectedFilters,
} from '@mu-native/search'

type TFilterItem = TRenderFilters['instrument']['items'][number]

export type TQuickFilter = {
    key: string
    label: string
    filterKey: TSelectableFilterKey
    itemId: string
    isSelected: boolean
}

type TQuizItem = {
    id: number
    oldId?: number
    title: string
}

const instrumentItems: TQuizItem[] = quizConstants.instrumentList.answers.flatMap(
    section => section.data as TQuizItem[],
)
const genreItems: TQuizItem[] = quizConstants.genreList.answers as TQuizItem[]
const levelItems: TQuizItem[] = quizConstants.levelsList.answers as TQuizItem[]

const normalize = (s: string) => s.trim().toLowerCase()

const capitalizeFirst = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

// Currently-applied filters as selected chips, so a search arrived at with
// filters (e.g. from a recent search) shows them as applied — not just in the
// results. Names are resolved from the catalog and sentence-cased.
export function buildAppliedFilterChips(
    filters: TRenderFilters | undefined,
    selectedFilters: TSelectedFilters | null,
): TQuickFilter[] {
    return resolveSelectedFilterEntries(filters, selectedFilters).map(entry => ({
        key: `${entry.filterKey}:${entry.itemId}`,
        label: capitalizeFirst(entry.name),
        filterKey: entry.filterKey,
        itemId: entry.itemId,
        isSelected: true,
    }))
}

export function findFilterItemByName(
    sectionItems: TFilterItem[] | undefined,
    name: string,
): TFilterItem | undefined {
    if (!sectionItems) return undefined
    const target = normalize(name)
    // Instrument filters are hierarchical: `items` holds only the top-level
    // groups, with specific instruments (e.g. Piano under Keyboards) nested in
    // `children`. Flatten both levels so quiz instruments resolve to a filter id.
    const flattened = sectionItems.flatMap(item => [item, ...(item.children ?? [])])
    return flattened.find(item => normalize(item.name) === target)
}

function findFilterItemById(
    sectionItems: TFilterItem[] | undefined,
    id: string,
): TFilterItem | undefined {
    return sectionItems?.find(item => item.id === id)
}

function isSelected(
    selectedFilters: TSelectedFilters | null,
    filterKey: TSelectableFilterKey,
    itemId: string,
): boolean {
    return !!selectedFilters?.[filterKey]?.[itemId]
}

export function buildQuizQuickFilters(
    quizAnswers: Record<string, number[]> | undefined,
    filters: TRenderFilters | undefined,
    selectedFilters: TSelectedFilters | null,
): TQuickFilter[] {
    if (!filters) return []

    const result: TQuickFilter[] = []
    const seen = new Set<string>()

    const instrumentAnswers = quizAnswers?.[quizConstants.instrumentQuestionIndex] ?? []
    instrumentAnswers.forEach(answerId => {
        const quizItem = instrumentItems.find(i => i.id === answerId)
        if (!quizItem) return
        const filterItem = findFilterItemByName(filters.instrument?.items, quizItem.title)
        if (!filterItem) return
        const key = `instrument:${filterItem.id}`
        if (seen.has(key)) return
        seen.add(key)
        result.push({
            key,
            label: quizItem.title,
            filterKey: 'instrument',
            itemId: filterItem.id,
            isSelected: isSelected(selectedFilters, 'instrument', filterItem.id),
        })
    })

    const levelAnswers = quizAnswers?.[quizConstants.levelQuestionIndex] ?? []
    levelAnswers.forEach(answerId => {
        const quizItem = levelItems.find(i => i.id === answerId)
        if (!quizItem || quizItem.oldId === undefined) return
        const complexityId = String(quizItem.oldId)
        const filterItem = findFilterItemById(filters.complexity?.items, complexityId)
        if (!filterItem) return
        const key = `complexity:${complexityId}`
        if (seen.has(key)) return
        seen.add(key)
        result.push({
            key,
            label: capitalizeFirst(filterItem.name),
            filterKey: 'complexity',
            itemId: complexityId,
            isSelected: isSelected(selectedFilters, 'complexity', complexityId),
        })
    })

    const genreAnswers = quizAnswers?.[quizConstants.genreQuestionIndex] ?? []
    genreAnswers.forEach(answerId => {
        const quizItem = genreItems.find(i => i.id === answerId)
        if (!quizItem) return
        const filterItem = findFilterItemByName(filters.genres?.items, quizItem.title)
        if (!filterItem) return
        const key = `genres:${filterItem.id}`
        if (seen.has(key)) return
        seen.add(key)
        result.push({
            key,
            label: quizItem.title,
            filterKey: 'genres',
            itemId: filterItem.id,
            isSelected: isSelected(selectedFilters, 'genres', filterItem.id),
        })
    })

    return result
}
