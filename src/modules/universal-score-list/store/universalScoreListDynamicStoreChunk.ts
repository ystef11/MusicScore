import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { MSScoreT } from '../../../App/Model/MSScore'
import { TUniversalScoreListDynamicStoreChunkState } from '../types/universalScoreListTypes'

export function createUniversalScoreListDynamicStoreChunk(
    key: string,
    uniqueId: number | string,
    increment = 0,
    overrideInitialState: Partial<TUniversalScoreListDynamicStoreChunkState> = {},
) {
    return createExtendedStoreChunk<TUniversalScoreListDynamicStoreChunkState>({
        treeKey: 'screens',
        storeKey: `score_list_${key}_${uniqueId}_${increment}`,
    })({
        initialState: {
            key,
            uniqueId,
            isLoading: false,
            isInitialLoading: true,
            scoresIds: [],
            scoresMap: {},
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            sortKind: 'date_updated',
            sortOrder: 'desc',
            searchQuery: '',
            correctedQuery: '',
            ...overrideInitialState,
        },
        actions: {
            setSort: ({
                kind,
                order,
            }: {
                kind: TUniversalScoreListDynamicStoreChunkState['sortKind']
                order: TUniversalScoreListDynamicStoreChunkState['sortOrder']
            }) => {
                return { sortKind: kind, sortOrder: order }
            },
            setScores: (scores: MSScoreT[]) => {
                return {
                    scoresIds: scores.map(score => score.id),
                    scoresMap: scores.reduce(
                        (acc, score) => ({
                            ...acc,
                            [score.id]: score,
                        }),
                        {},
                    ),
                }
            },
            appendScores: (scores: MSScoreT[], state) => {
                const scoreIds = scores.map(score => score.id)
                const scoresMap = scores.reduce(
                    (acc, score) => ({
                        ...acc,
                        [score.id]: score,
                    }),
                    {},
                )
                return {
                    scoresIds: [...state.scoresIds, ...scoreIds],
                    scoresMap: { ...state.scoresMap, ...scoresMap },
                }
            },
            setPagination: ({
                currentPage,
                totalPages,
                totalItems,
            }: Pick<
                TUniversalScoreListDynamicStoreChunkState,
                'currentPage' | 'totalPages' | 'totalItems'
            >) => {
                return { currentPage, totalPages, totalItems }
            },
            resetPagination: () => {
                return { currentPage: 1, totalPages: 1, totalItems: 0 }
            },
        },
    })
}

export type TUniversalScoreListDynamicStoreChunk = ReturnType<
    typeof createUniversalScoreListDynamicStoreChunk
>

export const UniversalScoreListContext = createContext<
    ReturnType<TUniversalScoreListDynamicStoreChunk> | undefined
>(undefined)
export function useUniversalScoreListContext() {
    return useContext(UniversalScoreListContext)! as TUniversalScoreListDynamicStoreChunk
}
