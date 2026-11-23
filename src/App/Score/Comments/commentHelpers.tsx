import type { TScoreCommentsDto } from '@mu-native/api'
import { translate } from '@mu-native/locale'
import { TComment, TNormalizedComments, TResponseComment } from '@mu-native/score-comments-screen'
import {
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    format,
    isThisMonth,
    isThisYear,
    isToday,
    isYesterday,
} from 'date-fns'
import merge from 'lodash.merge'

export function getCommentById(commentId: number, comments: TNormalizedComments) {
    return comments.byIds[commentId]
}
export function mergeComments(
    prevComments: TNormalizedComments,
    newComments: TNormalizedComments,
): TNormalizedComments {
    return {
        ids: prevComments.ids.concat(newComments.ids),
        byIds: merge(prevComments.byIds, newComments.byIds),
        threads: merge(prevComments.threads, newComments.threads),
    }
}
export function formatDate(date: number): string {
    const curDate = Date.now()
    const d = date * 1000

    if (isToday(d)) {
        const diffInMinutes = differenceInMinutes(curDate, d)

        if (diffInMinutes < 59) {
            if (diffInMinutes > 1) {
                return translate('native.date.minutes_ago', { minutes: diffInMinutes.toString() })
            }

            return translate('native.date.just_now')
        }

        if (differenceInHours(curDate, d) < 23) {
            return translate('native.date.hours_ago', {
                hours: differenceInHours(curDate, d).toString(),
            })
        }

        return translate('native.date.today_in', { time: format(d, 'H:mm') })
    }

    if (isYesterday(d)) {
        return translate('native.date.yesterday_in', { time: format(d, 'H:mm') })
    }

    if (isThisMonth(d)) {
        const diffInDays = differenceInDays(curDate, d)
        return translate('native.date.days_ago', { days: diffInDays.toString() })
    }

    if (isThisYear(d)) {
        return format(d, 'MMM D')
    }

    return format(d, 'MMM D, YYYY')
}

function processUserData(responseComment: TResponseComment) {
    return { ...responseComment.user, isPro: Boolean(responseComment.user.is_pro) }
}

function processComment(responseComment: TResponseComment): TComment {
    return {
        id: Number(responseComment.id),
        dateCreatedAt: Number(responseComment.date_created),
        scoreId: Number(responseComment.score_id),
        text: String(responseComment.body),
        likes_count: responseComment.likes_count,
        user: processUserData(responseComment),
        is_liked: responseComment.is_liked,
    }
}

export function insertCommentById(
    editedComment: TComment,
    comments: TNormalizedComments,
): TNormalizedComments {
    const byIds = { ...comments.byIds, [editedComment.id]: editedComment }
    return { ...comments, byIds }
}

function insertAfter(array: any[], indexAfter: number, insertedEntity: any) {
    return [...array.slice(0, indexAfter + 1), insertedEntity, ...array.slice(indexAfter + 1)]
}

function getThreadId(
    commentId: number | null | undefined,
    threads: Record<number, number[]>,
): number | null | undefined {
    if (commentId) {
        const commentThread = threads[commentId]

        if (commentThread) {
            return commentId
        }

        const threadKey = Object.keys(threads).find(key => threads[Number(key)].includes(commentId))
        return Number(threadKey)
    }

    return null
}

export function addResponseComment(
    responseComment: TResponseComment,
    commentId: number | undefined,
    comments: TNormalizedComments,
): TNormalizedComments {
    // ids
    const commentIndex = comments.ids.findIndex(_commentId => _commentId === commentId)
    const ids = insertAfter(comments.ids, commentIndex, responseComment.id)
    // byIds
    const reply = commentId ? comments.byIds[commentId] : null
    const isReply = String(responseComment.thread).includes('.')
    const threadId = getThreadId(commentId, comments.threads) || Number(responseComment.id)
    const comment = {
        ...processComment(responseComment),
        isReply,
        threadId,
        replyUserName: reply ? String(reply.user.name) : null,
    }
    const byIds = { ...comments.byIds, [responseComment.id]: comment }
    // threads - new reply always goes at the end (newest = latest dateCreatedAt)
    const commentThread = comments.threads[threadId] || []
    const thread = [...commentThread, responseComment.id]
    const threads = {
        ...comments.threads,
        [comment.threadId]: thread,
    }
    return {
        ids,
        byIds,
        threads,
    }
}
export type ResponseComments = TScoreCommentsDto
export function processResponseComments(response: ResponseComments): TNormalizedComments {
    const responseComments = response.comments.slice()
    const ids = responseComments?.map(_comment => _comment.id)
    const byIds: Record<number, TComment> = {}
    const threads: Record<number, number[]> = {}
    responseComments.forEach(_comment => {
        const [parentThread] = _comment.thread.split('.')

        const startOfThread = responseComments.find(
            _comment_ => _comment_.thread === `${parentThread}/`,
        )
        const threadId = startOfThread ? Number(startOfThread.id) : Number(_comment.id)
        const thread = threads[threadId]

        const prevReplyIndex = _comment.thread.lastIndexOf('.')

        const prevReplyThread = `${_comment.thread.slice(0, prevReplyIndex)}/`
        const parentReply = responseComments.find(_comment_ => _comment_.thread === prevReplyThread)
        const replyUserName = parentReply ? String(parentReply.user.name) : null

        if (thread) {
            thread.push(_comment.id)
        } else {
            threads[threadId] = [_comment.id]
        }

        const isReply = String(_comment.thread).includes('.')
        byIds[_comment.id] = {
            ...processComment(_comment),
            isReply,
            threadId,
            replyUserName: isReply ? replyUserName : null,
        }
    })
    // Sort each thread by dateCreatedAt ascending (oldest first, newest at bottom)
    Object.keys(threads).forEach(key => {
        threads[Number(key)].sort((a, b) => {
            return (byIds[a]?.dateCreatedAt ?? 0) - (byIds[b]?.dateCreatedAt ?? 0)
        })
    })
    return { ids, byIds, threads }
}
