import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { MSScoreT } from '../../../../../App/Model/MSScore'
import { SetT } from '../../../../../App/profileScreens/users/userTypes'

type TScoreSetDetailsDynamicStoreChunkState = {
    id: number
    currentPage: number
    totalPages: number
    perPage: number
    totalItems: number
    isLoading: boolean
    isLoadingMore: boolean
    set: SetT | null
    scores: MSScoreT[]
}

export function createScoreSetDetailsDynamicStoreChunk(key: string, setId: number, increment = 0) {
    return createExtendedStoreChunk<TScoreSetDetailsDynamicStoreChunkState>({
        storeKey: `score_set_details_${key}_${setId}_${increment}`,
        treeKey: 'screens',
    })({
        initialState: {
            id: setId,
            currentPage: 0,
            totalPages: 0,
            perPage: 20,
            totalItems: 0,
            isLoading: true,
            isLoadingMore: false,
            scores: [],
            set: null,
        },
        actions: {
            setPagination: ({
                currentPage,
                totalPages,
                totalItems,
            }: Pick<
                TScoreSetDetailsDynamicStoreChunkState,
                'currentPage' | 'totalPages' | 'totalItems'
            >) => {
                return { currentPage, totalPages, totalItems }
            },
            appendScores: (scores: TScoreSetDetailsDynamicStoreChunkState['scores'], state) => {
                return {
                    scores: [...state.scores, ...scores],
                }
            },
        },
    })
}

export type TScoreSetDetailsDynamicStoreChunk = ReturnType<
    typeof createScoreSetDetailsDynamicStoreChunk
>

export const ScoreSetDetailsContext = createContext<
    ReturnType<TScoreSetDetailsDynamicStoreChunk> | undefined
>(undefined)

export function useScoreSetDetailsContext() {
    return useContext(ScoreSetDetailsContext)! as TScoreSetDetailsDynamicStoreChunk
}
