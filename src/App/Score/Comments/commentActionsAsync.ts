import { errorMessage, isResponse } from '@mu-native/api'
import { DispatchFun, GetStateFun } from '@mu-native/common'
import { translate } from '@mu-native/locale'
import { scoreStoreChunk } from '@mu-native/score'
import { scoreCommentsScreenStoreChunk, TComment } from '@mu-native/score-comments-screen'
import { checkConnection } from '@mu-native/system'

import MetricaEvents from '../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../constants/scoreAnalytic'
import { showAlertNotification } from '../../Elements/NewAlertNotifications.tsx'
import reportEvent from '../../Utils/Analytics'
import SentryUtils from '../../Utils/Sentry'

import {
    addResponseComment,
    getCommentById,
    insertCommentById,
    processResponseComments,
} from './commentHelpers'
import {
    deleteCommentLike,
    postCommentLike,
    requestComments,
    requestMoreComments,
    sendComment,
} from './commentService'

export function fetchComments(scoreId: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            if (scoreCommentsScreenStoreChunk.props.getIsLoading(getState())) return
            dispatch(scoreCommentsScreenStoreChunk.actions.setIsLoading(true))
            const response = await requestComments(scoreId)
            const comments = processResponseComments(response)
            dispatch(scoreCommentsScreenStoreChunk.actions.loadComments({ comments, scoreId }))
            dispatch(scoreCommentsScreenStoreChunk.actions.setCurrentPage(response.current_page))
            reportEvent(MetricaEvents.COMMENTS_FETCH, { scoreId })
        } catch (error) {
            SentryUtils.sendMessage('fetchComments', error)
        } finally {
            dispatch(scoreCommentsScreenStoreChunk.actions.setIsLoading(false))
        }
    }
}
export function loadMoreComments(scoreId: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            if (scoreCommentsScreenStoreChunk.props.getIsLoading(getState())) return false
            const currentPage = scoreCommentsScreenStoreChunk.props.getCurrentPage(getState())
            const page = currentPage + 1
            const response = await requestMoreComments(scoreId, page)
            if (response.comments.length === 0) return false
            const currentScoreId = scoreCommentsScreenStoreChunk.props.getScoreId(getState())
            const comments = processResponseComments(response)
            dispatch(scoreCommentsScreenStoreChunk.actions.appendComments(comments))
            dispatch(scoreCommentsScreenStoreChunk.actions.setCurrentPage(response.current_page))
            reportEvent(MetricaEvents.COMMENTS_MORE, { scoreId: currentScoreId })
            return true
        } catch (error) {
            SentryUtils.sendMessage('loadMoreComments', error)
            return false
        } finally {
            dispatch(scoreCommentsScreenStoreChunk.actions.setIsLoading(false))
        }
    }
}
export function replyComment(text: string, commentId?: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        checkConnection()
        const currentScoreId = scoreCommentsScreenStoreChunk.props.getScoreId(getState())
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        const normalizedComments = scoreCommentsScreenStoreChunk.props.getComments(getState())
        if (!currentScoreId) return
        try {
            const responseComment = await sendComment(text, currentScoreId, commentId)
            if (responseComment) {
                const comments = addResponseComment(responseComment, commentId, normalizedComments)
                dispatch(scoreCommentsScreenStoreChunk.actions.setComments(comments))
                dispatch(scoreStoreChunk.actions.incrementCurrentCommentsCount(''))
                reportEvent(MetricaEvents.COMMENTS_REPLY, {
                    scoreId: currentScoreId,
                })
                reportEvent(MetricaEvents.SCORE_COMMENT, {
                    ...getScoreMetaEvent(score),
                    'params.key': ['type'],
                    'params.str_value': [commentId ? 'reply' : 'comment'],
                    'params.value': [0],
                })
            }
        } catch (e) {
            if ((e as any).toString().includes('Not authorized')) {
                showAlertNotification({
                    text: translate('native.screen_comments.login_required_to_post'),
                    position: 'bottom',
                })
                return
            }
            if (isResponse(e)) {
                showAlertNotification({
                    text: (await errorMessage(e)) || translate('native.alerts.error_occurred'),
                    position: 'bottom',
                })
            }
        }
    }
}

export function postCommentLikeAction(commentId: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const currentScoreId = scoreCommentsScreenStoreChunk.props.getScoreId(getState())
            const normalizedComments = scoreCommentsScreenStoreChunk.props.getComments(getState())
            if (!currentScoreId || !commentId) return
            const result = await postCommentLike(commentId)

            if (result) {
                const comment = getCommentById(commentId, normalizedComments)
                const editedComment: TComment = {
                    ...comment,
                    is_liked: true,
                    likes_count: comment.likes_count + 1,
                }
                const comments = insertCommentById(editedComment, normalizedComments)
                dispatch(scoreCommentsScreenStoreChunk.actions.setComments(comments))
                reportEvent(MetricaEvents.COMMENTS_LIKE, { scoreId: currentScoreId })
            }
        } catch (e) {
            if ((e as any).toString().includes('Not authorized')) {
                showAlertNotification({
                    text: translate('native.screen_comments.login_required_to_like'),
                    position: 'bottom',
                })
                return
            }
            if (isResponse(e)) {
                showAlertNotification({
                    text: (await errorMessage(e)) || translate('native.alerts.error_occurred'),
                    position: 'bottom',
                })
            }
        }
    }
}
export function deleteCommentLikeAction(commentId: number) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const currentScoreId = scoreCommentsScreenStoreChunk.props.getScoreId(getState())
            const normalizedComments = scoreCommentsScreenStoreChunk.props.getComments(getState())
            if (!currentScoreId || !commentId) return
            const result = await deleteCommentLike(commentId)

            if (result) {
                const comment = getCommentById(commentId, normalizedComments)
                const editedComment: TComment = {
                    ...comment,
                    is_liked: false,
                    likes_count: comment.likes_count - 1,
                }
                const comments = insertCommentById(editedComment, normalizedComments)
                dispatch(scoreCommentsScreenStoreChunk.actions.setComments(comments))
                reportEvent(MetricaEvents.COMMENTS_UNLIKE, { scoreId: currentScoreId })
            }
        } catch (e) {
            if (isResponse(e)) {
                showAlertNotification({
                    text: (await errorMessage(e)) || translate('native.alerts.error_occurred'),
                    position: 'bottom',
                })
            }
        }
    }
}
export function likeAction(commentId: number | null | undefined) {
    return (dispatch: DispatchFun, getState: GetStateFun) => {
        checkConnection()
        const score = scoreStoreChunk.props.getCurrentScore(getState())
        const normalizedComments = scoreCommentsScreenStoreChunk.props.getComments(getState())
        if (!commentId) return
        const comment = getCommentById(commentId, normalizedComments)

        if (comment.is_liked) {
            reportEvent(MetricaEvents.SCORE_COMMENT_UNLIKE, getScoreMetaEvent(score))
            dispatch(deleteCommentLikeAction(commentId))
        } else {
            reportEvent(MetricaEvents.SCORE_COMMENT_LIKE, getScoreMetaEvent(score))
            dispatch(postCommentLikeAction(commentId))
        }
    }
}
