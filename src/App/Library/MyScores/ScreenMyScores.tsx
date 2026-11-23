import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { MuseButton, SafeAreaView } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useSameRouteInStackCount } from '@mu-native/navigation'
import { checkConnectionSafely } from '@mu-native/system'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import ScreenLayoutWrapperElement from '../../Elements/ScreenLayoutWrapperElement'
import { type MSScoreT, ScorePrivacy } from '../../Model/MSScore'
import '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import { COLOR_WHITE } from '../../constants/styles'
import reportEvent from '../../Utils/Analytics'
import { TSortKindEnum } from '../../Utils/Sort'
import { loadMoreUserScores, updateUserScores } from '../UserScores/userScoreAsyncActions'

import EmptyMyScoresList from './EmptyMyScoresList'

import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import ViewController from '../../Controllers/ViewController'

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    makePublicButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    }
})

const ScreenMyScores = () => {
    const navigation = useAppNavigation()
    const openScore = useOpenScore()
    const skipFirstUpdate = useRef(true)

    const chunk = useUniversalScoreListContext()
    const [isAuthorized, searchText] = useValues([getIsAuthorized, chunk.props.getSearchQuery])
    const actions = useActions({
        onSearch: chunk.actions.setSearchQuery,
        update: updateUserScores,
        loadMore: loadMoreUserScores,
        showSortPopup: ViewController.showScoreSortPopup,
        setSorting: chunk.actions.setSort,
    })

    const [scoreIds, scoresMap, isLoading, sortKind, sortOrder] = useValues([
        chunk.props.getScoresIds,
        chunk.props.getScoresMap,
        chunk.props.getIsLoading,
        chunk.props.getSortKind,
        chunk.props.getSortOrder,
    ])
    const sorting = useMemo(() => ({ kind: sortKind, order: sortOrder }), [sortKind, sortOrder])

    useEffect(() => {
        actions.update(chunk)
    }, [actions, chunk, sorting])

    useEffect(() => {
        return navigation.addListener('focus', () => {
            actions.update(chunk)
        })
    }, [actions, chunk, navigation])

    useEffect(() => {
        if (skipFirstUpdate.current) {
            skipFirstUpdate.current = false
            return
        }
        if (searchText.length === 0 || searchText.length > 2) {
            actions.update(chunk, 1)
        }
    }, [actions, chunk, searchText])

    useEffect(() => {
        return () => {
            actions.onSearch('')
        }
    }, [actions])

    const onClearSearch = useCallback(() => actions.onSearch(''), [])

    const onOpenFilterScreen = useCallback(() => {
        actions.showSortPopup(sorting, (kind, order) => actions.setSorting({ kind, order }), [
            TSortKindEnum.DATE_CREATED,
            TSortKindEnum.DATE_UPDATED,
            TSortKindEnum.VIEWS,
        ])
    }, [actions, sorting])

    const onItemPress = useCallback((score: MSScoreT) => {
        if (!checkConnectionSafely()) return
        reportEvent(
            MetricaEvents.SCORE_CLICK,
            getScoreMetaEvent(score, score?.isOfficial, { place: 'My Scores' }),
        )
        openScore(score)
    }, [])

    const renderScoreExtra = useCallback(
        (score: MSScoreT) => {
            if (score.privacy === ScorePrivacy.PUBLIC) return null
            return (
                <MuseButton
                    size="small"
                    type="secondary"
                    title={translate('native.make_public.make_public_button')}
                    onPress={() => {
                        reportEvent(RT_EVENTS.SCORE_MAKE_PUBLIC_CLICK, {
                            ...getScoreMetaEvent(score),
                            'params.key': ['placement'],
                            'params.str_value': ['my_scores'],
                            'params.value': [0],
                        })
                        navigation.push(Screen.makePublic, { score, placement: 'my_scores' })
                    }}
                    style={styles.makePublicButton}
                />
            )
        },
        [navigation],
    )

    const [refreshing, setRefreshing] = useState(false)
    const onRefresh = useCallback(async () => {
        if (!checkConnectionSafely()) return
        try {
            setRefreshing(true)
            await actions.update(chunk)
        } finally {
            setRefreshing(false)
        }
    }, [actions, chunk])

    const onLoadMore = useCallback(() => {
        actions.loadMore(chunk)
    }, [actions, chunk])

    const NavigationBar = (() => {
        if (!isAuthorized) return () => null
        return NavHeaderSearchBar
    })()

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds.map(id => scoresMap[id]).filter(Boolean)
    }, [scoreIds, scoresMap])
    const hasScores = scores.length > 0
    const shouldShowHeader = hasScores || !!searchText

    return (
        <ScreenLayoutWrapperElement>
            <SafeAreaView edges={['right', 'left']} style={styles.flex}>
                {shouldShowHeader && (
                    <NavigationBar
                        searchTerm={searchText}
                        onChangeText={actions.onSearch}
                        clearInputValue={onClearSearch}
                        isFilterWasOpen
                        openFilterScreen={onOpenFilterScreen}
                        moduleKey="uploaded"
                    />
                )}
                <MSFlashList
                    testID={libraryTestIds.lists.myScoresList}
                    scores={scores}
                    hasSearchFilter={!!searchText}
                    onItemPress={onItemPress}
                    onRefresh={onRefresh}
                    loadMore={onLoadMore}
                    isLoading={isLoading}
                    refreshing={refreshing}
                    ListEmptyComponent={<EmptyMyScoresList isSearching={!!searchText} />}
                    renderScoreExtra={renderScoreExtra}
                    scoreVariant="myScores"
                    enablePlayShortcut
                />
            </SafeAreaView>
        </ScreenLayoutWrapperElement>
    )
}

const ScreenMyScoresFunc = () => {
    const { setOptions } = useAppNavigation()

    const [user] = useValues([authStoreChunk.props.getUser])

    const increment = useSameRouteInStackCount()
    const { chunk } = useInjectDynamicStoreChunk(`user_profile`, key =>
        createUniversalScoreListDynamicStoreChunk(key, user.id ?? -1, increment),
    )

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return (
                    <NavHeader
                        testID={libraryTestIds.navigation.myScoresBack}
                        headerTitle={translate('native.screens_titles.my_scores_screen')}
                        noNotifications
                    />
                )
            },
        })
    }, [])

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <ScreenMyScores />
        </UniversalScoreListContext.Provider>
    )
}

export default ScreenMyScoresFunc
