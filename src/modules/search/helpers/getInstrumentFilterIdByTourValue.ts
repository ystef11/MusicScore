import { TFilterItem } from '../types/searchTypes'

export function getInstrumentFilterIdByTourValue(
    filters: TFilterItem[] | null | undefined,
    tourInstrumentValue: string | undefined,
): string | undefined {
    if (!tourInstrumentValue || !filters?.length) {
        return undefined
    }

    const tourInstrument = tourInstrumentValue.toLowerCase()

    const match = filters.find(filter => {
        const name = filter.name.toLowerCase()
        return (
            name === tourInstrument ||
            name.includes(tourInstrument) ||
            name.replace(/\s+/g, '') === tourInstrument
        )
    })

    return match?.id?.toString()
}
