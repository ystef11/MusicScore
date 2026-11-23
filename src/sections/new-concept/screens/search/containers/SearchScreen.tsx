import { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { FloatingButtonContainer } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    CoursesCarousel,
    FLOATING_TAB_BAR_HEIGHT,
    RootScreenHeader,
    ScreenStateGate,
    SearchEntryButton,
    SongbooksCarousel,
    useOpenScorePress,
    usePullToRefresh,
    useScreenViewReporter,
    useTabRepressAction,
} from '@mu-native/new-concept-shared'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { searchStoreChunk, type TRecentSearchFilter } from '@mu-native/search'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { SearchSuggestionsOverlay } from '../components/SearchSuggestionsOverlay'
import { type TSearchGenre } from '../constants/searchGenres'
import { useSearchScreen } from '../store/useSearchScreen'
import { useShazamSearchEntry } from '../store/useShazamSearchEntry'

import { BrowseByGenreSection } from './BrowseByGenreSection'
import { TrendingNowSection } from './TrendingNowSection'

export const SearchScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()

    const { isLoading, isError, hasData, refresh, trending, songbooks, courses, genres } =
        useSearchScreen()

    const { isRefreshing, onRefresh } = usePullToRefresh(refresh)

    const [isSearchActive, setIsSearchActive] = useState(false)

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_SEARCH_VIEW)

    const actions = useActions({
        setSearchTerm: searchStoreChunk.actions.setSearchTerm,
        addToSearchHistory: searchStoreChunk.actions.addToSearchHistory,
        addRecentSearch: searchStoreChunk.actions.addRecentSearch,
    })

    const handleSearchPress = useCallback(() => setIsSearchActive(true), [])

    // Re-pressing the Search tab while at its root focuses the field (opens the
    // autofocused search overlay), matching the native tab-bar affordance.
    useTabRepressAction(Screen.search, handleSearchPress)

    const handleSearchClose = useCallback(() => setIsSearchActive(false), [])

    const { trailingButton: shazamButton, briefingSheet: shazamBriefingSheet } =
        useShazamSearchEntry()

    const handleSearchSubmit = useCallback(
        (query: string, filters?: TRecentSearchFilter[]) => {
            actions.setSearchTerm(query)
            if (query) {
                actions.addToSearchHistory(query)
                actions.addRecentSearch({ query, filters })
            }
            setIsSearchActive(false)
            navigation.push(Screen.searchResults, {
                query,
                initialFilters: filters?.map(({ filterKey, itemId }) => ({ filterKey, itemId })),
            })
        },
        [actions, navigation],
    )

    const handleScorePress = useOpenScorePress('Search')

    const handleGenrePress = useCallback(
        (genre: TSearchGenre) => {
            // Replay the chip's params in the Browse scores grid (§5).
            navigation.push(Screen.browseExploreScores, { searchParams: genre.params })
        },
        [navigation],
    )

    const openLearn = useCallback(() => navigation.navigate(Screen.learn), [navigation])
    const openSongbooks = useCallback(() => navigation.push(Screen.songbooks), [navigation])

    return (
        <TrackedScreen screenName={PerformanceScreen.search} interactive={hasData}>
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingBottom:
                                insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg,
                        },
                    ]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    <RootScreenHeader
                        search={
                            <SearchEntryButton
                                onPress={handleSearchPress}
                                trailingButton={shazamButton}
                            />
                        }
                    />
                    <ScreenStateGate
                        hasData={hasData}
                        isLoading={isLoading}
                        isError={isError}
                        onRetry={refresh}
                    >
                        <TrendingNowSection
                            title={translate('native.screen_explore.trending_now')}
                            scores={trending}
                            onScorePress={handleScorePress}
                        />
                        <SongbooksCarousel
                            title={translate('native.new_concept.search.popular_songbooks')}
                            items={songbooks}
                            onViewAllPress={openSongbooks}
                        />
                        <CoursesCarousel
                            title={translate('native.courses.title.top music courses')}
                            courses={courses}
                            onViewAllPress={openLearn}
                        />
                        <BrowseByGenreSection
                            title={translate('native.new_concept.search.browse_by_genre')}
                            genres={genres}
                            onGenrePress={handleGenrePress}
                        />
                    </ScreenStateGate>
                </ScrollView>
                {/* Sale funnel entry, as on the Home root. Rendered before the search
                    overlay so an active overlay stacks above it. */}
                <FloatingButtonContainer
                    isShowLearnPlan={false}
                    bottomOffset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
                {isSearchActive && (
                    <SearchSuggestionsOverlay
                        onClose={handleSearchClose}
                        onSubmit={handleSearchSubmit}
                    />
                )}
                {shazamBriefingSheet}
            </View>
        </TrackedScreen>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    scroll: {
        flex: 1,
    },
    // Lets the first-frame loading/error state fill the viewport and center.
    scrollContent: {
        flexGrow: 1,
    },
})
