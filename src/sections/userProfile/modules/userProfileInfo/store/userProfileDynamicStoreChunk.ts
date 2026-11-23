import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { UserInfoT, UserListItemT } from '../../../../../App/profileScreens/users/userTypes'

type TUserPaginatedList = {
    isLoading: boolean
    users: UserListItemT[]
    page: number
    totalPages: number
    totalItems: number
}

type TUserProfileDynamicStoreChunkState = {
    id: number
    info: UserInfoT | null
    followersData: TUserPaginatedList
    followingsData: TUserPaginatedList
    isLoading: boolean
}

export function createUserProfileDynamicStoreChunk(key: string, uniqueId: number, increment = 0) {
    return createExtendedStoreChunk<TUserProfileDynamicStoreChunkState>({
        storeKey: `user_profile_${key}_${uniqueId}_${increment}`,
        treeKey: 'screens',
    })({
        initialState: {
            id: uniqueId,
            info: null,
            isLoading: false,
            followersData: {
                isLoading: false,
                users: [],
                page: 0,
                totalPages: 0,
                totalItems: 0,
            },
            followingsData: {
                isLoading: false,
                users: [],
                page: 0,
                totalPages: 0,
                totalItems: 0,
            },
        },
        actions: {
            appendFollowers: (data: TUserProfileDynamicStoreChunkState['followersData'], state) => {
                return {
                    followersData: {
                        ...data,
                        users: [...state.followersData.users, ...data.users],
                    },
                }
            },
            appendFollowings: (
                data: TUserProfileDynamicStoreChunkState['followingsData'],
                state,
            ) => {
                return {
                    followingsData: {
                        ...data,
                        users: [...state.followingsData.users, ...data.users],
                    },
                }
            },
            setFollowersLoading: (isLoading: boolean, state) => {
                return {
                    followersData: {
                        ...state.followersData,
                        isLoading,
                    },
                }
            },
            setFollowingsLoading: (isLoading: boolean, state) => {
                return {
                    followingsData: {
                        ...state.followingsData,
                        isLoading,
                    },
                }
            },
        },
    })
}

export type TUserProfileDynamicStoreChunk = ReturnType<typeof createUserProfileDynamicStoreChunk>

export const UserProfileInfoContext = createContext<
    ReturnType<TUserProfileDynamicStoreChunk> | undefined
>(undefined)

export function useUserProfileContext() {
    return useContext(UserProfileInfoContext)! as TUserProfileDynamicStoreChunk
}
