import { useEffect, useLayoutEffect, useRef } from 'react'
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native'

import { translate } from '@mu-native/locale'
import {
    Screen,
    useAppNavigation,
    useAppRoute,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import {
    createUserProfileDynamicStoreChunk,
    UserProfileInfoContext,
    userProfileInfoThunks,
    useUserProfileContext,
} from '@mu-native/user-profile-info'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import NavHeaderSearchBar from '../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import {
    COLOR_DEEP_BLUE,
    COLOR_LIGHT_BLUE,
    MARGIN_MD,
    MARGIN_XS,
    MAX_TABLET_WIDTH,
} from '../../constants/styles'
import ViewController from '../../Controllers/ViewController'
import { updateUserScores } from '../../Library/UserScores/userScoreAsyncActions'
import { TScoreList } from '../../MSComponents/MSFlashList.tsx'
import reportEvent from '../../Utils/Analytics'
import { ProfileCard } from '../components/ProfileCard'

import { UserScoresList } from './components/UserScoresList'

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLOR_LIGHT_BLUE,
    },
    cardContainer: {
        marginTop: MARGIN_XS,
        marginBottom: MARGIN_MD,
    },
    spacer: {
        marginBottom: 8,
    },
    emptyContainer: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_TABLET_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
        color: COLOR_DEEP_BLUE,
    },
})

type TListHeaderProps = {
    searchValue: string
    onLayout: (event: LayoutChangeEvent) => void
    onChangeSearchValue: (searchValue: string) => void
    onClearSearchValue: () => void
    onOpenScores: () => void
    onOpenSets: () => void
    onOpenFollowers: () => void
    onOpenFollowings: () => void
}

const ListHeader = ({
    searchValue,
    onChangeSearchValue,
    onClearSearchValue,
    onLayout,
    onOpenScores,
    onOpenSets,
    onOpenFollowers,
    onOpenFollowings,
}: TListHeaderProps) => {
    const scoreListChunk = useUniversalScoreListContext()
    const userProfileChunk = useUserProfileContext()

    const [userProfileInfo, scoresNumber] = useValues([
        userProfileChunk.props.getInfo,
        scoreListChunk.props.getTotalItems,
    ])

    const { followUser, unfollowUser } = useActions({
        followUser: userProfileInfoThunks.toggleFollowUser,
        unfollowUser: ViewController.showUserProfileActionSheet,
    })

    return (
        <View style={styles.cardContainer} onLayout={onLayout}>
            <ProfileCard
                userProfileInfo={userProfileInfo}
                followUser={() => followUser(userProfileInfo, userProfileChunk)}
                unfollowUser={() => unfollowUser(userProfileInfo, userProfileChunk)}
                scoresNumber={scoresNumber}
                sets={userProfileInfo?.setsCount ?? 0}
                openScores={onOpenScores}
                openSets={onOpenSets}
                openFollowers={onOpenFollowers}
                openFollowings={onOpenFollowings}
            />
            <View style={styles.spacer}>
                <NavHeaderSearchBar
                    searchTerm={searchValue}
                    onChangeText={onChangeSearchValue}
                    clearInputValue={onClearSearchValue}
                    moduleKey="user"
                />
            </View>
        </View>
    )
}

const EmptyList = ({ searchValue }: { searchValue: string }) => {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.title}>
                {!!searchValue && translate('native.search.empty')}
                {!searchValue && translate('native.user.empty_scores')}
            </Text>
        </View>
    )
}

const UserProfileScreenContainer = () => {
    const navigation = useAppNavigation()
    const { userId } = useAppRoute<{ userId: number }>()

    const userProfileChunk = useUserProfileContext()

    const [userProfileInfo] = useValues([userProfileChunk.props.getInfo])

    const chunk = useUniversalScoreListContext()

    const [searchValue] = useValues([chunk.props.getSearchQuery])

    const actions = useActions({
        updateUserScores,
        fetchUserInfo: userProfileInfoThunks.fetchUserProfileInfo,
        setSearchQuery: chunk.actions.setSearchQuery,
    })

    const skipFirstUpdate = useRef(true)
    const headerHeightRef = useRef(0)
    const headerHeight = headerHeightRef.current
    const listRef = useRef<TScoreList>(null)

    useEffect(() => {
        actions.fetchUserInfo(userProfileChunk, userId)

        const remover = navigation.addListener('focus', () => {
            actions.updateUserScores(chunk)
        })

        return () => {
            remover()
        }
    }, [actions, chunk, navigation, userId, userProfileChunk])

    useEffect(() => {
        if (skipFirstUpdate.current) {
            skipFirstUpdate.current = false
            return
        }
        if (searchValue.length === 0 || searchValue.length > 2) {
            actions.updateUserScores(chunk, 1)
        }
    }, [actions, chunk, searchValue])

    useEffect(() => {
        return () => {
            actions.setSearchQuery('')
        }
    }, [actions])

    const openFollowings = () => {
        navigation.push(Screen.followers, {
            title: translate('native.user.followings'),
            mode: 'followings',
            userId,
        })
    }

    const openFollowers = () => {
        navigation.push(Screen.followers, {
            title: translate('native.user.followers'),
            mode: 'followers',
            userId,
        })
    }

    const openSets = () => {
        reportEvent(MetricaEvents.SETS_OPEN, {
            type: 'user',
            elements: userProfileInfo?.setsCount ?? 0,
        })
        navigation.navigate(Screen.profileSet, {
            userId,
            userName: userProfileInfo?.userName ?? '',
        })
    }

    const openScores = () => {
        listRef.current?.scrollToOffset({ animated: true, offset: headerHeight })
    }

    const ListHeaderComponent = (
        <ListHeader
            searchValue={searchValue}
            onChangeSearchValue={actions.setSearchQuery}
            onClearSearchValue={() => actions.setSearchQuery('')}
            onLayout={e => {
                headerHeightRef.current = e.nativeEvent.layout.height
            }}
            onOpenScores={openScores}
            onOpenSets={openSets}
            onOpenFollowings={openFollowings}
            onOpenFollowers={openFollowers}
        />
    )

    return (
        <View style={styles.container}>
            <UserScoresList
                ref={listRef}
                testID="User profile"
                userId={userId}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={<EmptyList searchValue={searchValue} />}
            />
        </View>
    )
}

const UserProfileScreenContainerFunc = (props: any) => {
    const { setOptions } = useAppNavigation()

    const { userId } = useAppRoute<{ userId: number }>()
    const increment = useSameRouteInStackCount()
    const { chunk: scoreListChunk } = useInjectDynamicStoreChunk(`user_profile`, key =>
        createUniversalScoreListDynamicStoreChunk(key, userId, increment),
    )
    const { chunk: userProfileChunk } = useInjectDynamicStoreChunk(`user_profile`, key =>
        createUserProfileDynamicStoreChunk(key, userId, increment),
    )

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    testID="User profile back"
                    headerTitle={props.route?.params?.userName}
                    noNotifications
                />
            ),
        })
    }, [])

    return (
        <UniversalScoreListContext.Provider value={scoreListChunk}>
            <UserProfileInfoContext.Provider value={userProfileChunk}>
                <UserProfileScreenContainer {...props} />
            </UserProfileInfoContext.Provider>
        </UniversalScoreListContext.Provider>
    )
}

export default UserProfileScreenContainerFunc
