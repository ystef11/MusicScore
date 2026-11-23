import { useDetachStoreChunk, useInjectStoreChunk } from '@ug/store'

import { ScreenComments } from '../../../../App/Score/Comments/ScreenComments/ScreenComments'

import { scoreCommentsScreenStoreChunk } from './store/scoreCommentsScreenStoreChunk'

export { type TNormalizedComments, type TComment, type TResponseComment } from './types/types'
export {
    scoreCommentsScreenStoreChunk,
    getCommentById,
    getThreadByCommentId,
    getThreadCommentIdsByParent,
} from './store/scoreCommentsScreenStoreChunk'

export const ScoreCommentsScreen = () => {
    useInjectStoreChunk(scoreCommentsScreenStoreChunk, 'screens')
    useDetachStoreChunk(scoreCommentsScreenStoreChunk, 'screens')
    return <ScreenComments />
}

export const ScoreCommentsScreen2 = () => {
    useInjectStoreChunk(scoreCommentsScreenStoreChunk, 'screens')
    useDetachStoreChunk(scoreCommentsScreenStoreChunk, 'screens')
    return <ScreenComments />
}
