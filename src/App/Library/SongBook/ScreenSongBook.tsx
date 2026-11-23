import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { useOpenScore } from '@mu-native/score'
import { KeyboardSpacer, presentAlert, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useNavigation } from '@mu-native/navigation'
import { songbookStoreChunk } from '@mu-native/songbook'
import { useActions, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import SongBookController from '../../Controllers/SongBookController'
import ViewController from '../../Controllers/ViewController'
import ScreenLayoutWrapperElement from '../../Elements/ScreenLayoutWrapperElement'
import type { MSScoreT } from '../../Model/MSScore'
import MSFlashList from '../../MSComponents/MSFlashList'
import reportEvent from '../../Utils/Analytics'
import searchLibrary from '../../Utils/Search'
import sortScores, { TSortKind, TSortKindEnum, TSortOrder } from '../../Utils/Sort'

import EmptySongBookList from './EmptySongBookList'
import { OfflineScoreMenu } from './OfflineScoreMenu'

const ScreenSongBook = () => {
    const openScore = useOpenScore()

    const [songBookScores, songbookOrders, sortOrder, sortKind] = useValues([
        songbookStoreChunk.props.getScores,
        songbookStoreChunk.props.getOrderScores,
        songbookStoreChunk.props.getSortOrder,
        songbookStoreChunk.props.getSortKind,
    ])
    const actions = useActions({
        update: SongBookController.updateSongBook,
        setSort: songbookStoreChunk.actions.setSort,
        showScoreSortPopup: ViewController.showScoreSortPopup,
    })

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        reportEvent('Temp Offline Library Show')
    }, [])

    const onOpenFilters = useCallback(() => {
        const sort = { order: sortOrder, kind: sortKind }
        const callback = (kind: TSortKind, order: TSortOrder) => {
            reportEvent(MetricaEvents.SONG_BOOK_SORT_CHANGE, {
                value: { sortKind: kind, sortOrder: order },
            })
            actions.setSort({ order, kind })
        }
        actions.showScoreSortPopup(sort, callback, [
            TSortKindEnum.TITLE,
            TSortKindEnum.DATE_UPDATED,
        ])
    }, [sortOrder, sortKind])

    const onItemPress = useCallback(async (score: MSScoreT) => {
        reportEvent(
            MetricaEvents.SCORE_CLICK,
            getScoreMetaEvent(score, score?.isOfficial, { place: 'Offline Scores' }),
        )
        reportEvent('Temp Offline Library Item Click', {
            value: score?.source?.isAiScan ? 'scanned_item' : 'item',
        })

        const hasInSongBook = SongBookController.isInSongBook(score)
        if (hasInSongBook && !score?.id) {
            const id = await presentAlert({
                cancelable: true,
                rawTitle: translate('native.library.songbook.corrupted_file_title'),
                rawMessage: translate('native.library.songbook.corrupted_file_message'),
                buttons: [
                    {
                        style: 'destructive',
                        rawText: translate('native.score_action_sheet.delete_button'),
                        id: 'delete',
                    },
                ],
            })
            if (id === 'delete') SongBookController.removeFromSongBook(score)
        } else {
            openScore(score)
        }
    }, [])

    const onClearSearchQuery = useCallback(() => setSearchQuery(''), [])

    const { update } = actions

    const scores = useMemo(() => {
        const unifiedList = [...songbookOrders, ...songBookScores]
        const sections = searchLibrary(
            { songBookScores: unifiedList, searchText: searchQuery },
            'songbook',
        )
        const filteredScores =
            sections.find(section => section.context.indexOf('songbook') > -1)?.data ?? []
        return sortScores(filteredScores, sortKind, sortOrder)
    }, [songbookOrders, songBookScores, searchQuery, sortKind, sortOrder])

    const hasScores = !!scores?.length

    return (
        <ScreenLayoutWrapperElement>
            {hasScores && (
                <NavHeaderSearchBar
                    searchTerm={searchQuery}
                    onChangeText={setSearchQuery}
                    clearInputValue={onClearSearchQuery}
                    isFilterWasOpen
                    openFilterScreen={onOpenFilters}
                    moduleKey="songbook"
                />
            )}
            {hasScores && (
                <MSFlashList
                    scores={scores}
                    hasSearchFilter={!!searchQuery}
                    onItemPress={onItemPress}
                    renderScoreTrailing={score => <OfflineScoreMenu key={score.id} score={score} />}
                    enablePlayShortcut
                    onRefresh={update}
                    containerStyle={{ paddingBottom: staticSafeArea().bottom }}
                />
            )}
            {!hasScores && <EmptySongBookList />}
            <KeyboardSpacer />
        </ScreenLayoutWrapperElement>
    )
}

const SongBookScreenFunc = (props: any) => {
    const { setOptions } = useNavigation()

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    testID="Songbook back"
                    {...props}
                    isSongBook
                    headerTitle={translate('native.screens_titles.songbook_screen')}
                    noNotifications
                />
            ),
        })
    }, [])

    return <ScreenSongBook {...props} />
}

export default SongBookScreenFunc
