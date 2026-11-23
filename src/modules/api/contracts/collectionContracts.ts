import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TFavoritesListDto,
    TScoreSetsDto,
    TSetDetailsDto,
    TSetDto,
    TSetsListDto,
} from '../dto/collectionDto'
import type { TScoreDto } from '../dto/scoreDto'

import { defineContract } from './defineContract'

type TSetFields = {
    title: string
    description: string
    is_private: boolean
}

export const favoritesContracts = {
    list: defineContract.get<TFavoritesListDto, { page: number; sort: string; text?: string }>(
        apiEndpoints.collectionFavorites,
        { version: '1.2', paginated: true },
    ),
    add: defineContract.post<unknown, { score_id: number }>(apiEndpoints.collectionFavorites, {
        version: null,
    }),
    remove: defineContract.delete<unknown, { score_id: number }>(apiEndpoints.collectionFavorites, {
        version: null,
    }),
}

export const setContracts = {
    /** `user_id` is the owner of the sets; the backend answers 400 without it. */
    list: defineContract.get<TSetsListDto, { user_id: number; page?: number; order: 'date' }>(
        apiEndpoints.collectionSets,
        { version: null, paginated: true },
    ),
    /** 400 without `set_id` or `user_id`; 404 for another user's private set. */
    details: defineContract.get<TSetDetailsDto, { set_id: number; user_id: number; page?: number }>(
        apiEndpoints.collectionSet,
        { version: '1.2', paginated: true },
    ),
    create: defineContract.post<TSetDto, TSetFields>(apiEndpoints.collectionSet, {
        version: null,
    }),
    update: defineContract.put<
        TSetDto,
        TSetFields & { set_id: number; scores: number[]; position?: number }
    >(apiEndpoints.collectionSet, { version: '1.1' }),
    remove: defineContract.delete<unknown, { set_id: number }>(apiEndpoints.collectionSet, {
        version: '1.1',
    }),
    /** The user's sets with the ids of those already holding the score. */
    forScore: defineContract.get<TScoreSetsDto, { score_id: number }>(apiEndpoints.scoreSets, {
        version: '1.1',
    }),
    addScore: defineContract.post<unknown, { set_id: number; score_id: number }>(
        apiEndpoints.scoreSets,
        { version: null },
    ),
    removeScore: defineContract.delete<unknown, { set_id: number; score_id: number }>(
        apiEndpoints.scoreSets,
        { version: '1.1' },
    ),
}

/** The user's own uploads. */
export const uploadedContracts = {
    list: defineContract.get<
        TScoreDto[],
        { user_id: number; page: number; sort: string; text?: string; 'per-page': number }
    >(apiEndpoints.collectionUploaded, { version: '1.2', paginated: true }),
    remove: defineContract.delete<unknown, { id: number | string }>(
        apiEndpoints.collectionUploaded,
        {
            version: '1.1',
        },
    ),
}
