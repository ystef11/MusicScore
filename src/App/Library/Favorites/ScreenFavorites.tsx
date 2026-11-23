import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { authStoreChunk, authThunks, getCanUseFavorites } from '@mu-native/auth'
import { BrandAppLoader, SafeAreaView } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingThunks } from '@mu-native/marketing'
import { NavigationService, Screen, useAppNavigation, useNavigation } from '@mu-native/navigation'
import { checkConnectionSafely } from '@mu-native/system'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import debounce from 'lodash.debounce'

import NavHeaderSearchBar from '../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import { COLOR_WHITE } from '../../constants/styles'
import FavoritesController from '../../Controllers/FavoritesController'
import ViewController from '../../Controllers/ViewController'
import type { MSScoreT } from '../../Model/MSScore'
import '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import reportEvent from '../../Utils/Analytics'
import { isTablet } from '../../Utils/Platform'

import { EmptyFavoritesList } from './EmptyFavoritesList'
import { EmptyFavoritesSearchResults } from './EmptyFavoritesSearchResults.tsx'
import { FavoritesLoadError } from './FavoritesLoadError'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    splashContainer: { flex: 1, justifyContent: 'center' },
    spacer: { height: 12 },
})

const ScreenFavorites = () => {
    const navigation = useAppNavigation()
    const [webUser] = useValues([authStoreChunk.props.getWebFavoriteUser])
    const openScore = useOpenScore()
    const scoreListChunk = useUniversalScoreListContext()

    const [
        searchText,
        scoresMap,
        scoreIds,
        isLoading,
        sortOrder,
        sortKind,
        isAuthorized,
        isInitialLoading,
    ] = useValues([
        scoreListChunk.props.getSearchQuery,
        scoreListChunk.props.getScoresMap,
        scoreListChunk.props.getScoresIds,
        scoreListChunk.props.getIsLoading,
        scoreListChunk.props.getSortOrder,
        scoreListChunk.props.getSortKind,
        getCanUseFavorites,
        scoreListChunk.props.getIsInitialLoading,
    ])
    const actions = useActions({
        logout: authThunks.logout,
        presentLogin: authStoreChunk.actions.presentAuthModal,
        setScores: scoreListChunk.actions.setScores,
        setSearchQuery: scoreListChunk.actions.setSearchQuery,
        setIsInitialLoading: scoreListChunk.actions.setIsInitialLoading,
        fetchFavorites: FavoritesController.fetchFavorites,
        loadMoreFavorites: FavoritesController.loadMoreFavorites,
        showSortPopup: ViewController.showScoreSortPopup,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
        setSort: scoreListChunk.actions.setSort,
    })

    const [refreshing, setRefreshing] = useState(false)
    const [isFetchingFavorites, setIsFetchingFavorites] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const loadAttempt = useRef(0)

    const fetchFavorites = useCallback(async (interactive = false) => {
        const attempt = ++loadAttempt.current
        setIsFetchingFavorites(true)
        setLoadError(null)
        try {
            await actions.fetchFavorites(scoreListChunk, interactive, error => {
                if (attempt === loadAttempt.current) setLoadError(error)
            })
        } finally {
            if (attempt === loadAttempt.current) {
                setIsFetchingFavorites(false)
                actions.setIsInitialLoading(false)
            }
        }
    }, [actions, scoreListChunk])

    useEffect(() => {
        void fetchFavorites()
    }, [sortKind, sortOrder, isAuthorized, webUser?.id])

    const isFirstFocus = useRef(true)
    useEffect(() => {
        return navigation.addListener('focus', () => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false
                return
            }
            void fetchFavorites()
        })
    }, [fetchFavorites, navigation])

    const doSearch = useMemo(() => debounce(() => { void fetchFavorites() }, 500), [fetchFavorites])
    useEffect(() => () => doSearch.cancel(), [doSearch])

    const onSearch = useCallback((value: string) => {
        actions.setSearchQuery(value)
        if (value.length > 2) {
            doSearch()
        }
    }, [actions, doSearch])

    const onClearSearchQuery = useCallback(() => {
        doSearch.cancel()
        actions.setSearchQuery('')
        void fetchFavorites()
    }, [actions, doSearch, fetchFavorites])

    const onOpenExplore = useCallback(() => {
        NavigationService.goBack()
        NavigationService.navigate(Screen.browse)
    }, [])

    const onLoadMore = useCallback(() => {
        actions.loadMoreFavorites(scoreListChunk)
    }, [])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        try {
            await fetchFavorites(true)
        } finally {
            setRefreshing(false)
        }
    }, [fetchFavorites])

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds.map(id => scoresMap[id]).filter(Boolean)
    }, [scoreIds, scoresMap, searchText])

    const sort = useMemo(() => ({ kind: sortKind, order: sortOrder }), [sortOrder, sortKind])

    const openFilterScreen = useCallback(
        () =>
            actions.showSortPopup(sort, (kind, order) => {
                actions.setSort({ order, kind })
            }),
        [sort],
    )

    const onItemPress = useCallback((score: MSScoreT) => {
        if (!checkConnectionSafely()) return

        actions.checkOpenScoreForSaleThunk({
            ui: 'favorites',
            score,
            callbackAfterCheck: () => {
                reportEvent(MetricaEvents.SCORE_CLICK, {
                    ...getScoreMetaEvent(score, score?.isOfficial),
                    screen: 'LibraryScores',
                    place: 'Favorites',
                })
                openScore(score, {
                    isFavorite: true,
                })
            },
        })
    }, [])

    const NavigationBar = (() => {
        return NavHeaderSearchBar
    })()

    const isInitiallyEmpty = !isInitialLoading && !scores.length
    const isListLoading = isFetchingFavorites || isLoading
    const showLoader = isInitialLoading || (isListLoading && !scores.length)

    return (
        <SafeAreaView edges={['left', 'right']} style={styles.container}>
            {!isAuthorized && <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: '#665777' }}>Локальное избранное</Text><Pressable onPress={() => actions.presentLogin()}><Text style={{ color: '#7355ff' }}>Войти</Text></Pressable></View>}
            {!!webUser && <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between' }}><Text>{webUser.name || webUser.email || 'Аккаунт MuseScore'}</Text><Pressable onPress={async () => { await actions.logout(); actions.setScores([]) }}><Text style={{ color: '#7355ff' }}>Выйти</Text></Pressable></View>}
            {!isInitiallyEmpty || isTablet ? (
                <NavigationBar
                    searchTerm={searchText}
                    onChangeText={onSearch}
                    clearInputValue={onClearSearchQuery}
                    isFilterWasOpen
                    openFilterScreen={openFilterScreen}
                    moduleKey="favorites"
                />
            ) : null}
            <View style={styles.spacer} />
            {!showLoader && loadError && <FavoritesLoadError message={loadError} onRetry={() => { void fetchFavorites(true) }} />}
            {showLoader && (
                <View accessible accessibilityRole="progressbar" style={styles.splashContainer}>
                    <BrandAppLoader />
                </View>
            )}
            {!showLoader && !loadError && !scores.length && (
                <>
                    {searchText ? (
                        <EmptyFavoritesSearchResults />
                    ) : (
                        <EmptyFavoritesList openExplore={onOpenExplore} />
                    )}
                </>
            )}
            {!isInitialLoading && !!scores.length && (
                <MSFlashList
                    testID={libraryTestIds.lists.favoritesScoresList}
                    scores={scores}
                    hasSearchFilter={!!searchText}
                    onItemPress={onItemPress}
                    enablePlayShortcut
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    isLoading={isListLoading}
                    loadMore={onLoadMore}
                />
            )}
        </SafeAreaView>
    )
}

const ScreenFavoritesFunc = () => {
    const { setOptions } = useNavigation()

    const { chunk } = useInjectDynamicStoreChunk('score_favorites', key =>
        createUniversalScoreListDynamicStoreChunk(key, 0, 0, {
            sortKind: 'date_added',
            sortOrder: 'desc',
        }),
    )

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return (
                    <NavHeader
                        testID={libraryTestIds.navigation.favoritesBack}
                        headerTitle={translate('native.screens_titles.favorites_screen')}
                        noNotifications
                    />
                )
            },
        })
    }, [])

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <ScreenFavorites />
        </UniversalScoreListContext.Provider>
    )
}

export default ScreenFavoritesFunc
