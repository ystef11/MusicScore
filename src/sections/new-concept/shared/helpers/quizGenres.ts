import { quizConstants } from '@mu-native/quiz'
import type { TRenderFilters } from '@mu-native/search'

import { findFilterItemByName } from './quizQuickFilters'

type TQuizItem = {
    id: number
    title: string
}

const genreItems: TQuizItem[] = quizConstants.genreList.answers as TQuizItem[]

// Resolves the onboarding genre answers to genre filter ids from the search
// catalog. Genres match by name (the same way `buildQuizQuickFilters` does),
// since the quiz answer ids don't line up with the catalog filter ids.
export function resolveQuizGenreFilterIds(
    quizAnswers: Record<string, number[]> | undefined,
    filters: TRenderFilters | undefined,
): string[] {
    if (!filters) return []

    const genreAnswers = quizAnswers?.[quizConstants.genreQuestionIndex] ?? []
    const ids: string[] = []

    genreAnswers.forEach(answerId => {
        const quizItem = genreItems.find(item => item.id === answerId)
        if (!quizItem) return
        const filterItem = findFilterItemByName(filters.genres?.items, quizItem.title)
        if (filterItem && !ids.includes(filterItem.id)) {
            ids.push(filterItem.id)
        }
    })

    return ids
}
