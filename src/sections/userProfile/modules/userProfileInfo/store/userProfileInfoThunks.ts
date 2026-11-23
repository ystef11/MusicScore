/* eslint-disable import/no-relative-packages */
import { getIsAuthorized, authStoreChunk } from '@mu-native/auth'
import { checkConnection } from '@mu-native/system'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import {
    processListUserInfo,
    processUserInfo,
    requestFollowAction,
    requestFollowerInfo,
    requestFollowingInfo,
    requestUnfollowAction,
    requestUserProfileInfo,
} from '../../../../../App/profileScreens/users/userService'
import { UserInfoT } from '../../../../../App/profileScreens/users/userTypes'
import { State } from '../../../../../App/Reducers/Types'
import reportEvent from '../../../../../App/Utils/Analytics'

import { TUserProfileDynamicStoreChunk } from './userProfileDynamicStoreChunk'

function fetchUserProfileInfo(chunk: TUserProfileDynamicStoreChunk, userId: number) {
    return async (dispatch: (...args: Array<any>) => any) => {
        const userProfileInfo = await requestUserProfileInfo(userId)
        const processedUserProfileInfo = processUserInfo(userProfileInfo)
        if (processedUserProfileInfo) {
            dispatch(chunk.actions.setInfo(processedUserProfileInfo))
        }
    }
}

function doFetchFollowerFollowingsInfo(
    chunk: TUserProfileDynamicStoreChunk,
    userId: number,
    page: number,
    mode: 'followers' | 'followings',
) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => State,
    ) => {
        const selector = mode === 'followers' ? 'getFollowersData' : 'getFollowingsData'
        const { page: currentPage, totalPages } = chunk.props[selector](getState())

        if (currentPage && currentPage >= totalPages) {
            return
        }

        const loadingMethod =
            mode === 'followers'
                ? chunk.actions.setFollowersLoading
                : chunk.actions.setFollowingsLoading

        dispatch(loadingMethod(true))
        try {
            const perPage = 50
            const fetchMethod = mode === 'followers' ? requestFollowerInfo : requestFollowingInfo
            const response = await fetchMethod(userId, page, perPage)

            if (response) {
                const { users: rawUsers, currentPage, totalItems, totalPages } = response
                const users = rawUsers.map(processListUserInfo)
                const data = { users, page: currentPage, totalItems, totalPages, isLoading: false }
                if (page === 1) {
                    const insertMethod =
                        mode === 'followers'
                            ? chunk.actions.setFollowersData
                            : chunk.actions.setFollowingsData
                    dispatch(insertMethod(data))
                } else {
                    const updateMethod =
                        mode === 'followers'
                            ? chunk.actions.appendFollowers
                            : chunk.actions.appendFollowings
                    dispatch(updateMethod(data))
                }
            }
        } finally {
            dispatch(loadingMethod(false))
        }
    }
}

function fetchFollowerInfo(chunk: TUserProfileDynamicStoreChunk, userId: number, page: number) {
    return doFetchFollowerFollowingsInfo(chunk, userId, page, 'followers')
}

function fetchFollowingInfo(chunk: TUserProfileDynamicStoreChunk, userId: number, page: number) {
    return doFetchFollowerFollowingsInfo(chunk, userId, page, 'followings')
}

function toggleFollowUser(userProfile: UserInfoT | null, chunk?: TUserProfileDynamicStoreChunk) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => State,
    ) => {
        checkConnection()
        const isAuthorized = getIsAuthorized(getState())

        if (!isAuthorized) {
            dispatch(
                authStoreChunk.actions.presentAuthModal(() => {
                    authStoreChunk.actions.setModalAction(() =>
                        dispatch(toggleFollowUser(userProfile, chunk)),
                    )
                }),
            )
        } else if (userProfile) {
            const { isFollowing } = userProfile

            if (isFollowing) {
                // UNFOLLOW
                const isDone = await requestUnfollowAction(userProfile.userId)

                if (isDone) {
                    if (chunk) {
                        dispatch(chunk.actions.setInfo({ ...userProfile, isFollowing: false }))
                    } else {
                        userProfile.isFollowing = false
                    }
                }
            } else {
                // FOLLOW
                const isDone = await requestFollowAction(userProfile.userId)
                if (isDone) {
                    if (chunk) {
                        dispatch(chunk.actions.setInfo({ ...userProfile, isFollowing: true }))
                    } else {
                        userProfile.isFollowing = true
                    }
                }
            }

            reportEvent(MetricaEvents.PROFILE_FOLLOW_USER, {
                status: isFollowing ? 'unfollow' : 'follow',
                userId: userProfile.userId,
            })
        }
    }
}

export default {
    fetchUserProfileInfo,
    fetchFollowerInfo,
    fetchFollowingInfo,
    toggleFollowUser,
}
