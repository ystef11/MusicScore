import { StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'

import { GenreRow } from '../components/GenreRow'
import { type TSearchGenre } from '../constants/searchGenres'

type TProps = {
    title: string
    genres: TSearchGenre[]
    onGenrePress: (genre: TSearchGenre) => void
}

export const BrowseByGenreSection = ({ title, genres, onGenrePress }: TProps) => {
    if (genres.length === 0) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} style={styles.header} />
            <View style={styles.list}>
                {genres.map(genre => (
                    <GenreRow key={genre.id} genre={genre} onPress={onGenrePress} />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    header: {
        marginBottom: layout.marginMd,
    },
    list: {
        gap: layout.marginXs,
    },
})
