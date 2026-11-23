import { useCallback, useLayoutEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { setTestIds } from '@mu/mu-mobile-test-id'
import { useOpenScore } from '@mu-native/score'
import { BaseEmptyStateView, NavigationIconButton, BrandAppLoader } from '@mu-native/ds'
import { noteList } from '@mu-native/icons/noteList'
import { pencil } from '@mu-native/icons/pencil'
import { translate } from '@mu-native/locale'
import {
    NavigationService,
    Screen,
    useAppNavigation,
    useAppRoute,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import {
    createScoreSetDetailsDynamicStoreChunk,
    ScoreSetDetailsContext,
    scoreSetDetailsThunks,
    useScoreSetDetailsContext,
} from '@mu-native/score-set-details'
import { useFocusEffect } from '@react-navigation/native'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import { tabNavigators } from '../../../../src/navigation'
import NavHeaderSearchBar from '../../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import { COLOR_WHITE } from '../../../constants/styles'
import { MSScoreT } from '../../../Model/MSScore'
import MSFlashList from '../../../MSComponents/MSFlashList'
import reportEvent from '../../../Utils/Analytics'

import UserSetsHeaderContainer from './UserSetsHeaderContainer'

function filterScoreByName(scores: MSScoreT[], searchString: string) {
    if (!searchString) {
        return scores
    }
    const text = searchString.toLowerCase().trim()
    return scores.filter(({ title }) => {
        return title.toLowerCase().match(text)
    })
}

const UserSetScreen = () => {
    const { setId, userId, edit } = useAppRoute<{ userId: number; setId: number; edit: boolean }>()
    const setDetailsChunk = useScoreSetDetailsContext()

    const actions = useActions({
        fetchSet: scoreSetDetailsThunks.fetchSet,
        loadMoreScoresForSet: scoreSetDetailsThunks.loadMoreScoresInSet,
        updateSet: setDetailsChunk.actions.setSet,
    })

    const [scores, set, isLoading] = useValues([
        setDetailsChunk.props.getScores,
        setDetailsChunk.props.getSet,
        setDetailsChunk.props.getIsLoading,
    ])
    const navigation = useAppNavigation()
    const openScore = useOpenScore()
    const [searchText, setSearchText] = useState<string>('')

    useFocusEffect(
        useCallback(() => {
            actions.fetchSet(setDetailsChunk, userId)
        }, [actions, setDetailsChunk, userId]),
    )

    const onItemPress = (score: MSScoreT) => {
        reportEvent(MetricaEvents.SCORE_READ, {
            scoreId: score?.id,
            scoreTitle: score?.title,
            screen: edit ? 'My set' : 'Set',
            score_type: 'Set',
        })
        reportEvent(MetricaEvents.SCORE_CLICK, getScoreMetaEvent(score, score?.isOfficial))
        openScore(score)
    }

    const onEdit = useCallback(() => {
        navigation.navigate(Screen.createEditSet, {
            setId,
            userId,
            edit: true,
            onEdited: actions.updateSet,
        })
    }, [setId, userId])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <UserSetsHeaderContainer
                    headerTitle={set?.title ?? translate('native.user.set')}
                    rightComponent={
                        <NavigationIconButton
                            icon={pencil}
                            onPress={onEdit}
                            testID={setTestIds.actions.editSetButton}
                        />
                    }
                />
            ),
        })
    }, [set?.title, onEdit])

    const filteredData = filterScoreByName(scores, searchText)

    const onChange = useCallback(
        (text: string) => {
            setSearchText(text)
            reportEvent(MetricaEvents.SET_SEARCH_SUCCESS, {
                type: edit ? 'my' : 'user',
                elements: filteredData?.length || 0,
                text: searchText || '',
            })
        },
        [edit, filteredData?.length, searchText],
    )

    const [refreshing, setRefreshing] = useState(false)
    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true)
            await actions.fetchSet(setDetailsChunk, userId)
        } finally {
            setRefreshing(false)
        }
    }, [])

    const onCancel = useCallback(() => {
        setSearchText('')
    }, [])

    const handleSearch = () =>
        reportEvent(MetricaEvents.SET_SEARCH_FOCUS, {
            type: edit ? 'my' : 'user',
        })

    const handleLoadMore = () => actions.loadMoreScoresForSet(setDetailsChunk, userId)

    return (
        <View style={styles.container}>
            {!!scores.length && (
                <NavHeaderSearchBar
                    searchTerm={searchText}
                    onChangeText={onChange}
                    clearInputValue={onCancel}
                    onSearchFocus={handleSearch}
                    moduleKey="setScores"
                />
            )}
            {isLoading && filteredData.length === 0 && <BrandAppLoader />}

            {!isLoading && filteredData.length === 0 && (
                <BaseEmptyStateView
                    title={translate('native.set.empty_title')}
                    description={translate('native.set.empty_description')}
                    icon={noteList}
                    primaryButton={{
                        title: translate('native.set.empty_button'),
                        onPress: () => {
                            navigation.popToTop()
                            NavigationService.navigate(tabNavigators.browse)
                        },
                    }}
                />
            )}

            {!isLoading && filteredData.length > 0 && (
                <MSFlashList
                    testID={setTestIds.view.scoreList}
                    scores={filteredData}
                    onItemPress={onItemPress}
                    enablePlayShortcut
                    isLoading={isLoading}
                    refreshing={refreshing}
                    loadMore={handleLoadMore}
                    onRefresh={onRefresh}
                />
            )}
        </View>
    )
}

export const UserSetScreenContainer = () => {
    const { setId } = useAppRoute<{ userId: number; setId: number }>()
    const increment = useSameRouteInStackCount()
    const { chunk } = useInjectDynamicStoreChunk('set', key =>
        createScoreSetDetailsDynamicStoreChunk(key, setId, increment),
    )
    return (
        <ScoreSetDetailsContext.Provider value={chunk}>
            <UserSetScreen />
        </ScoreSetDetailsContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLOR_WHITE,
        flex: 1,
    },
})
