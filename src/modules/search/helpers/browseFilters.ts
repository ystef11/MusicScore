import { TBrowseFilters } from '../dataConverters/convertBrowseFilterData.ts'
import { TFilterItem, TRenderFilters } from '../types/searchTypes'

function notUndefined<T>(item: T | undefined): item is T {
    return item !== undefined
}

export const processBrowseFilters = (filters: TBrowseFilters) => {
    const processedFilters = (
        Object.keys(filters) as (keyof TBrowseFilters)[]
    ).reduce<TRenderFilters>((result, key) => {
        const hideCount = ['recordingType', 'license'].includes(key)
        const filterItems = filters[key]
        if (!Array.isArray(filterItems)) {
            return {
                ...result,
                [key]: {
                    filterKey: key,
                    items: [filterItems],
                    hideCount,
                },
            }
        }

        const flatItems = filterItems.map(apiItem => {
            const { id, name, count, parent_instrument_id: parentId } = apiItem
            const item: TFilterItem = {
                id,
                name,
                count,
                parentId: parentId === undefined ? undefined : String(parentId),
            }
            return item
        })

        const itemsMap = flatItems.reduce<Record<TFilterItem['id'], TFilterItem>>((acc, curr) => {
            return { ...acc, [curr.id]: curr }
        }, {})

        flatItems.forEach(item => {
            if (item.parentId) {
                const parent = itemsMap[item.parentId]
                if (parent) {
                    parent.children = [...(parent.children ?? []), item]
                }
            }
        })

        const groupedItems = flatItems.filter(
            item => item.parentId === undefined || item.parentId === '0',
        )

        return {
            ...result,
            [key]: {
                filterKey: key,
                items: groupedItems,
                hideCount,
            },
        }
    }, {} as TRenderFilters)

    const pianoAPIItem = filters.instrument.find(i => i.name === 'Piano')
    const piano = pianoAPIItem
        ? ({
              id: pianoAPIItem.id,
              name: pianoAPIItem.name,
              count: pianoAPIItem.count,
              overrideFilterKey: 'instrument',
          } as TFilterItem)
        : undefined

    const beginner = processedFilters.complexity.items
        .map(i => ({ ...i, overrideFilterKey: 'complexity' }) as TFilterItem)
        .find(i => i.name.toLowerCase() === 'beginner')

    const solo = processedFilters.instrumentation.items
        .map(i => ({ ...i, overrideFilterKey: 'instrumentation' }) as TFilterItem)
        .find(i => i.name.toLowerCase() === 'solo')

    const freeToDownload = processedFilters.recordingType.items
        .map(i => ({ ...i, overrideFilterKey: 'recordingType' }) as TFilterItem)
        .find(i => i.name.toLowerCase() === 'free to view, play & download')

    const violinAPIItem = filters.instrument.find(i => i.name.toLowerCase() === 'violin')
    const violin = violinAPIItem
        ? ({
              id: violinAPIItem.id,
              name: violinAPIItem.name,
              count: violinAPIItem.count,
              overrideFilterKey: 'instrument',
          } as TFilterItem)
        : undefined

    const popularItems = [piano, beginner, solo, freeToDownload, violin].filter(notUndefined)

    processedFilters.popular = {
        filterKey: 'popular',
        items: popularItems,
    }

    return processedFilters
}
