import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import {
    DigitalEbookBillingInfoModel,
    DigitalEbookModelFull,
    DigitalEbookRatingModel,
    DigitalEbookSimilarModel,
} from '../api/digital.ebooks.models'

export type DigitalEbookDetailsStoreState = {
    isInitialLoading: boolean
    ebookId: string
    ebook: DigitalEbookModelFull
    hasFullAccess: boolean
    similarEbooks: DigitalEbookSimilarModel[]
    billing: DigitalEbookBillingInfoModel | null

    isFavorite: boolean
    isUpdatingFavorite: boolean

    isRated: boolean
    isUpdatingRating: boolean

    rating: DigitalEbookRatingModel | null
}

export function createDetailsChunkStore(key: string, ebookId: string) {
    return createExtendedStoreChunk<DigitalEbookDetailsStoreState>({
        treeKey: 'screens',
        storeKey: `${Date.now()}_${key}`,
    })({
        initialState: {
            isInitialLoading: true,
            billing: null,
            rating: null,
            ebookId,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore never will be null
            ebook: null,
            hasFullAccess: false,
            similarEbooks: [],
            isFavorite: false,
            isUpdatingFavorite: false,
            isRated: false,
            isUpdatingRating: false,
        },
        actions: {
            updateUserRating: (rating: number, state) => {
                return {
                    isRated: true,
                    rating: {
                        ...state.rating!,
                        user_rating: rating,
                    },
                }
            },
        },
    })
}

export type DigitalEbookDetailsChunk = ReturnType<typeof createDetailsChunkStore>

export const DigitalEbookDetailsContext = createContext<DigitalEbookDetailsChunk | undefined>(
    undefined,
)
export function useDigitalEbookDetailsChunk() {
    return useContext(DigitalEbookDetailsContext)! as DigitalEbookDetailsChunk
}
