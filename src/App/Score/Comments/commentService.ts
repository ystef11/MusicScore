import { apiRequest, contentContracts, scoreContracts } from '@mu-native/api'
import { sanitizeCommentBody } from '@mu-native/common'

import SentryUtils from '../../Utils/Sentry'

export async function requestComments(score_id: number) {
    return apiRequest(scoreContracts.comments, { params: { score_id } })
}
export async function requestMoreComments(score_id: number, page: number) {
    return apiRequest(scoreContracts.comments, { params: { score_id, page } })
}
export async function sendComment(body: string, score_id: number, parent_id?: number) {
    try {
        return await apiRequest(scoreContracts.addComment, {
            payload: { body: sanitizeCommentBody(body), score_id, parent_id },
        })
    } catch (error) {
        SentryUtils.sendMessage('sendComment', error)
        throw error
    }
}
export async function postCommentLike(commentId: number) {
    try {
        return await apiRequest(contentContracts.like, {
            payload: { object_id: commentId, object: 'score_comment' },
        })
    } catch (error) {
        SentryUtils.sendMessage('postCommentLike', error)
        throw error
    }
}
export async function deleteCommentLike(commentId: number) {
    try {
        return await apiRequest(contentContracts.unlike, {
            params: { object_id: commentId, object: 'score_comment' },
        })
    } catch (error) {
        SentryUtils.sendMessage('deleteCommentLike', error)
        throw error
    }
}
