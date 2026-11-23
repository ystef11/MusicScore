import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TEmailActivationDto,
    TFollowersDto,
    TFollowingsDto,
    TFollowListParamsDto,
    TNotificationCountDto,
    TPushRefreshPayloadDto,
    TPushSubscribePayloadDto,
    TUserAttributesPayloadDto,
    TUserBalanceDto,
    TUserFeedbackPayloadDto,
    TUserFeedDto,
    TUserFeedParamsDto,
    TUserMeDto,
    TUserProfileInfoDto,
    TUserStatisticsDto,
} from '../dto/userDto'

import { defineContract } from './defineContract'

const parseUserProfileInfo = (raw: unknown): TUserProfileInfoDto => {
    const dto = raw as Partial<TUserProfileInfoDto> | null
    if (typeof dto?.id !== 'string' || typeof dto.name !== 'string') {
        throw new Error(`Expected { id: string, name: string }, got ${JSON.stringify(raw)}`)
    }
    return dto as TUserProfileInfoDto
}

export const userContracts = {
    profileInfo: defineContract.get<TUserProfileInfoDto, { user_id: number }>(
        apiEndpoints.userProfileInfo,
        { version: '1.1', parse: parseUserProfileInfo },
    ),
    me: defineContract.get<TUserMeDto>(apiEndpoints.userMe, { version: null }),
    /** Deletes the current account. */
    deleteMe: defineContract.delete<unknown>(apiEndpoints.userMe, { version: '1.1' }),
    /**
     * Resend the activation letter. 403 `global.forbidden`: nothing to confirm; 429: a letter
     * went out under 10 minutes ago; 422 `user.activation_mail_not_sent`: backend failure.
     */
    resendActivationEmail: defineContract.post<TEmailActivationDto>(
        apiEndpoints.userEmailActivation,
        { version: null },
    ),
    followers: defineContract.get<TFollowersDto, TFollowListParamsDto>(
        apiEndpoints.userFollowerFollower,
        { version: null, paginated: true },
    ),
    followings: defineContract.get<TFollowingsDto, TFollowListParamsDto>(
        apiEndpoints.userFollowerFollowing,
        { version: null, paginated: true },
    ),
    /** 404 for an unknown user, 422 when the follow is refused (yourself, a banned account). */
    follow: defineContract.post<unknown, { user_id: number }>(apiEndpoints.userFollowersSubscribe, {
        version: '1.1',
    }),
    unfollow: defineContract.delete<unknown, { user_id: number }>(
        apiEndpoints.userFollowersSubscribe,
        { version: '1.1' },
    ),
    /** Activity of the people the user follows; 404 when the feed is empty. */
    feed: defineContract.get<TUserFeedDto, TUserFeedParamsDto>(apiEndpoints.userFeedDashboard, {
        version: '1.2',
    }),
    notificationCount: defineContract.get<TNotificationCountDto, { date_last_see: number }>(
        apiEndpoints.userFeedNotificationCount,
        { version: '1.1' },
    ),
    /** Drops the cached counter so the next `notificationCount` recounts; empty body. */
    invalidateNotificationCount: defineContract.put<unknown>(
        apiEndpoints.userFeedNotificationCount,
        { version: null },
    ),
    statistics: defineContract.get<TUserStatisticsDto>(apiEndpoints.userProfileStatistics, {
        version: null,
    }),
    /** Empty body on success. */
    sendFeedback: defineContract.post<unknown, TUserFeedbackPayloadDto>(apiEndpoints.userFeedback, {
        version: '1.1',
    }),
    /** Analytics attributes of the account; empty body on success. */
    updateAttributes: defineContract.put<unknown, TUserAttributesPayloadDto>(
        apiEndpoints.userAttributes,
        { version: '1.1' },
    ),
    /** The platform is taken from the client headers. */
    subscribePush: defineContract.post<1, TPushSubscribePayloadDto>(
        apiEndpoints.userFeedMobPushSubscribe,
        { version: '1.1' },
    ),
    refreshPush: defineContract.put<1, TPushRefreshPayloadDto>(
        apiEndpoints.userFeedMobPushSubscribe,
        { version: '1.1' },
    ),
    /** Credits of the current account; `user_id` is required but the account comes from the token. */
    balance: defineContract.get<TUserBalanceDto, { user_id: number }>(apiEndpoints.userBalance, {
        version: '1.1',
    }),
}
