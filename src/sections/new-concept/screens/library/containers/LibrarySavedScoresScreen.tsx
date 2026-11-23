import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen } from '@mu-native/navigation'
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
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import FavoritesController from '../../../../../App/Controllers/FavoritesController'
import { FavoritesLoadError } from '../../../../../App/Library/Favorites/FavoritesLoadError'
import type { MSScoreT } from '../../../../../App/Model/MSScore'
import { LibraryEmptyState } from '../components/LibraryEmptyState'

const ANALYTICS_CONTEXT: TResultsListContext = {
    screen: Screen.librarySavedScores,
    blockName: 'Saved scores',
    searchType: 'browse',
    sort: 'date_added',
}

const LibrarySavedScores = () => {
    const insets = useAppSafeArea()
    const chunk = useUniversalScoreListContext()

    const [scoreIds, scoresMap, isLoading] = useValues([
        chunk.props.getScoresIds,
        chunk.props.getScoresMap,
        chunk.props.getIsLoading,
    ])

    const actions = useActions({
        fetch: FavoritesController.fetchFavorites,
        loadMore: FavoritesController.loadMoreFavorites,
    })

    const [initialLoading, setInitialLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)
    const loadAttempt = useRef(0)

    const fetchFavorites = useCallback((interactive = false) => {
        const attempt = ++loadAttempt.current
        setLoadError(null)
        actions.fetch(chunk, interactive, error => {
            if (attempt === loadAttempt.current) {
                setInitialLoading(false)
                setLoadError(error)
            }
        })
    }, [actions, chunk])

    useEffect(() => {
        void fetchFavorites()
        return () => { loadAttempt.current++ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const scores = useMemo(
        () => scoreIds.map(id => scoresMap[id]).filter(Boolean),
        [scoreIds, scoresMap],
    )

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_LIBRARY_SAVED_SCORES_VIEW)

    useResultsViewReporter({
        scores,
        context: ANALYTICS_CONTEXT,
        enabled: !initialLoading && !isLoading,
    })

    const openScore = useOpenScorePress('Saved scores')

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            if (!score) return
            reportScoreResultClick(score, scores.indexOf(score), scores.length, ANALYTICS_CONTEXT)
            openScore(score)
        },
        [openScore, scores],
    )

    const handleLoadMore = useCallback(() => {
        actions.loadMore(chunk)
    }, [actions, chunk])

    return (
        <View style={styles.root}>
            <NestedScreenHeader title={translate('native.screens_titles.favorites_screen')} />
            <View style={styles.list}>
                {loadError && <FavoritesLoadError message={loadError} onRetry={() => { void fetchFavorites(true) }} />}
                <ScoreResultsList
                    scores={scores}
                    onScorePress={handleScorePress}
                    enablePlayShortcut
                    onEndReached={handleLoadMore}
                    ListEmptyComponent={
                        initialLoading || isLoading ? <ListLoader /> : loadError ? null : <LibraryEmptyState />
                    }
                    contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
            </View>
        </View>
    )
}

export const LibrarySavedScoresScreen = () => {
    const { chunk } = useInjectDynamicStoreChunk('library_saved', key =>
        createUniversalScoreListDynamicStoreChunk(key, 0, 0, {
            sortKind: 'date_added',
            sortOrder: 'desc',
        }),
    )

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <LibrarySavedScores />
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
})
