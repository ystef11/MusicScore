import { StyleSheet, View } from 'react-native'

import { BaseEmptyStateView, type IconSource } from '@mu-native/ds'
import { book } from '@mu-native/icons/book'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { noteList } from '@mu-native/icons/noteList'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'

type TVariant = 'scores' | 'songbooks' | 'search' | 'set'

const CONTENT: Record<TVariant, { icon: IconSource; title: string; description: string }> = {
    scores: {
        icon: brokenHeart,
        title: translate('native.new_concept.library.empty_scores_title'),
        description: translate('native.new_concept.library.empty_scores_description'),
    },
    set: {
        icon: noteList,
        title: translate('native.new_concept.library.empty_set_title'),
        description: translate('native.new_concept.library.empty_set_description'),
    },
    songbooks: {
        icon: book,
        title: translate('native.new_concept.library.empty_songbooks_title'),
        description: translate('native.new_concept.library.empty_songbooks_description'),
    },
    search: {
        icon: search,
        title: translate('native.new_concept.library.search_empty_title'),
        description: translate('native.new_concept.common.check_spelling_hint'),
    },
}

type TProps = {
    variant?: TVariant
}

export const LibraryEmptyState = ({ variant = 'scores' }: TProps) => (
    <View style={styles.container}>
        <BaseEmptyStateView {...CONTENT[variant]} />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Keeps the message in the upper half of the list area, as in the design.
        minHeight: 320,
    },
})
