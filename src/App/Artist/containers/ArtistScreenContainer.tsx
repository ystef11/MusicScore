import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import {
    NativeBottomSheet,
    NativeBottomSheetRef,
    NavigationIconButton,
    useAppSafeArea,
} from '@mu-native/ds'
import { infoCircle } from '@mu-native/icons/infoCircle'
import { translate } from '@mu-native/locale'
import {
    navigationThunks,
    Screen,
    useAppNavigation,
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
import { SegmentControl } from '../../Elements/segmentControl/SegmentControl'
import type { MSScoreT } from '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import reportEvent from '../../Utils/Analytics'
import ArtistCard from '../components/card/ArtistCard'
import { loadArtistInfo, loadArtistScores, loadMoreArtistScores } from '../store/artistActionsAsync'
import {
    ArtistDetailsContext,
    createArtistDetailsDynamicStoreChunk,
    useArtistDetailsContext,
} from '../store/artistDetailsDynamicStoreChunk.ts'

import { ArtistInfoContainer } from './infoContainer/ArtistInfoContainer'

const segments = [translate('native.artist.segment.sheet_music'), translate('native.artist.segment.compositions')]

const ArtistScreenContainer = () => {
    const navigation = useAppNavigation()
    const openScore = useOpenScore()
    const scoreListChunk = useUniversalScoreListContext()
    const artistDetailsChunk = useArtistDetailsContext()

    const [scoreIds, scoresMap, info, loading] = useValues([
        scoreListChunk.props.getScoresIds,
        scoreListChunk.props.getScoresMap,
        artistDetailsChunk.props.getInfo,
        scoreListChunk.props.getIsLoading,
    ])
    const actions = useActions({
        loadArtistScores,
        loadArtistInfo,
        loadMoreArtistScores,
        setScreens: navigationThunks.setScreen,
    })

    const [query, setQuery] = useState('')
    const [layoutWidth, setLayoutWidth] = useState(0)
    const [activeSegment, setActiveSegment] = useState(0)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        reportEvent(MetricaEvents.ARTIST_OPEN)
        actions.setScreens('ArtistSheetmusic')
        actions.loadArtistInfo(artistDetailsChunk)
        actions.loadArtistScores(scoreListChunk)
    }, [actions, artistDetailsChunk, scoreListChunk])

    useEffect(() => {
        actions.setScreens(activeSegment === 0 ? 'ArtistSheetmusic' : 'ArtistSongs')
    }, [actions, activeSegment])

    const scores = useMemo(() => {
        if (!scoreIds || !scoresMap) return []
        return scoreIds
            .map(id => scoresMap[id])
            .filter(Boolean)
            .filter(score =>
                query ? score.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) : true,
            )
    }, [scoreIds, scoresMap, query])

    const { left, right } = useAppSafeArea({ left: 0, right: 0 })

    const onCompositionPress = useCallback(
        (composition: { id: number; name: string }) => {
            navigation.push(Screen.songSheetmusic, { compositionId: composition.id })
        },
        [navigation],
    )

    const onItemPress = useCallback(
        (score: MSScoreT) => {
            reportEvent(
                MetricaEvents.SCORE_CLICK,
                getScoreMetaEvent(score, undefined, { place: 'Artist' }),
            )
            openScore(score)
        },
        [openScore],
    )

    const onSegmentChange = useCallback(
        (activeSegment: number): void => {
            actions.setScreens(activeSegment ? 'ArtistSongs' : 'ArtistSheetmusic')
            setActiveSegment(activeSegment)

            const event = !activeSegment
                ? MetricaEvents.ARTIST_SHEETMUSIC_OPEN
                : MetricaEvents.ARTIST_COMPOSIITION_OPEN

            reportEvent(event)
        },
        [actions],
    )

    const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
        setLayoutWidth(nativeEvent.layout.width)
    }

    const onClearQuery = useCallback(() => {
        setQuery('')
    }, [])

    const onSearchFocus = useCallback(() => {
        reportEvent(MetricaEvents.ARTIST_SEARCH_BAR_CLICK)
    }, [])

    const onLoadMore = async () => {
        if (activeSegment !== 0 || loading) return
        actions.loadMoreArtistScores(scoreListChunk)
    }

    const onRefresh = async () => {
        if (!checkConnectionSafely()) return

        setRefreshing(true)
        try {
            await actions.loadArtistScores(scoreListChunk)
        } finally {
            setRefreshing(false)
        }
    }

    const contentWidth = Math.min((layoutWidth - left - right) * 0.95, MAX_TABLET_WIDTH)

    const listHeader = (
        <View style={styles.listHeaderContainer}>
            <ArtistCard
                titleText={info?.name ?? ''}
                contentWidth={contentWidth}
                compositions={info?.counters?.songs ?? 0}
                scores={info?.counters?.scores ?? 0}
                avatarImage={info?.avatar ?? undefined}
            />
            <View style={styles.segmentControlContainer}>
                <SegmentControl
                    segments={segments}
                    activeIndex={activeSegment}
                    onChange={onSegmentChange}
                />
            </View>
        </View>
    )

    return (
        <View style={styles.container} onLayout={onLayout}>
            <NavHeaderSearchBar
                searchTerm={query}
                onChangeText={setQuery}
                clearInputValue={onClearQuery}
                onSearchFocus={onSearchFocus}
                moduleKey="artist"
            />
            <MSFlashList
                scores={activeSegment === 0 ? scores : undefined}
                compositions={activeSegment === 1 ? info?.songs : undefined}
                onRefresh={onRefresh}
                isLoading={loading}
                refreshing={refreshing}
                loadMore={onLoadMore}
                onItemPress={onItemPress}
                onCompositionPress={onCompositionPress}
                listHeaderComponent={listHeader}
            />
        </View>
    )
}

export const ArtistScreenContainerFunc = (props: any) => {
    const { setOptions } = useNavigation()
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const { artistId } = useAppRoute<{ artistId: number }>()
    const increment = useSameRouteInStackCount()
    const { chunk: scoreListChunk } = useInjectDynamicStoreChunk('artist', key =>
        createUniversalScoreListDynamicStoreChunk(key, artistId, increment),
    )
    const { chunk: artistDetailsChunk } = useInjectDynamicStoreChunk('artist', key =>
        createArtistDetailsDynamicStoreChunk(key, artistId, increment),
    )

    const [info] = useValues([artistDetailsChunk.props.getInfo])

    useLayoutEffect(() => {
        const showInfo = () => {
            reportEvent(MetricaEvents.ARTIST_INFO_EXPAND)
            sheetRef.current?.present(info)
        }

        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    headerTitle={translate('native.artist')}
                    noNotifications
                    endComponents={[
                        <NavigationIconButton key="info" icon={infoCircle} onPress={showInfo} />,
                    ]}
                />
            ),
        })
    }, [info, setOptions])

    return (
        <ArtistDetailsContext.Provider value={artistDetailsChunk}>
            <UniversalScoreListContext.Provider value={scoreListChunk}>
                <ArtistScreenContainer {...props} />
                <NativeBottomSheet ref={sheetRef}>
                    {info => <ArtistInfoContainer info={info} />}
                </NativeBottomSheet>
            </UniversalScoreListContext.Provider>
        </ArtistDetailsContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    listHeaderContainer: {
        paddingTop: 8,
        alignItems: 'center',
    },
    segmentControlContainer: {
        width: '100%',
        height: 90,
        justifyContent: 'center',
        paddingHorizontal: 60,
    },
})
