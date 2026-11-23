import { useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    PlaylistCard,
    playlistCardPropsDataConverter,
    type TPlaylist,
} from '@mu-native/playlist-scores'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

const keyExtractor = (item: TPlaylist) => item.id

type TProps = {
    title: string
    playlists: TPlaylist[]
}

export const PlaylistsSection = ({ title, playlists }: TProps) => {
    const navigation = useAppNavigation()

    const onPlaylistPress = useCallback(
        (playlist: TPlaylist) => {
            reportEvent(MetricaEvents.PLAYLIST_CLICK, {
                'params.key': ['playlist_id', 'playlist_name'],
                'params.str_value': [playlist.id, playlist.title],
                'params.value': [0, 0],
                block_name: title,
                position: playlists.indexOf(playlist),
            })
            navigation.push(Screen.playlistScores, { playlist })
        },
        [navigation, title, playlists],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<TPlaylist>) => (
            <PlaylistCard
                {...playlistCardPropsDataConverter(item)}
                onPress={() => onPlaylistPress(item)}
            />
        ),
        [onPlaylistPress],
    )

    if (!playlists.length) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={playlists}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.list}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
    },
    header: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: layout.marginXs,
    },
    list: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginSm,
        paddingVertical: layout.marginSm,
    },
})
