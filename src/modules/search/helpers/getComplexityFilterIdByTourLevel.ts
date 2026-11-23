import { TFilterItem } from '../types/searchTypes'

/**
 * The tour asks for one of five playing levels while the complexity filter offers three, so the two
 * top levels both collapse into Advanced and "can read notation" stays with Beginner — that answer
 * still describes someone who needs beginner-level sheets.
 */
const tourLevelToComplexityName: Record<string, string> = {
    beginner: 'beginner',
    'can read notation': 'beginner',
    intermediate: 'intermediate',
    professional: 'advanced',
    virtuoso: 'advanced',
}

export function getComplexityFilterIdByTourLevel(
    filters: TFilterItem[] | null | undefined,
    tourLevelValue: string | undefined,
): string | undefined {
    if (!tourLevelValue || !filters?.length) {
        return undefined
    }

    const complexityName = tourLevelToComplexityName[tourLevelValue.trim().toLowerCase()]

    if (!complexityName) {
        return undefined
    }

    const match = filters.find(filter => filter.name.trim().toLowerCase() === complexityName)

    return match?.id?.toString()
}
