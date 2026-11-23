import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import {
    NavigationIconButton,
    useAppSafeArea,
    NativeBottomSheet,
    NativeBottomSheetRef,
} from '@mu-native/ds'
import { infoCircle } from '@mu-native/icons/infoCircle'
import { translate } from '@mu-native/locale'
import {
    useAppRoute,
    useNavigation,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import { checkConnectionSafely } from '@mu-native/system'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { NavHeader } from '../../Components/NavHeader/NavHeader.tsx'
import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import { COLOR_WHITE, MAX_TABLET_WIDTH } from '../../constants/styles'
import type { MSScoreT } from '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import reportEvent from '../../Utils/Analytics'
import ArtistCard from '../components/card/ArtistCard'
import {
    loadCompositionInfo,
    loadCompositionScores,
    loadMoreCompositionScores,
} from '../store/artistActionsAsync'
import {
    CompositionDetailsContext,
    createCompositionDetailsDynamicStoreChunk,
    useCompositionDetailsContext,
} from '../store/compositionDetailsDynamicStoreChunk.ts'

import { CompositionInfoContainer } from './CompositionInfoContainer'

const CompositionScreenContainer = () => {
    const openScore = useOpenScore()
    const scoreListChunk = useUniversalScoreListContext()
    const compositionDetailsChunk = useCompositionDetailsContext()

    const [scoreIds, scoresMap, info, loading] = useValues([
        scoreListChunk.props.getScoresIds,
        scoreListChunk.props.getScoresMap,
        compositionDetailsChunk.props.getInfo,
        scoreListChunk.props.getIsLoading,
    ])

    const actions = useActions({
        loadCompositionScores,
        loadMoreCompositionScores,
        loadCompositionInfo,
    })

    const [query, setQuery] = useState('')
    const [layoutWidth, setLayoutWidth] = useState(0)
    const [refreshing, setRefreshing] = useState(false)

    const { left, right } = useAppSafeArea({ left: 0, right: 0 })
    const contentWidth = Math.min((layoutWidth - left - right) * 0.95, MAX_TABLET_WIDTH)

    useEffect(() => {
        reportEvent(MetricaEvents.COMPOSITION_OPEN)
        actions.loadCompositionInfo(compositionDetailsChunk)
        actions.loadCompositionScores(scoreListChunk)
    }, [])

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds
            .map(id => scoresMap[id])
            .filter(Boolean)
            .filter(score =>
                query ? score.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) : true,
            )
    }, [scoreIds, scoresMap, query])

    const onLoadMore = async () => {
        if (loading) return
        actions.loadMoreCompositionScores(scoreListChunk)
    }

    const onRefresh = async () => {
        if (!checkConnectionSafely()) return

        setRefreshing(true)
        try {
            await actions.loadCompositionScores(scoreListChunk)
        } finally {
            setRefreshing(false)
        }
    }

    const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
        setLayoutWidth(nativeEvent.layout.width)
    }

    const onClearQuery = useCallback(() => {
        setQuery('')
    }, [])

    const onSearchFocus = useCallback(() => {
        reportEvent(MetricaEvents.COMPOSITION_SEARCH_BAR_CLICK)
    }, [])

    const onItemPress = useCallback((score: MSScoreT) => {
        reportEvent(
            MetricaEvents.SCORE_CLICK,
            getScoreMetaEvent(score, undefined, { place: 'Composition' }),
        )
        openScore(score)
    }, [openScore])

    const listHeader = (
        <View style={styles.listHeaderContainer}>
            <ArtistCard
                titleText={info?.name ?? ''}
                contentWidth={contentWidth}
                scores={info?.counters?.scores ?? 0}
                avatarImage={info?.avatar ?? undefined}
            />
        </View>
    )

    return (
        <View style={styles.container} onLayout={onLayout}>
            <NavHeaderSearchBar
                searchTerm={query}
                onChangeText={setQuery}
                clearInputValue={onClearQuery}
                onSearchFocus={onSearchFocus}
                moduleKey="composition"
            />
            <MSFlashList
                scores={scores}
                isLoading={loading}
                refreshing={refreshing}
                onRefresh={onRefresh}
                loadMore={onLoadMore}
                onItemPress={onItemPress}
                listHeaderComponent={listHeader}
            />
        </View>
    )
}

export const CompositionScreenContainerFunc = () => {
    const { setOptions } = useNavigation()
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const { compositionId } = useAppRoute<{ compositionId: number }>()
    const increment = useSameRouteInStackCount()

    const { chunk: scoreListChunk } = useInjectDynamicStoreChunk('composition', key =>
        createUniversalScoreListDynamicStoreChunk(key, compositionId, increment),
    )
    const { chunk: compositionDetailsChunk } = useInjectDynamicStoreChunk('artist', key =>
        createCompositionDetailsDynamicStoreChunk(key, compositionId, increment),
    )
    const [info] = useValues([compositionDetailsChunk.props.getInfo])

    useLayoutEffect(() => {
        const showInfo = () => {
            reportEvent(MetricaEvents.COMPOSITION_INFO_EXPAND)
            sheetRef.current?.present(info)
        }
 
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    headerTitle={translate('native.artists.composition')}
                    noNotifications
                    endComponents={[
                        <NavigationIconButton key="info" icon={infoCircle} onPress={showInfo} />,
                    ]}
                />
            ),
        })
    }, [info, setOptions])

    const dismissSheet = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    return (
        <CompositionDetailsContext.Provider value={compositionDetailsChunk}>
            <UniversalScoreListContext.Provider value={scoreListChunk}>
                <CompositionScreenContainer />
                <NativeBottomSheet ref={sheetRef}>
                    {info => {
                        return <CompositionInfoContainer closeModal={dismissSheet} info={info} />
                    }}
                </NativeBottomSheet>
            </UniversalScoreListContext.Provider>
        </CompositionDetailsContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },

    listHeaderContainer: {
        paddingTop: 8,
        paddingBottom: 28,
        alignItems: 'center',
    },
})
