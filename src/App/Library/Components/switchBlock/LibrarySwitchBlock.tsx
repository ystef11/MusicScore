import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { CarouselListTitle, IconSource, layout } from '@mu-native/ds'
import { book } from '@mu-native/icons/book'
import { cloudDownload } from '@mu-native/icons/cloudDownload'
import { cloudUpload } from '@mu-native/icons/cloudUpload'
import { collection } from '@mu-native/icons/collection'
import { learn } from '@mu-native/icons/learn'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'

import { CurrentUserCounters } from '../../countersStoreChunk.ts'
import { LibraryListElement } from '../../Elements/LibraryListElement'

type TProps = {
    counters: CurrentUserCounters
    favoriteCount: number
    openMyScores: () => void
    openMySets: () => void
    openFavorites: () => void


    openFavoriteCourses: () => void
    openFavoriteEbooks: () => void

    onOpenOfflineScores: () => void
}

export const LibrarySwitchBlock = memo(
    ({
        openMyScores,
        openMySets,
        openFavorites,
        openFavoriteCourses,
        openFavoriteEbooks,
        onOpenOfflineScores,
        counters,
        favoriteCount,
    }: TProps) => {
        type BlockType = {
            icon?: IconSource
            title: string
            text?: string
            count: number
            lastUpdatedAt: string | null
            onPress: () => void
            testID: string
        }

        const favoritesBlock = [
            {
                icon: noteList,
                title: translate('native.library.scores_column'),
                count: favoriteCount,
                onPress: openFavorites,
                testID: libraryTestIds.sections.favoritesScores,
            },
            {
                icon: learn,
                title: translate('native.courses.courses'),
                count: counters.course_favorite_count,
                onPress: openFavoriteCourses,
                testID: libraryTestIds.sections.favoritesCourses,
            },
            {
                icon: book,
                title: translate('native.ebooks.favorites_button_title'),
                count: counters.ebook_favorite_count,
                onPress: openFavoriteEbooks,
                testID: libraryTestIds.sections.favoritesSongbooks,
            },
        ] as BlockType[]
        const myScoresBlock = [
            {
                icon: cloudUpload,
                title: translate('native.library.my_uploaded_scores_title'),
                count: counters.score_count,
                onPress: openMyScores,
                testID: libraryTestIds.sections.myScores,
            },
        ] as BlockType[]
        const mySetsBlock = [
            {
                icon: collection,
                title: translate('native.library.my_sets_title'),
                count: counters.set_count,
                onPress: openMySets,
                testID: libraryTestIds.sections.mySets,
            },
        ] as BlockType[]

        const offlineBlock = [
            {
                icon: cloudDownload,
                title: translate('native.library.my_local_saved_scores'),
                onPress: onOpenOfflineScores,
                testID: libraryTestIds.sections.savedScores,
            },
        ] as BlockType[]

        return (
            <View style={styles.container}>
                <CarouselListTitle
                    text={translate('native.library.favorites_title')}
                    style={styles.headingContainer}
                />

                {favoritesBlock?.map(lib => {
                    return <LibraryListElement key={lib.title} {...lib} />
                })}

                <CarouselListTitle
                    text={translate('native.library.created_by_me')}
                    style={styles.headingContainer}
                />

                {myScoresBlock?.map(lib => {
                    return <LibraryListElement key={lib.title} {...lib} />
                })}
                {mySetsBlock?.map(lib => {
                    return <LibraryListElement key={lib.title} {...lib} />
                })}

                <CarouselListTitle
                    text={translate('native.library.available_offline')}
                    style={styles.headingContainer}
                />

                {offlineBlock?.map(lib => {
                    return <LibraryListElement key={lib.title} {...lib} />
                })}
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: layout.baseMarginFromEdges,
        alignSelf: 'center',
    },
    headingContainer: {
        marginTop: layout.marginMd,
        marginBottom: layout.marginSm,
    },
})
