import { apiEndpoints } from '../../muse-native-api/apiMethods'

import { defineContract } from './defineContract'

/** Likeable content kinds accepted by `/content/like`. */
export type TLikeTarget = {
    object_id: number
    object: 'ebook_comment' | 'score_comment'
}

export const contentContracts = {
    like: defineContract.post<unknown, TLikeTarget>(apiEndpoints.contentLike, { version: '1.1' }),
    unlike: defineContract.delete<unknown, TLikeTarget>(apiEndpoints.contentLike, {
        version: '1.1',
    }),
}
