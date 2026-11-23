import { memo, useEffect, useLayoutEffect } from 'react'

import { getUserId } from '@mu-native/auth'
import { BaseEmptyStateView } from '@mu-native/ds'
import { userAdd } from '@mu-native/icons/userAdd'
import { userGroup } from '@mu-native/icons/userGroup'
import { translate } from '@mu-native/locale'
import {
    navigationThunks,
    useAppRoute,
    useNavigation,
    useSameRouteInStackCount,
} from '@mu-native/navigation'
import {
    createUserProfileDynamicStoreChunk,
    UserProfileInfoContext,
    userProfileInfoThunks,
    useUserProfileContext,
} from '@mu-native/user-profile-info'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import { NavHeader } from '../../../Components/NavHeader/NavHeader'
import { UserFollowersList } from '../components/UserFollowersList'

const UserFollowerScreen = memo(() => {
    const params = useAppRoute<{
        mode: 'followers' | 'followings'
        userId: number
        title: string
    }>()
    const navigation = useNavigation()
    const actions = useActions({
        fetchFollowingInfo: userProfileInfoThunks.fetchFollowingInfo,
        fetchFollowerInfo: userProfileInfoThunks.fetchFollowerInfo,
        setScreen: navigationThunks.setScreen,
    })

    const userProfileChunk = useUserProfileContext()

    const [followersData, followingsData, userId] = useValues([
        userProfileChunk.props.getFollowersData,
        userProfileChunk.props.getFollowingsData,
        getUserId,
    ])
    const { users, page, totalPages, isLoading } =
        params?.mode === 'followings' ? followingsData : followersData
    const isMe = userId === params?.userId

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    testID={`Profile ${params.mode} back`}
                    headerTitle={params?.title}
                    noNotifications
                />
            ),
        })
    }, [])

    useEffect(() => {
        const userId = params?.userId
        const mode = params?.mode

        if (mode === 'followings') {
            actions.fetchFollowingInfo(userProfileChunk, userId, 1)
        } else {
            actions.fetchFollowerInfo(userProfileChunk, userId, 1)
        }

        let screenName = 'ProfileFollowers'
        if (params?.mode === 'followings') screenName = 'ProfileFollowing'
        if (isMe) screenName = `My${screenName}`

        actions.setScreen(screenName)
    }, [])

    const onEndReached = () => {
        if (isLoading || page >= totalPages) {
            return
        }
        const userId = params?.userId
        const mode = params?.mode
        if (mode === 'followings') {
            actions.fetchFollowingInfo(userProfileChunk, userId, page + 1)
        } else {
            actions.fetchFollowerInfo(userProfileChunk, userId, page + 1)
        }
    }

    if (users.length === 0 && !isLoading) {
        const title =
            params?.mode === 'followings'
                ? translate('native.followers.empty_title')
                : translate('native.following.empty_title')
        const description =
            params?.mode === 'followings'
                ? translate('native.followers.empty_description')
                : translate('native.following.empty_description')
        return (
            <BaseEmptyStateView
                title={title}
                description={description}
                icon={params?.mode === 'followers' ? userGroup : userAdd}
            />
        )
    }

    return (
        <UserFollowersList
            testID={`Profile ${params.mode} user`}
            items={users}
            onEndReached={onEndReached}
            isLoading={isLoading}
        />
    )
})

const UserFollowerScreenContainer = memo(() => {
    const [userId] = useValues([getUserId])
    const increment = useSameRouteInStackCount()
    const { chunk } = useInjectDynamicStoreChunk('user_followers', key =>
        createUserProfileDynamicStoreChunk(key, userId as number, increment),
    )

    return (
        <UserProfileInfoContext.Provider value={chunk}>
            <UserFollowerScreen />
        </UserProfileInfoContext.Provider>
    )
})

export default UserFollowerScreenContainer
