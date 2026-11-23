import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { translate } from '@mu-native/locale/i18n'

import { AppRadioButton } from '../elements/AppRadioButton.tsx'

type Props = {
    id: string
    onPress: (itemId: string) => void
    isSelected?: boolean
    name: string
}

const translateKeys = {
    relevance: 'native.sorting_type.relevance',
    'view count': 'native.sorting_type.view count',
    view_count: 'native.sorting_type.view count',
    rating: 'native.sorting_type.rating',
    score_type: 'native.sorting_type.score_type',
    'upload date': 'native.sorting_type.upload date',
    date_uploaded: 'native.sorting_type.upload date',
    difficulty_level: 'native.sorting_type.difficulty_level',
    'comment count': 'native.sorting_type.comment count',
    comment_count: 'native.sorting_type.comment count',
    'sorting_type.default_title': 'native.sorting_type.default_title',
} as const

export const FilterSortItem = memo(({ name, id, onPress, isSelected = false }: Props) => {
    const localeKey =
        translateKeys[name.toLowerCase() as keyof typeof translateKeys] ??
        translateKeys[id.toLowerCase() as keyof typeof translateKeys] ??
        'native.sorting_type.default_title'

    return (
        <AppRadioButton
            style={styles.item}
            title={translate(localeKey)}
            isSelected={isSelected}
            onPress={() => onPress(id)}
        />
    )
})

const styles = StyleSheet.create({
    item: {
        height: 48,
        columnGap: 8,
        borderRadius: 32 / 2,
        alignItems: 'center',
        flexDirection: 'row',
    },
})
