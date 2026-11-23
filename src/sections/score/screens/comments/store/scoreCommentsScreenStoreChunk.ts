import { createExtendedStoreChunk } from '@ug/store'

import { State } from '../../../../../App/Reducers/Types'
import { mergeComments } from '../../../../../App/Score/Comments/commentHelpers'
import { TNormalizedComments, TScoreCommentsScreenState } from '../types/types'

const initialState: TScoreCommentsScreenState = {
    comments: {
        ids: [],
        byIds: {},
        threads: {},
    },
    currentPage: 1,
    isLoading: false,
    editCommentText: '',
    threadId: null,
    scoreId: null,
}

export const scoreCommentsScreenStoreChunk = createExtendedStoreChunk<TScoreCommentsScreenState>({
    storeKey: 'score_comments_screen',
    treeKey: 'screens',
})({
    initialState,
    actions: {
        loadComments: ({
            comments,
            scoreId,
        }: {
            comments: TScoreCommentsScreenState['comments']
            scoreId: TScoreCommentsScreenState['scoreId']
        }) => {
            return { comments, scoreId }
        },
        appendComments: (comments: TNormalizedComments, state) => {
            const merged = mergeComments(state.comments, comments)
            return { comments: merged }
        },
        reset: () => {
            return initialState
        },
    },
})

export const getCommentById = (state: State, commentId: number | null | undefined) => {
    return commentId
        ? scoreCommentsScreenStoreChunk.props.getComments(state).byIds[commentId]
        : null
}

export const getThreadByCommentId = (
    comments: TScoreCommentsScreenState['comments'],
    commentId: number | null | undefined,
) => {
    if (!commentId) return []
    const thread = Object.keys(comments.threads).find(key => {
        return comments.threads[Number(key)].includes(commentId)
    })
    return comments.threads[Number(thread)]
}

export const getThreadCommentIdsByParent = (
    comments: TScoreCommentsScreenState['comments'],
    commentId: number,
) => {
    const thread = getThreadByCommentId(comments, commentId)
    // Sort replies by dateCreatedAt ascending (oldest first, newest at bottom)
    return thread
        .filter(item => item !== commentId)
        .sort((a, b) => {
            return (comments.byIds[a]?.dateCreatedAt ?? 0) - (comments.byIds[b]?.dateCreatedAt ?? 0)
        })
}
