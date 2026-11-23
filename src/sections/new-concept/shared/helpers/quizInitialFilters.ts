import { quizConstants } from '@mu-native/quiz'
import type { TInitialFilter } from '@mu-native/search'

type TQuizItem = {
    id: number
    oldId?: number
    title: string
}

const instrumentItems: TQuizItem[] = quizConstants.instrumentList.answers.flatMap(
    section => section.data as TQuizItem[],
)
const levelItems: TQuizItem[] = quizConstants.levelsList.answers as TQuizItem[]

// Maps the onboarding quiz answers to Explore-scores `initialFilters` WITHOUT a
// filter catalog: instruments resolve later by name, levels by their stable
// `oldId` (which equals the complexity filter id). The consuming screen does the
// actual catalog resolution against its own encapsulated chunk — so Home never
// touches the global search state. Genres are intentionally left out (instrument
// + mastery level only, matching the seeded Recommended filters).
export function buildQuizInitialFilters(
    quizAnswers: Record<string, number[]> | undefined,
): TInitialFilter[] {
    const result: TInitialFilter[] = []

    const instrumentAnswers = quizAnswers?.[quizConstants.instrumentQuestionIndex] ?? []
    instrumentAnswers.forEach(answerId => {
        const quizItem = instrumentItems.find(item => item.id === answerId)
        if (quizItem) {
            result.push({ filterKey: 'instrument', name: quizItem.title })
        }
    })

    const levelAnswers = quizAnswers?.[quizConstants.levelQuestionIndex] ?? []
    levelAnswers.forEach(answerId => {
        const quizItem = levelItems.find(item => item.id === answerId)
        if (quizItem?.oldId !== undefined) {
            result.push({ filterKey: 'complexity', itemId: String(quizItem.oldId) })
        }
    })

    return result
}
