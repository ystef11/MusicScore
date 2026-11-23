import { store } from '@mu-native/common'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useAnimatedRef } from 'react-native-reanimated'

import { PerformanceScreen, TrackedScreen, useHasLoaded } from '@mu-native/performance'
import { useOpenScore } from '@mu-native/score'
import { authStoreChunk, getIsAuthorized, getCanUseFavorites } from '@mu-native/auth'
import {
    brandColors,
    ScrollableHeaderProvider,
    useBindTopBarScroll,
    useScrollableHeader,
} from '@mu-native/ds'
import { marketingThunks } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { checkConnectionSafely } from '@mu-native/system'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import debounce from 'lodash.debounce'

import { mainAppScreens } from '../../src/navigation'
import NavHeaderSearchBar from '../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import MetricaEvents from '../constants/MetricaEvents'
import { getScoreMetaEvent } from '../constants/scoreAnalytic'
import FavoritesController from '../Controllers/FavoritesController'
import { EmptyList } from '../Explore/ScreenExplore/components/ScoreList/EmptyList'
import type { MSScoreT } from '../Model/MSScore'
import '../Model/MSScore'
import MSFlashList from '../MSComponents/MSFlashList'
import { openMySets } from '../profileScreens/users/store/userAsyncActions'
import reportEvent from '../Utils/Analytics'
import { searchScoresEverywhere, SectionsT } from '../Utils/Search'

import { FavoritesCarouselBlock } from './Components/FavoritesCarouselBlock'
import { LibrarySwitchBlock } from './Components/switchBlock/LibrarySwitchBlock'
import { countersStoreChunk } from './countersStoreChunk.ts'
import { currentUserCountersApi } from './currentUserCountersApi.ts'

import { libraryTestIds } from '@mu/mu-mobile-test-id'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    contentContainer: {
        flexGrow: 1,
    },
})

const Library = ({ onItemPress }: { onItemPress: (score: MSScoreT) => void }) => {
    const scoreListChunk = useUniversalScoreListContext()

    const scrollRef = useAnimatedRef<ScrollView>()
    useBindTopBarScroll(scrollRef)
    const { contentPaddingTop } = useScrollableHeader()

    const navigation = useAppNavigation()

    const [scoreIds, scoresMap, favoriteCount, isAuthorized, counters] = useValues([
        scoreListChunk.props.getScoresIds,
        scoreListChunk.props.getScoresMap,
        scoreListChunk.props.getTotalItems,
        getIsAuthorized,
        countersStoreChunk.props.getCounters,
    ])

    const actions = useActions({
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
        presentAuthModal: authStoreChunk.actions.presentAuthModal,
        openMySets,
    })
    const scores = useMemo(
        () => {
            if (!scoreIds || !scoresMap) return []
            return scoreIds.map(id => scoresMap[id]).filter(Boolean)
        },
        [scoreIds, scoresMap],
    )

    const onOpenFavorites = () => {
        reportEvent(MetricaEvents.LIBRARY_MY_SCORES_ORDERS_CLICK, {
            'params.key': ['place'],
            'params.str_value': ['favorites'],
            'params.value': [0],
        })
        navigation.navigate(Screen.myProfileFavorites)
        reportEvent(MetricaEvents.FAVORITES_OPEN)
    }

    const onOpenOfflineScores = () => {
        reportEvent(MetricaEvents.LIBRARY_MY_SCORES_ORDERS_CLICK, {
            'params.key': ['place'],
            'params.str_value': ['offline'],
            'params.value': [0],
        })
        navigation.navigate(Screen.songBook)
    }

    const onOpenMyScores = () => {
        reportEvent(MetricaEvents.LIBRARY_MY_SCORES_ORDERS_CLICK, {
            'params.key': ['place'],
            'params.str_value': ['created by me'],
            'params.value': [0],
        })
        if (!isAuthorized) {
            actions.presentAuthModal(() => navigation.navigate(mainAppScreens.mySheetmusic))
        } else {
            navigation.navigate(mainAppScreens.mySheetmusic)
        }
    }

    const onOpenFavoriteCourses = () => {
        reportEvent(MetricaEvents.LIBRARY_MY_COURSES_CLICK, {
            'params.key': ['place'],
            'params.str_value': ['favorites'],
            'params.value': [0],
        })

        if (!isAuthorized) {
            actions.presentAuthModal(() => {
                navigation.navigate(Screen.searchCourses, { favorites: true })
            })
        } else {
            navigation.navigate(Screen.searchCourses, { favorites: true })
        }
    }

    const onOpenFavoriteEbooks = useCallback(() => {
        reportEvent(MetricaEvents.LIBRARY_SONG_BOOK_CLICK, {
            'params.key': ['place'],
            'params.str_value': ['favorites'],
            'params.value': [0],
        })

        if (!isAuthorized) {
            actions.presentAuthModal(() => {
                navigation.navigate(Screen.ebooksFavoriteScreen, { favorites: true })
            })
        } else {
            navigation.navigate(Screen.ebooksFavoriteScreen, { favorites: true })
        }
    }, [])

    const onOpenMySets = useCallback(() => {
        reportEvent(MetricaEvents.LIBRARY_MY_SETS_CLICK)
        actions.openMySets()
    }, [actions])

    return (
        <ScrollView
            ref={scrollRef}
            testID={libraryTestIds.components.scrollView}
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.contentContainer, { paddingTop: contentPaddingTop }]}
        >
            <FavoritesCarouselBlock
                favorites={scores}
                openScore={onItemPress}
                openFavorites={onOpenFavorites}
            />
            <LibrarySwitchBlock
                counters={counters}
                favoriteCount={favoriteCount}
                openFavorites={onOpenFavorites}
                openMySets={onOpenMySets}
                openMyScores={onOpenMyScores}
                openFavoriteCourses={onOpenFavoriteCourses}
                openFavoriteEbooks={onOpenFavoriteEbooks}
                onOpenOfflineScores={onOpenOfflineScores}
            />
        </ScrollView>
    )
}

