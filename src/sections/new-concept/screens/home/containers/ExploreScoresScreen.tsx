import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    BrandAppLoader,
    brandColors,
    layout,
    NativeBottomSheetRef,
    useAppSafeArea,
} from '@mu-native/ds'
import { Screen, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import {
    FLOATING_TAB_BAR_HEIGHT,
    reportScoreResultClick,
    ScoreFilterSheet,
    ScoreResultsList,
    useFilteredScoreSearch,
    useOpenScorePress,
    useResultsViewReporter,
    useScreenViewReporter,
    v2ParamsToSeedFilters,
    type TResultsListContext,
} from '@mu-native/new-concept-shared'
import {
    createFlattenedSelectedFiltersSelector,
    resolveInitialFilters,
    TInitialFilter,
} from '@mu-native/search'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../../App/Model/MSScore'

import { ExploreScoresScreenHeader } from './ExploreScoresScreenHeader.tsx'

export type TExploreScoresParams = {
    initialFilters?: TInitialFilter[]
    /** v2 block/chip replay params (§1.6) — a ready `/score/search` query. */
    searchParams?: Record<string, unknown>
}

export const ExploreScoresScreen = () => {
    const navigation = useAppNavigation()
    const { initialFilters, searchParams } = useAppRoute<TExploreScoresParams>()
    const insets = useAppSafeArea()

    const {
        filtersChunk,
        scoresChunk,
        selectionsSource,
        filterParams,
        selectedSort,
        scores,
        totalItems,
        isLoading,
        loadMore,
        sheetSearch,
    } = useFilteredScoreSearch({
        filterChunkKeyPrefix: 'explore_browse_filters',
        scoresChunkKey: 'explore-scores',
        getSeedFilters: params =>
            searchParams
                ? v2ParamsToSeedFilters(searchParams)
                : resolveInitialFilters(params, initialFilters),
    })

    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const onOpenFilters = useCallback(() => sheetRef.current?.present(), [])
    const onCloseFilters = useCallback(() => sheetRef.current?.dismiss(), [])

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_EXPLORE_SCORES_VIEW)

    const flattenedFiltersSelector = useMemo(
        () => createFlattenedSelectedFiltersSelector(filtersChunk.props.getSelectedFilters),
        [filtersChunk],
    )
    const [flattenedFilters] = useValues([flattenedFiltersSelector])

    const analyticsContext = useMemo<TResultsListContext>(
        () => ({
            screen: Screen.browseExploreScores,
            searchType: 'browse',
            filters: flattenedFilters,
            sort: selectedSort ?? 'relevance',
            place: 'Explore Scores',
        }),
        [flattenedFilters, selectedSort],
    )

    useResultsViewReporter({
        scores,
        totalCount: totalItems,
        context: analyticsContext,
        enabled: !isLoading,
    })

    useLayoutEffect(() => {
        navigation.setOptions({
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <ExploreScoresScreenHeader
                    filtersChunk={filtersChunk}
                    scoresChunk={scoresChunk}
                    onOpenFilters={onOpenFilters}
                />
            ),
            headerShown: true,
        })
    }, [filtersChunk, navigation, onOpenFilters, scoresChunk])

    const openScore = useOpenScorePress('Explore Scores')

    const handleScorePress = useCallback(
        (score: MSScoreT) => {
            reportScoreResultClick(score, scores.indexOf(score), totalItems, analyticsContext)
            openScore(score)
        },
        [openScore, scores, totalItems, analyticsContext],
    )

    return (
        <View style={styles.root}>
            <ScoreResultsList
                scores={scores}
                onScorePress={handleScorePress}
                onEndReached={loadMore}
                contentBottomInset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                ListEmptyComponent={
                    // A filtered search clears the list before fetching, so an
                    // in-flight load always has empty scores here — show the brand
                    // loader rather than a blank screen (the chunk key is shared,
                    // so isInitialLoading can't be relied on across re-entries).
                    isLoading ? (
                        <View style={styles.loader}>
                            <BrandAppLoader size="l" />
                        </View>
                    ) : null
                }
            />
            <ScoreFilterSheet
                sheetRef={sheetRef}
                chunk={scoresChunk}
                filters={filterParams}
                onClose={onCloseFilters}
                selections={selectionsSource}
                onSearch={sheetSearch}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layout.marginLg * 2,
    },
})
