/**
 * The ebooks screens render the API records as they arrive, so the models are the wire DTOs
 * owned by `@mu-native/api`. Only the filter items differ: the UI adds a `selected` flag to them.
 */
import type {
    TEbookBillingDto,
    TEbookCommentDto,
    TEbookDto,
    TEbookFilterDto,
    TEbookFilterOptionsDto,
    TEbookFilterTypeDto,
    TEbookInfoDto,
    TEbookLastCommentDto,
    TEbookRatingDto,
    TEbookSectionDto,
    TEbookSortDto,
} from '@mu-native/api'

export type DigitalEbookFilterType = TEbookFilterTypeDto

export type DigitalEbookFilterModel = TEbookFilterDto & { selected?: boolean }

export type DigitalEbookSortModel = TEbookSortDto & { selected?: boolean }

export type DigitalEbookFilters = Omit<TEbookFilterOptionsDto, 'filters'> & {
    filters: {
        instrument: DigitalEbookFilterModel[]
        genre: DigitalEbookFilterModel[]
        artist_composer: DigitalEbookFilterModel[]
        quick: DigitalEbookFilterModel[]
        sort: DigitalEbookSortModel[]
    }
}

export type DigitalEbooksSectionList = TEbookSectionDto

export type DigitalEbookModel = TEbookDto

export type DigitalEbookSimilarModel = TEbookDto

export type DigitalEbookRatingModel = TEbookRatingDto

export type DigitalEbookBillingInfoModel = TEbookBillingDto

export type DigitalEbookLastCommentModel = TEbookLastCommentDto

export type DigitalEbookModelFull = TEbookInfoDto

export type DigitalEbookDetailsResponse = TEbookInfoDto

export type DigitalEbookReviewModel = TEbookCommentDto

export function digitalEbookGenresInstruments(book: DigitalEbookModel) {
    const data: string[] = []
    if (book.genres.length > 0) data.push(book.genres[0])
    if (book.topics.length > 0) data.push(book.topics[0])
    return data
}

type TCommentAuthor = {
    first_name?: string | null
    last_name?: string | null
    name?: string | null
}

export function commentUserFullName(comment: { user: TCommentAuthor }) {
    let result = ''
    if (comment.user.first_name || comment.user.last_name) {
        result = comment.user.first_name ? comment.user.first_name : ''
        if (comment.user.last_name) result += ` ${comment.user.last_name}`
    } else if (comment.user.name) {
        result = comment.user.name
    }
    return result
}
