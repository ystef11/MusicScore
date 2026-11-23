import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TRecentScoreItemDto,
    TScoreAnnotationPayloadDto,
    TScoreCommentDto,
    TScoreCommentPayloadDto,
    TScoreCommentsDto,
    TScoreDownloadDto,
    TScoreInfoDto,
    TScoreLinkDto,
    TScoreRatePayloadDto,
    TScoreSearchFilterOptionsDto,
    TScoreSearchHistoryDto,
    TScoreSearchParamsDto,
    TScoreSearchResultDto,
    TScoreShareDto,
    TScoreUpdatePayloadDto,
    TScoreUploadReferenceDto,
    TScoreViewEventsPayloadDto,
    TSimilarScoresDto,
} from '../dto/scoreDto'
import type { TSongAutoCompleteDto, TSongInfoDto } from '../dto/songDto'

import { defineContract } from './defineContract'

export const scoreContracts = {
    /**
     * Full score record plus file URLs; the entry point of every score open. Looks the score up by
     * its public id and 404s (`FakeScore`) when the client version header predates MuseScore 3 support.
     */
    info: defineContract.get<TScoreInfoDto, { id: number; usage: 'online' | 'offline' }>(
        apiEndpoints.scoreInfo,
        { version: '1.4' },
    ),
    search: defineContract.get<TScoreSearchResultDto, TScoreSearchParamsDto>(
        apiEndpoints.scoreSearch,
        { version: '1.4', paginated: true },
    ),
    /** Filter values for a query; without params, for the whole catalog. */
    searchFilterOptions: defineContract.options<
        TScoreSearchFilterOptionsDto,
        Partial<TScoreSearchParamsDto>
    >(apiEndpoints.scoreSearch, { version: '1.3' }),
    /** Header-paginated; the app infers the end from an empty page. */
    comments: defineContract.get<TScoreCommentsDto, { score_id: number; page?: number }>(
        apiEndpoints.scoreComment,
        { version: '1.1' },
    ),
    addComment: defineContract.post<TScoreCommentDto, TScoreCommentPayloadDto>(
        apiEndpoints.scoreComment,
        { version: '1.1' },
    ),
    rate: defineContract.post<unknown, TScoreRatePayloadDto>(apiEndpoints.scoreRating, {
        version: '1.1',
    }),
    /** 403 for official scores, 404 when the client has no download rights. */
    download: defineContract.get<TScoreDownloadDto, { score_id: number }>(
        apiEndpoints.scoreDownload,
        { version: '1.1' },
    ),
    share: defineContract.get<TScoreShareDto, { score_id: number }>(apiEndpoints.scoreShare, {
        version: '1.1',
    }),
    /**
     * Looks the score up by its internal id (`Score::filterById`), not the public one the lists
     * carry, so it 404s for every id the app has. Kept as the app calls it.
     */
    similar: defineContract.get<TSimilarScoresDto, { score_id: number; full_models?: 1 }>(
        apiEndpoints.scoreSimilar,
        { version: '1.1' },
    ),
    /** Body is `true`; 404 means the publisher imposes no such restriction. */
    publisherCheck: defineContract.get<unknown, { score_id: number; restriction: string }>(
        apiEndpoints.scorePublisherCheck,
        { version: '1.1' },
    ),
    /** Needs the attestation token `f`; resolves a score to its analytics entity. */
    link: defineContract.get<TScoreLinkDto, { score_id: string; f: string }>(
        apiEndpoints.scoreLink,
        {
            version: null,
        },
    ),
    /** Recently viewed scores, header-paginated by 20. */
    recentlyViewed: defineContract.get<TRecentScoreItemDto[], { page?: number | null }>(
        apiEndpoints.scoreView,
        { version: '1.2' },
    ),
    /** Records views; 404 or 422 means the batch is unusable and should be dropped. */
    reportViews: defineContract.post<unknown, TScoreViewEventsPayloadDto>(apiEndpoints.scoreView, {
        version: '1.1',
    }),
    searchHistory: defineContract.get<TScoreSearchHistoryDto>(apiEndpoints.userSearchHistory, {
        version: null,
    }),
    /** Upsert the current user's annotations for a score. */
    saveAnnotation: defineContract.post<{ score_id: number }, TScoreAnnotationPayloadDto>(
        apiEndpoints.scoreAnnotation,
        { version: '1.5' },
    ),
    /** Reference data (genres, licenses, privacy options) for the upload / edit form. */
    uploadReferenceData: defineContract.get<TScoreUploadReferenceDto>(apiEndpoints.scoreUpload, {
        version: null,
    }),
    /** Update metadata of an uploaded score, including its song link. */
    update: defineContract.put<{ score_id: number }, TScoreUpdatePayloadDto>(
        apiEndpoints.scoreUpload,
        { version: '1.5' },
    ),
}

export const songContracts = {
    autoComplete: defineContract.get<TSongAutoCompleteDto[], { text: string }>(
        apiEndpoints.songAutoComplete,
        { version: null },
    ),
    /** 404 for an unknown id. */
    info: defineContract.get<TSongInfoDto, { id: number }>(apiEndpoints.songInfo, {
        version: '1.1',
    }),
}
