import { useCallback, useEffect, useLayoutEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { getUserId } from '@mu-native/auth'
import { brandColors, NavigationIconButton } from '@mu-native/ds'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import {
    NavigationService,
    navigationThunks,
    RouteProp,
    Screen,
    useAppNavigation,
    useAppRoute,
    useRoute,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import {
    createScoreSetListDynamicStoreChunk,
    ScoreSetListContext,
    scoreSetListThunks,
    useScoreSetListContext,
} from '@mu-native/score-set-list'
import { useFocusEffect } from '@react-navigation/native'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import { ListLoaderComponent } from '../../../MSComponents/MSFlashList.tsx'
import reportEvent from '../../../Utils/Analytics'
import { LOCAL_SETS_OWNER } from '../localScoreSets'
import { UserSetsList } from '../components/UserSetsList'
import { SetT } from '../userTypes'

import UserSetsHeaderContainer from './UserSetsHeaderContainer'

const UserSetsScreen = () => {
    const { params } =
        useRoute<
            RouteProp<
                { Screen: { userId: number; userName: string; customScreenName?: string } },
                'Screen'
            >
        >()

    const scoreSetListChunk = useScoreSetListContext()

    const actions = useActions({
        fetchSets: scoreSetListThunks.fetchSets,
        loadMoreSets: scoreSetListThunks.loadMoreSets,
        setScreens: navigationThunks.setScreen,
    })
    const [authorizedUserId, isLoading, sets] = useValues([
        getUserId,
        scoreSetListChunk.props.getIsLoading,
        scoreSetListChunk.props.getItems,
    ])
    const navigation = useAppNavigation()
    const isMy = params.userId === LOCAL_SETS_OWNER || authorizedUserId === params.userId
    const headerTitle =
        isMy || params?.userName === translate('native.user.my')
            ? translate('native.library.my_sets_title')
            : translate('native.user.sets_of_user', { userName: params?.userName ?? '' })
    const userId = params!.userId!

    const handleCreate = () => {
        reportEvent(MetricaEvents.SET_NEW_CREATE_CLICK)
        navigation.navigate(Screen.createEditSet, { userId, edit: false })
    }

    const handleSet = (set: SetT) => {
        NavigationService.push(Screen.profileSheetmusic, { userId, setId: set.id, edit: isMy })
    }

    const handleLoadMore = () => {
        actions.loadMoreSets(scoreSetListChunk)
    }

    const handleSearch = () =>
        reportEvent(MetricaEvents.SETS_SEARCH_FOCUS, {
            type: !isMy ? 'user' : 'my',
        })

    const setNavigationScreenForAnalytic = () => {
        // TODO: удалить, когда перепишем модуль profile
        const { customScreenName } = params || { customScreenName: '' }
        let screenName = 'ProfileSets'

        if (isMy) {
            screenName = `My${screenName}`
        }

        if (customScreenName) {
            screenName = customScreenName
        }

        actions.setScreens(screenName)
        navigation.setParams({
            customScreenName: screenName,
        })
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <UserSetsHeaderContainer
                    testID={libraryTestIds.navigation.mySetsBack}
                    headerTitle={headerTitle}
                    rightComponent={<NavigationIconButton icon={plus} onPress={handleCreate} />}
                />
            ),
        })
    }, [])

    useEffect(() => {
        setNavigationScreenForAnalytic()
    }, [])

    useFocusEffect(useCallback(() => {
        void actions.fetchSets(scoreSetListChunk)
    }, [actions, scoreSetListChunk]))

    if (isLoading) {
        return <ListLoaderComponent />
    }

    return (
        <View style={styles.base}>
            <UserSetsList
                data={sets}
                onEdit={handleSet}
                onEmpty={handleCreate}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
                onFocus={handleSearch}
            />
        </View>
    )
}

export const UserSetsScreenContainer = () => {
    const { userId } = useAppRoute<{ userId: number }>()
    const increment = useSameRouteInStackCount()
    const { chunk } = useInjectDynamicStoreChunk('user_sets', key =>
        createScoreSetListDynamicStoreChunk(key, userId, increment),
    )
    return (
        <ScoreSetListContext.Provider value={chunk}>
            <UserSetsScreen />
        </ScoreSetListContext.Provider>
    )
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
})
