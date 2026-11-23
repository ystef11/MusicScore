import { apiEndpoints } from '../../muse-native-api/apiMethods'
import type {
    TEbookCommentDto,
    TEbookCommentsDto,
    TEbookFilterOptionsDto,
    TEbookInfoDto,
    TEbookListDto,
    TEbookSearchParamsDto,
    TEbookSectionDto,
    TEbookSectionInfoDto,
    TEbookSimilarListDto,
    TEbookUrlDto,
} from '../dto/ebookDto'

import { defineContract } from './defineContract'

export const ebookContracts = {
    /**
     * Every catalog carousel (`TopSectionsEnum` minus physical books) with a 5-ebook preview each.
     * The list itself is not paged: the `X-Pagination-*` headers describe one section's ebook data
     * provider, not this list, so `page` has no effect. Full sections come from `sectionInfo`.
     */
    sections: defineContract.get<TEbookSectionDto[]>(apiEndpoints.ebookSectionList, {
        version: '1.1',
    }),
    sectionInfo: defineContract.get<
        TEbookSectionInfoDto,
        { uri: string; page: number; 'per-page': number }
    >(apiEndpoints.ebookSectionInfo, { version: '1.1' }),
    /** Filter values and total for a query; without params, for the whole catalog. */
    filterOptions: defineContract.options<TEbookFilterOptionsDto, TEbookSearchParamsDto>(
        apiEndpoints.ebookSearch,
        { version: null },
    ),
    search: defineContract.get<TEbookListDto, TEbookSearchParamsDto>(apiEndpoints.ebookSearch, {
        version: '1.1',
    }),
    favorites: defineContract.get<TEbookListDto, { page: number; text?: string }>(
        apiEndpoints.ebookFavorite,
        { version: '1.1' },
    ),
    addFavorite: defineContract.post<unknown, { id: string }>(apiEndpoints.ebookFavorite, {
        version: null,
    }),
    removeFavorite: defineContract.delete<unknown, { id: string }>(apiEndpoints.ebookFavorite, {
        version: null,
    }),
    /** Empty `ebooks` (not 404) when the user bought nothing. */
    purchased: defineContract.get<TEbookListDto>(apiEndpoints.ebookPurchased, { version: '1.1' }),
    info: defineContract.get<TEbookInfoDto, { id: string }>(apiEndpoints.ebookInfo, {
        version: '1.3',
    }),
    similar: defineContract.get<TEbookSimilarListDto, { page: number; ebook_id: string }>(
        apiEndpoints.ebookSimilar,
        { version: '1.1' },
    ),
    rate: defineContract.post<unknown, { id: string; rating: number }>(apiEndpoints.ebookRating, {
        version: null,
    }),
    /** 404 for an unknown id and also when the ebook has no reviews yet. */
    comments: defineContract.get<TEbookCommentsDto, { ebook_id: string }>(
        apiEndpoints.ebookComment,
        { version: null },
    ),
    addComment: defineContract.post<TEbookCommentDto, { id: string; body: string }>(
        apiEndpoints.ebookComment,
        { version: null },
    ),
    removeComment: defineContract.delete<unknown, { id: number }>(apiEndpoints.ebookComment, {
        version: null,
    }),
    /** Reader link of the whole ebook; requires access. */
    fullUrl: defineContract.get<TEbookUrlDto, { ebook_id: string }>(apiEndpoints.ebookUrlFull, {
        version: '1.1',
    }),
    previewUrl: defineContract.get<TEbookUrlDto, { ebook_id: string }>(
        apiEndpoints.ebookUrlPreview,
        { version: '1.1' },
    ),
    buyByCredit: defineContract.post<unknown, { ebook_id: string }>(apiEndpoints.ebookBuy, {
        version: null,
    }),
}