const Sections = ({
    sections,
    isLoading,
    onItemPress,
}: {
    sections: SectionsT
    isLoading: boolean
    onItemPress: (score: MSScoreT) => void
}) => {
    const { contentPaddingTop } = useScrollableHeader()
    return (
        <MSFlashList
            sections={sections}
            onItemPress={onItemPress}
            ListEmptyComponent={!isLoading ? <EmptyList /> : null}
            containerStyle={{ paddingTop: contentPaddingTop }}
        />
    )
}

const ScreenLibrary = () => {
    const openScore = useOpenScore()

    const [isAuthorized] = useValues([getCanUseFavorites])
    const [searchText, setSearchText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sections, setSections] = useState<SectionsT>([])

    const actions = useActions({
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
    })

    useEffect(() => {
        setSearchText('')
    }, [isAuthorized])

    const runSearch = useCallback(
        debounce(async (searchText: string) => {
            try {
                setIsLoading(true)
                const sections = await searchScoresEverywhere(searchText)
                setSections(sections)
            } finally {
                setIsLoading(false)
            }
        }, 500),
        [],
    )

    const onSearch = useCallback(
        (searchText: string) => {
            setSearchText(searchText)
            if (searchText.length > 2) {
                runSearch(searchText)
            }
        },
        [runSearch],
    )

    const onCancelSearch = useCallback(() => {
        setSearchText('')
        setSections([])
    }, [])

    const onItemPress = useCallback((score: MSScoreT) => {
        if (!checkConnectionSafely()) return

        actions.checkOpenScoreForSaleThunk({
            score,
            ui: 'recent-favorites',
            callbackAfterCheck: () => {
                reportEvent(
                    MetricaEvents.SCORE_CLICK,
                    getScoreMetaEvent(score, score.isOfficial, { place: 'Recent Favorites' }),
                )
                openScore(score)
            },
        })
    }, [])

    const searchBarNode = isAuthorized ? (
        <NavHeaderSearchBar
            testID={libraryTestIds.components.searchInput}
            searchTerm={searchText}
            onChangeText={onSearch}
            clearInputValue={onCancelSearch}
            moduleKey="library"
        />
    ) : null

    return (
        <ScrollableHeaderProvider headerContent={searchBarNode}>
            <View style={styles.container}>
                {searchText ? (
                    <Sections
                        sections={sections}
                        isLoading={isLoading}
                        onItemPress={onItemPress}
                    />
                ) : (
                    <Library onItemPress={onItemPress} />
                )}
            </View>
        </ScrollableHeaderProvider>
    )
}

const ScreenLibraryFunc = (props: any) => {
    const navigation = useAppNavigation()

    const [isAuthorized] = useValues([getCanUseFavorites])

    const actions = useActions({
        fetchCounters: currentUserCountersApi.fetch,
        fetchFavorites: FavoritesController.fetchFavorites,
    })

    const { chunk } = useInjectDynamicStoreChunk('library', key =>
        createUniversalScoreListDynamicStoreChunk(key, 0, 0, {
            sortKind: 'date_added',
            sortOrder: 'desc',
        }),
    )

    useEffect(() => { actions.fetchFavorites(chunk) }, [isAuthorized, actions, chunk])

    useEffect(() => {
        return navigation.addListener('focus', () => {
            if (getIsAuthorized(store.getState())) actions.fetchCounters()
            actions.fetchFavorites(chunk)
        })
    }, [actions, chunk, isAuthorized, navigation])

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <TrackedScreenLibrary {...props} />
        </UniversalScoreListContext.Provider>
    )
}

// Below the provider: the list chunk is created per screen and is not readable above it.
const TrackedScreenLibrary = (props: any) => {
    const scoreListChunk = useUniversalScoreListContext()
    const [isLoading, isAuthorized] = useValues([
        scoreListChunk.props.getIsLoading,
        getIsAuthorized,
    ])
    const hasLoaded = useHasLoaded(isLoading)

    return (
        <TrackedScreen
            screenName={PerformanceScreen.library}
            interactive={isAuthorized ? hasLoaded : undefined}
        >
            <ScreenLibrary {...props} />
        </TrackedScreen>
    )
}

export default memo(ScreenLibraryFunc)
