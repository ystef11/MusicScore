import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { SetT } from '../../../../../App/profileScreens/users/userTypes'

type TScoreSetListDynamicStoreChunkState = {
    id: number
    currentPage: number
    totalPages: number
    perPage: number
    totalItems: number
    isLoading: boolean
    items: SetT[]
}

export function createScoreSetListDynamicStoreChunk(key: string, uniqueId: number, increment = 0) {
    return createExtendedStoreChunk<TScoreSetListDynamicStoreChunkState>({
        treeKey: 'screens',
        storeKey: `score_set_list_${key}_${uniqueId}_${increment}`,
    })({
        initialState: {
            id: uniqueId,
            currentPage: 0,
            totalPages: 0,
            perPage: 20,
            totalItems: 0,
            isLoading: true,
            items: [],
        },
        actions: {
            setPagination: ({
                currentPage,
                totalPages,
                totalItems,
            }: Pick<
                TScoreSetListDynamicStoreChunkState,
                'currentPage' | 'totalPages' | 'totalItems'
            >) => {
                return { currentPage, totalPages, totalItems }
            },
            appendSets: (items: TScoreSetListDynamicStoreChunkState['items'], state) => {
                return {
                    items: [...state.items, ...items],
                }
            },
        },
    })
}

export type TScoreSetListDynamicStoreChunk = ReturnType<typeof createScoreSetListDynamicStoreChunk>

export const ScoreSetListContext = createContext<
    ReturnType<TScoreSetListDynamicStoreChunk> | undefined
>(undefined)

export function useScoreSetListContext() {
    return useContext(ScoreSetListContext)! as TScoreSetListDynamicStoreChunk
}
