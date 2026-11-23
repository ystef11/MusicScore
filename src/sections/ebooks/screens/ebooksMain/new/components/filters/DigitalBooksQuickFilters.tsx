import { memo, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    FilterItemCheck,
    FilterItemChip,
    FiltersSectionTitle,
    FiltersToggleExpanded,
    FilterSortItem,
} from '@mu-native/ds'
import {
    LocaleKey,
    localizeGenre,
    localizeInstrumentFilterOption,
    translate,
} from '@mu-native/locale'
import { useActions } from '@ug/store'

import {
    DigitalEbookFilterModel,
    DigitalEbookFilters,
    DigitalEbookFilterType,
    DigitalEbookSortModel,
} from '../../api/digital.ebooks.models'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'

const titles: Record<keyof DigitalEbookFilters['filters'], LocaleKey> = {
    sort: 'native.ebook.filter_sort',
    instrument: 'native.ebook.filter_instrument',
    quick: 'native.ebook.filter_quick',
    artist_composer: 'native.ebook.filter_artist_composer',
    genre: 'native.ebook.filter_genre',
}

const localizeOptionName = (name: string, titleKey: keyof DigitalEbookFilters['filters']) => {
    if (titleKey === 'instrument') return localizeInstrumentFilterOption(name)
    if (titleKey === 'genre') return localizeGenre(name, name)
    if (titleKey === 'quick') {
        const genre = localizeGenre(name, name)
        return genre !== name ? genre : localizeInstrumentFilterOption(name)
    }
    return name
}

type QuickProps = {
    filters: (DigitalEbookFilterModel | DigitalEbookSortModel)[]
    type: DigitalEbookFilterType
    titleKey: keyof DigitalEbookFilters['filters']
}

export const DigitalBooksQuickFilters = memo(({ filters, type, titleKey }: QuickProps) => {
    const [isExpanded, setExpanded] = useState(type === 'button' || type === 'singular')
    const actions = useActions({ updateFilter: digitalEbooksThunk.updateFilterItem })
    const onItemPress = useCallback((id: string) => {
        actions.updateFilter({ id, type: titleKey })
    }, [])

    const _filters = isExpanded ? filters : filters.slice(0, 5)

    // @ts-ignore
    const titleSection = translate(titles[titleKey])
    return (
        <>
            <FiltersSectionTitle title={titleSection} />
            <View style={type === 'button' ? styles.chipContent : styles.multipleContent}>
                {_filters.map(f => {
                    if (!f.name) return null
                    if ('type' in f) {
                        return (
                            <FilterSortItem
                                id={f.type}
                                onPress={onItemPress}
                                name={f.name}
                                key={f.type}
                                isSelected={f.selected}
                            />
                        )
                    }
                    if (type === 'button') {
                        return (
                            <FilterItemChip
                                count={f.count}
                                key={f.id}
                                id={f.id}
                                name={localizeOptionName(f.name, titleKey)}
                                selected={f.selected}
                                onPress={onItemPress}
                            />
                        )
                    }

                    if (type === 'multiple') {
                        return (
                            <FilterItemCheck
                                key={f.id}
                                id={f.id}
                                name={localizeOptionName(f.name, titleKey)}
                                count={f.count}
                                selected={f.selected}
                                onPress={onItemPress}
                            />
                        )
                    }

                    return null
                })}
                {type === 'multiple' && (
                    <FiltersToggleExpanded isExpanded={isExpanded} setExpanded={setExpanded} />
                )}
            </View>
        </>
    )
})

const styles = StyleSheet.create({
    chipContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },

    multipleContent: {
        marginBottom: 12,
    },
})
