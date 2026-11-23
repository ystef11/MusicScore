import type { TFeedItemDto } from '@mu-native/api'

import MSScore from '../../Model/MSScore'

export type RawFeedItemT = TFeedItemDto

// @TODO types
function proccessUserData(rawData: any) {
    if (!rawData || !rawData.user) {
        return {}
    }

    return {
        id: Number(rawData.user?.id),
        name: String(rawData.user.name).trim(),
        url: String(rawData.user.url),
        avatarUrl: String(rawData.user.image),
        isPro: Boolean(rawData.user.is_pro),
    }
}

function proccessScoreData(rawData: any, verb: any) {
    const numberVerb = Number(verb)
    if (!rawData) {
        return {}
    }

    if (numberVerb === 31) {
        return {}
    }

    if (numberVerb === 30) {
        return new MSScore(rawData)
    }

    if (!rawData?.score) {
        return {}
    }
    return new MSScore(rawData.score)
}

// @TODO types (feed: RawFeedItemT[]): FeedItemT[]
export function processFeedData(feed: RawFeedItemT[]): any[] {
    if (!feed) return []
    return feed
        ?.map(feedItem => {
            try {
                const data = feedItem.data?.map(_data => {
                    return {
                        amount: (_data as any).amount || 0,
                        user: proccessUserData(_data),
                        score: proccessScoreData(_data, feedItem.verb),
                        scoreId: Number(_data.score_id),
                        id: Number(_data?.id),
                        body: String(_data.body),
                        dateCreatedAt: Number(_data.date_created),
                        likesCount: Number(_data.likes_count),
                    }
                })[0]

                const userData =
                  data && data.user
                    ? {
                        firstUserId: Number(data.user?.id),
                        firstUserName: data?.user?.name ? String(data?.user?.name) : '',
                        firstUserAvatarUrl: String(data.user.avatarUrl),
                    }
                    : {}

                const scoreData =
                  data && data.score
                    ? {
                        // @ts-ignore
                        scoreTitle: String(data.score.title), // @TODO types
                        // @ts-ignore
                        scoreAuthorId: Number(data.score.authorId), // @TODO types
                        // @ts-ignore
                        scoreAuthorName: String(data.score.authorName), // @TODO types
                    }
                    : {}
                const d = {
                    data: data || {},
                    ...userData,
                    ...scoreData,
                    firstBody: data ? String(data.body) : '',
                    date: Number(feedItem.date),
                    verb: Number(feedItem.verb),
                    count: Number(feedItem.count),
                    userId: Number(feedItem.user_id),
                    targetUserId: Number(feedItem.target_user_id),
                }
                return d
            } catch (e) {
                return undefined
            }
        })
        .filter(Boolean)
}
