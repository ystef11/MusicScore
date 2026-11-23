import { memo, useCallback } from 'react'
import { FlatList, Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, layout } from '@mu-native/ds'

import { type ApiSongResult } from '../services/makePublicApi.ts'

type Props = {
    songs: ApiSongResult[]
    onSelect: (song: ApiSongResult) => void
}

const keyExtractor = (item: ApiSongResult) => String(item.id)

const getItemLayout = (_: unknown, index: number) => ({ length: 44, offset: 44 * index, index })

const SongSuggestionItem = memo(
    ({ song, onPress }: { song: ApiSongResult; onPress: (song: ApiSongResult) => void }) => {
        const displayText = song.artist ? `${song.name} — ${song.artist.name}` : song.name

        return (
            <CommonTouchable onPress={() => onPress(song)} style={styles.itemContainer}>
                <AppText
                    rawText={displayText}
                    font="f15w400"
                    brandColor="contentPrimary"
                    numberOfLines={1}
                    style={styles.itemText}
                />
            </CommonTouchable>
        )
    },
)

export const SongSuggestionsList = memo(({ songs, onSelect }: Props) => {
    const onPressSuggestion = useCallback(
        (song: ApiSongResult) => {
            onSelect(song)
            Keyboard.dismiss()
        },
        [onSelect],
    )

    if (!songs.length) return null

    const renderItem = (info: ListRenderItemInfo<ApiSongResult>) => (
        <SongSuggestionItem song={info.item} onPress={onPressSuggestion} />
    )

    return (
        <View style={styles.shadowWrapper}>
            <View style={styles.list}>
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    data={songs}
                    getItemLayout={getItemLayout}
                    renderItem={renderItem}
                />
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    list: {
        maxHeight: 44 * 5,
        backgroundColor: brandColors.backgroundDefault,
    },
    shadowWrapper: {
        marginHorizontal: layout.baseMarginFromEdges,
        shadowColor: brandColors.colorBlack,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
        elevation: 12,
    },
    itemContainer: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.marginXm,
    },
    itemText: {
        flex: 1,
    },
})
