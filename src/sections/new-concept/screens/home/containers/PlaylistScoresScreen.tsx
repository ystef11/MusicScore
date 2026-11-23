import { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { BaseEmptyStateView, brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'
import { Screen, useAppRoute } from '@mu-native/navigation'
import {
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    NestedScreenHeader,
    reportScoreResultClick,
    ScoreResultsList,
    useOpenScorePress,
    useResultsViewReporter,
    useScreenViewReporter,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'
import { playlistsThunks, type TPlaylist } from '@mu-native/playlist-scores'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { useScoreListProps } from '../../../../../App/Explore/hooks/useScoreListProps'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'

const PlaylistScores = ({ playlist }: { playlist: TPlaylist }) => {
    const insets = useAppSafeArea()
    const chunk = useUniversalScoreListContext()
    const { scores, isInitialLoading } = useScoreListProps(chunk, 'Playlist')
    const actions = useActions({ fetchScoreList: playlistsThunks.fetchScoreList })
    const openScore = useOpenScorePress('Playlist')

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_PLAYLIST_SCORES_VIEW)

    useEffect(() => {
        reportEvent(MetricaEvents.PLAYLIST_VIEW, {
            'params.key': ['playlist_id', 'playlist_name'],
            'params.str_value': [playlist.id, playlist.title],
            'params.value': [0, 0],
        })
        actions.fetchScoreList(chunk, playlist.id)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chunk, playlist])

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: Screen.playlistScores,
            blockName: 'Playlist',
            searchType: 'browse',
            filters: [{ key: 'playlist_id', value: `${playlist.id}` }],
        }),
        [playlist.id],
    )

    useResultsViewReporter({ scores, context: analyticsContext, enabled: !isInitialLoading })

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(score, scores.indexOf(score), scores.length, analyticsContext)
            openScore(score)
        },
        [scores, analyticsContext, openScore],
    )

    return (
        <View style={styles.root}>
            <NestedScreenHeader title={playlist.title} />
            <View style={styles.list}>
                <ScoreResultsList
                    scores={scores}
                    onScorePress={handleScorePress}
                    ListEmptyComponent={
                        isInitialLoading ? (
                            <ListLoader />
                        ) : (
                            <View style={styles.empty}>
                                <BaseEmptyStateView
                                    icon={noteList}
                                    title={translate('native.new_concept.playlist.empty_title')}
                                    description={translate(
                                        'native.new_concept.playlist.empty_description',
                                    )}
                                />
                            </View>
                        )
                    }
                    contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
            </View>
        </View>
    )
}

export const PlaylistScoresScreen = () => {
    const { playlist } = useAppRoute<{ playlist: TPlaylist }>()
    const { id } = playlist
    const { chunk } = useInjectDynamicStoreChunk(`playlist_${id}`, key =>
        createUniversalScoreListDynamicStoreChunk(key, id),
    )

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <PlaylistScores playlist={playlist} />
        </UniversalScoreListContext.Provider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    list: {
        flex: 1,
        paddingTop: layout.marginSm,
    },
    empty: {
        flex: 1,
    },
})
