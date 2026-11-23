import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { DigitalEbookReviewModel } from '../api/digital.ebooks.models'

export type DigitalEbookReviewsStoreState = {
    isInitialLoading: boolean
    reviews: DigitalEbookReviewModel[]
    ebookId: string
    totalCount: number
}

export function createDigitalEbookReviewsChunkStore(key: string, ebookId: string) {
    return createExtendedStoreChunk<DigitalEbookReviewsStoreState>({
        treeKey: 'screens',
        storeKey: `${Date.now()}_${key}`,
    })({
        initialState: {
            isInitialLoading: true,
            ebookId,
            reviews: [],
            totalCount: 0,
        },
        actions: {
            setResponse: (response: {
                comments: DigitalEbookReviewModel[]
                total_count: number
            }) => {
                return {
                    reviews: response.comments,
                    totalCount: response.total_count,
                }
            },

            toggleLike: (data: { id: number; isLiked: boolean }, state) => {
                return {
                    reviews: state.reviews.map(r => {
                        if (r.id !== data.id) return r
                        return {
                            ...r,
                            is_liked: data.isLiked,
                            likes_count: data.isLiked
                                ? r.likes_count + 1
                                : Math.max(0, r.likes_count - 1),
                        }
                    }),
                }
            },

            deleteReview: (id: number, state) => {
                return {
                    reviews: state.reviews.filter(r => r.id !== id),
                    totalCount: Math.max(0, state.totalCount - 1),
                }
            },

            addReview: (item: DigitalEbookReviewModel, state) => {
                return {
                    reviews: [item, ...state.reviews],
                    totalCount: state.totalCount + 1,
                }
            },
        },
    })
}

export type DigitalEbookReviewsChunk = ReturnType<typeof createDigitalEbookReviewsChunkStore>

export const DigitalEbookReviewsContext = createContext<DigitalEbookReviewsChunk | undefined>(
    undefined,
)
export function useDigitalEbookReviewsChunk() {
    return useContext(DigitalEbookReviewsContext)! as DigitalEbookReviewsChunk
}
