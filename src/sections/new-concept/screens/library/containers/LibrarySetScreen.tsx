import { useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { getUserId } from '@mu-native/auth'
import { brandColors, layout, NavigationIconButton, useAppSafeArea } from '@mu-native/ds'
import { pencil } from '@mu-native/icons/pencil'
import {
    Screen,
    useAppNavigation,
    useAppRoute,
    useFocusEffect,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import {
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    NestedScreenHeader,
    reportScoreResultClick,
    ScoreResultsList,
    type TResultsListContext,
    useOpenScorePress,
    useResultsViewReporter,
    useScreenViewReporter,
} from '@mu-native/new-concept-shared'
import {
    createScoreSetDetailsDynamicStoreChunk,
    ScoreSetDetailsContext,
    scoreSetDetailsThunks,
    useScoreSetDetailsContext,
} from '@mu-native/score-set-details'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import { LibraryEmptyState } from '../components/LibraryEmptyState'

type TParams = { setId: number; title?: string }

const LibrarySet = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const { setId, title } = useAppRoute<TParams>()
    const chunk = useScoreSetDetailsContext()

    const [scores, set, userId, isLoading] = useValues([
        chunk.props.getScores,
        chunk.props.getSet,
        getUserId,
        chunk.props.getIsLoading,
    ])

    const actions = useActions({
        fetchSet: scoreSetDetailsThunks.fetchSet,
        loadMore: scoreSetDetailsThunks.loadMoreScoresInSet,
    })

    // Fetch on focus, not just on mount, so returning from the edit screen
    // shows the updated title, metadata and scores (same as the legacy set screen).
    // The backend needs the owner id, so wait for the auth store instead of sending a placeholder.
    useFocusEffect(
        useCallback(() => {
            if (userId == null) return
            actions.fetchSet(chunk, userId)
        }, [actions, chunk, userId]),
    )

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_LIBRARY_SET_VIEW)

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: Screen.librarySet,
            blockName: 'Set',
            searchType: 'browse',
            filters: [{ key: 'set_id', value: `${setId}` }],
        }),
        [setId],
    )

    useResultsViewReporter({ scores, context: analyticsContext, enabled: isLoading === false })

    const openScore = useOpenScorePress('Library Set')

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            if (!score) return
            reportScoreResultClick(score, scores.indexOf(score), scores.length, analyticsContext)
            openScore(score)
        },
        [openScore, scores, analyticsContext],
    )

    const handleLoadMore = useCallback(() => {
        if (userId == null) return
        actions.loadMore(chunk, userId)
    }, [actions, chunk, userId])

    const handleEdit = useCallback(() => {
        navigation.navigate(Screen.createEditSet, { userId, setId, edit: true })
    }, [navigation, userId, setId])

    return (
        <View style={styles.root}>
            <NestedScreenHeader
                title={set?.title ?? title ?? ''}
                rightComponent={<NavigationIconButton icon={pencil} onPress={handleEdit} />}
            />
            <View style={styles.list}>
                <ScoreResultsList
                    scores={scores}
                    onScorePress={handleScorePress}
                    enablePlayShortcut
                    onEndReached={handleLoadMore}
                    ListEmptyComponent={
                        // Only show the empty state once the set has actually loaded — otherwise
                        // the first (or guest) fetch resolving with no scores flashes "empty"
                        // before the real scores arrive. Until then, keep the loader.
                        isLoading === false && set ? (
                            <LibraryEmptyState variant="set" />
                        ) : (
                            <ListLoader />
                        )
                    }
                    contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
            </View>
        </View>
    )
}

export const LibrarySetScreen = () => {
    const { setId } = useAppRoute<TParams>()
    const increment = useSameRouteInStackCount()

    const { chunk } = useInjectDynamicStoreChunk('library_set', key =>
        createScoreSetDetailsDynamicStoreChunk(key, setId, increment),
    )

    return (
        <ScoreSetDetailsContext.Provider value={chunk}>
            <LibrarySet />
        </ScoreSetDetailsContext.Provider>
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
})
