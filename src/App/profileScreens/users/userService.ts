import { apiRequest, isResponse, setContracts, userContracts } from '@mu-native/api'
import type { TSetDto, TUserListItemDto, TUserProfileInfoDto } from '@mu-native/api'

import MSScore from '../../Model/MSScore.ts'
import SentryUtils from '../../Utils/Sentry'

import { LOCAL_SETS_OWNER, localSetDetails, localSetsForScore, localSetsList } from './localScoreSets'
import { UserInfoT, UserListItemT } from './userTypes'

export async function requestUserProfileInfo(
    userId: number | null | undefined,
): Promise<TUserProfileInfoDto | null | undefined> {
    try {
        // user id might be null if we are trying to load metadata for offline score
        if (!userId) return undefined
        return await apiRequest(userContracts.profileInfo, { params: { user_id: userId } })
    } catch (error) {
        SentryUtils.sendMessage('requestUserProfileInfo', error)
        return null
    }
}
export async function requestSets(user_id: number, page?: number) {
    if (user_id === LOCAL_SETS_OWNER) return localSetsList()
    try {
        const { data, pagination } = await apiRequest(setContracts.list, {
            params: { user_id, page, order: 'date' },
        })

        return {
            ...pagination,
            sets: data.items,
        }
    } catch (error) {
        SentryUtils.sendMessage('GET SETS', error)
        return null
    }
}
export async function requestSet(set_id: number, user_id: number, page?: number) {
    if (user_id === LOCAL_SETS_OWNER) return localSetDetails(set_id)
    try {
        const { data, pagination } = await apiRequest(setContracts.details, {
            params: { set_id, user_id, page },
        })

        const scores = data.scores.items.map(raw => new MSScore(raw))

        return {
            scores,
            set: data.set,
            ...pagination,
        }
    } catch (error) {
        SentryUtils.sendMessage('GET SET WITH SCORE', error)
        return null
    }
}
export async function requestCreateNewSet(
    title: string,
    description: string,
    is_private: boolean,
): Promise<TSetDto | string | undefined> {
    try {
        return await apiRequest(setContracts.create, {
            payload: { title, description, is_private },
        })
    } catch (error) {
        SentryUtils.sendMessage('CREATE NEW SET', error)
        if (isResponse(error)) {
            return (await error.json()).message
        }
        return undefined
    }
}
export async function requestDeleteSet(set_id: number) {
    try {
        await apiRequest(setContracts.remove, { params: { set_id } })
    } catch (error) {
        SentryUtils.sendMessage('DELETE SET', error)
    }
}
export async function requestSetUpdate(
    set_id: number,
    title: string,
    description: string,
    is_private: boolean,
    scores: number[],
    position?: number,
): Promise<TSetDto | null> {
    try {
        return await apiRequest(setContracts.update, {
            payload: { set_id, title, description, is_private, scores, position },
        })
    } catch (error) {
        SentryUtils.sendMessage('UPDATE SET', error)
        return null
    }
}
export async function requestAddScoreToSet(set_id: number, score_id: number) {
    try {
        await apiRequest(setContracts.addScore, { payload: { set_id, score_id } })
        return true
    } catch (error) {
        SentryUtils.sendMessage('ADD SCORE TO SET', error)
        return false
    }
}
export async function requestDeleteScoreToSet(set_id: number, score_id: number) {
    try {
        await apiRequest(setContracts.removeScore, { params: { set_id, score_id } })
        return true
    } catch (error) {
        SentryUtils.sendMessage('DELETE SCORE TO SET', error)
        return false
    }
}

export async function fetchScoreSetIds(score_id: number, ownerId: number): Promise<number[]> {
    if (ownerId === LOCAL_SETS_OWNER) return localSetsForScore(score_id)
    try {
        const response = await apiRequest(setContracts.forScore, { params: { score_id } })
        return response.exists
    } catch (error) {
        SentryUtils.sendMessage('fetchScoreSetIds', error)
        return []
    }
}

type TFollowListPage = {
    currentPage: number
    users: TUserListItemDto[]
    totalPages: number
    totalItems: number
}

export async function requestFollowerInfo(
    userId: number,
    page: number,
    perPage: number,
): Promise<TFollowListPage | null> {
    try {
        const { data, pagination } = await apiRequest(userContracts.followers, {
            params: { user_id: userId, page, 'per-page': perPage },
        })
        return { users: data.followers, ...pagination }
    } catch (error) {
        SentryUtils.sendMessage('requestFollowerInfo', error)
        return null
    }
}
export async function requestFollowingInfo(
    userId: number,
    page: number,
    perPage: number,
): Promise<TFollowListPage | null> {
    try {
        const { data, pagination } = await apiRequest(userContracts.followings, {
            params: { user_id: userId, page, 'per-page': perPage },
        })
        return { users: data.followings, ...pagination }
    } catch (error) {
        SentryUtils.sendMessage('requestFollowingInfo', error)
        return null
    }
}
export async function requestFollowAction(userId: number) {
    try {
        await apiRequest(userContracts.follow, { payload: { user_id: userId } })
        return true
    } catch (error) {
        SentryUtils.sendMessage('requestFollowAction', error)
        return false
    }
}
export async function requestUnfollowAction(userId: number) {
    try {
        await apiRequest(userContracts.unfollow, { params: { user_id: userId } })
        return true
    } catch (error) {
        SentryUtils.sendMessage('requestUnfollowAction', error)
        return false
    }
}

export function processUserInfo(
    rawUserInfo: TUserProfileInfoDto | undefined | null,
): UserInfoT | null {
    if (!rawUserInfo) return null
    return {
        userId: Number(rawUserInfo.id),
        userName: rawUserInfo.name,
        avatarUrl: rawUserInfo.avatar_url,
        coverUrl: rawUserInfo.cover_url,
        isFollowing: rawUserInfo.is_following,
        isPro: rawUserInfo.plan === 'pro',
        firstName: rawUserInfo.first_name ?? '',
        dateCreated: rawUserInfo.date_created,

        followersCount: rawUserInfo.followers_count,
        followingsCount: rawUserInfo.following_count,
        setsCount: rawUserInfo.set_count,
    }
}

/** The follower lists carry the short user record, not the profile. */
export function processListUserInfo(rawUser: TUserListItemDto): UserListItemT {
    return {
        userId: Number(rawUser.id),
        userName: rawUser.name,
        avatarUrl: rawUser.avatar_url,
        isPro: rawUser.plan === 'pro',
    }
}

export async function requestAndProcessUserProfile(userId: number) {
    const profile = await requestUserProfileInfo(userId)
    return processUserInfo(profile)
}
