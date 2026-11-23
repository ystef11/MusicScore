import { ScrollView, StyleSheet } from 'react-native'

import { brandColors, layout } from '@mu-native/ds'
import { book } from '@mu-native/icons/book'
import { heartFilled } from '@mu-native/icons/heartFilled'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'

import type { TLibrarySetTile } from '../store/useLibraryScreen'

import { LibraryTile } from './LibraryTile'

type TProps = {
    sets: TLibrarySetTile[]
    /** Show the Saved scores tile (§7 `tabs.saved_scores`). */
    showSaved?: boolean
    /** Show the Songbooks tile (§7 `tabs.songbooks`). */
    showSongbooks?: boolean
    onOfflinePress: () => void
    onMySetsPress: () => void
    onSavedPress: () => void
    onSongbooksPress: () => void
    onSetPress: (set: TLibrarySetTile) => void
}

// Sets cycle through the remaining playlist palette so each tile looks distinct.
const SET_COLORS = [
    brandColors.playlistBackground2,
    brandColors.playlistBackground1,
    brandColors.playlistBackground3,
    brandColors.playlistBackground5,
]

export const LibraryTilesCarousel = ({
    sets,
    showSaved = true,
    showSongbooks = true,
    onOfflinePress,
    onMySetsPress,
    onSavedPress,
    onSongbooksPress,
    onSetPress,
}: TProps) => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
    >
        {showSaved && (
            <LibraryTile
                title={translate('native.screens_titles.favorites_screen')}
                icon={heartFilled}
                iconOpacity={0.5}
                color={brandColors.playlistBackground4}
                onPress={onSavedPress}
                testID="Library tile saved"
            />
        )}
        {showSongbooks && (
            <LibraryTile
                title={translate('native.bottom_bar.books_tab')}
                icon={book}
                color={brandColors.playlistBackground6}
                onPress={onSongbooksPress}
                testID="Library tile songbooks"
            />
        )}
        <LibraryTile
            title={translate('native.library.my_local_saved_scores')}
            icon={noteList}
            color={brandColors.playlistBackground1}
            onPress={onOfflinePress}
        />
        <LibraryTile
            title={translate('native.library.my_sets_title')}
            icon={noteList}
            color={brandColors.playlistBackground2}
            onPress={onMySetsPress}
        />
        {sets.map((set, index) => (
            <LibraryTile
                key={set.id}
                title={set.title}
                icon={noteList}
                color={SET_COLORS[index % SET_COLORS.length]}
                onPress={() => onSetPress(set)}
            />
        ))}
    </ScrollView>
)

const styles = StyleSheet.create({
    row: {
        gap: layout.marginSm,
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingVertical: layout.marginSm,
    },
})
