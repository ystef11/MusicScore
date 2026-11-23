import { useCallback, useLayoutEffect } from 'react'
import { RefreshControl, ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native'

import { brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { CheckSaleSplash, FloatingButtonContainer } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    CoursesCarousel,
    FLOATING_TAB_BAR_HEIGHT,
    HOME_TAB_ROUTE,
    RootScreenHeader,
    ScreenStateGate,
    SongbooksCarousel,
    useOpenScorePress,
    usePullToRefresh,
    useScreenViewReporter,
    useSearchSessionReporter,
    useTabScrollToTop,
} from '@mu-native/new-concept-shared'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { ScoresAfterTourTrigger } from '@mu-native/scores-after-tour-screen'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { useReferralScoreLogic } from '../../../../../App/Explore/ScreenExplore/hooks/useReferralScoreLogic'
import { useHomeScreen } from '../store/useHomeScreen.ts'

import { GenreFilteredScoresSection } from './GenreFilteredScoresSection'
import { PlaylistsSection } from './PlaylistsSection'
import { RecentlyViewedSection } from './RecentlyViewedSection'
import { RecommendedScoresSection } from './RecommendedScoresSection'

export const HomeScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const scrollRef = useTabScrollToTop<ScrollViewInstance>(HOME_TAB_ROUTE)

    useSearchSessionReporter()
    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_HOME_VIEW)
    // Auto-open a referred/shared score on the root, as the legacy Explore root did.
    useReferralScoreLogic()

    const {
        isLoading,
        isError,
        hasData,
        refresh,
        recentlyViewed,
        playlists,
        easyPieces,
        genres,
        songbooks,
        courses,
    } = useHomeScreen()

    const { isRefreshing, onRefresh } = usePullToRefresh(refresh)

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [])

    const handleScorePress = useOpenScorePress('Home')

    const openLearn = useCallback(() => navigation.navigate(Screen.learn), [navigation])
    const openSongbooks = useCallback(() => navigation.push(Screen.songbooks), [navigation])

    return (
        <TrackedScreen screenName={PerformanceScreen.home} interactive={hasData}>
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <ScrollView
                    ref={scrollRef}
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.content,
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
                    <RootScreenHeader />
                    <ScreenStateGate
                        hasData={hasData}
                        isLoading={isLoading}
                        isError={isError}
                        onRetry={refresh}
                    >
                        <RecentlyViewedSection
                            scores={recentlyViewed.scores}
                            onScorePress={handleScorePress}
                        />
                        <PlaylistsSection
                            title={translate('native.new_concept.home.playlists')}
                            playlists={playlists}
                        />
                        <RecommendedScoresSection
                            title={translate('native.new_concept.home.easy_pieces_for_you')}
                            scores={easyPieces.scores}
                            params={easyPieces.params}
                            onScorePress={handleScorePress}
                        />
                        <GenreFilteredScoresSection
                            title={translate('native.new_concept.home.browse_favorite_genres')}
                            genres={genres}
                            onScorePress={handleScorePress}
                        />
                        <SongbooksCarousel
                            title={translate('native.bottom_bar.books_tab')}
                            items={songbooks}
                            onViewAllPress={openSongbooks}
                        />
                        <CoursesCarousel
                            title={translate('native.new_concept.home.level_up_music_theory')}
                            courses={courses}
                            onViewAllPress={openLearn}
                        />
                    </ScreenStateGate>
                </ScrollView>
                {/* Sale funnel entries from the legacy Explore root (its replacement):
                    the floating stock button and the auto-opening sale splashes. */}
                <FloatingButtonContainer
                    isShowLearnPlan={false}
                    bottomOffset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
                <CheckSaleSplash />
                {/* First-session "add scores to library" monetization experiment
                    (8015/8018) — self-gating, presents once after the tour. */}
                <ScoresAfterTourTrigger />
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
    content: {
        // Lets the first-frame loading/error state (ScreenStateGate) fill the viewport
        // and center; harmless once the sections overflow the screen.
        flexGrow: 1,
    },
})
