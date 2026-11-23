import type {
    TFavoriteItemDto,
    TRecentScoreItemDto,
    TScoreDto,
    TScoreSourceDto,
    TScoreThumbnailsDto,
    TUserProfileInfoDto,
} from '@mu-native/api'
import { localizeInstrument, localizeLicense, translate } from '@mu-native/locale'
import isNumber from 'lodash.isnumber'
import isPlainObject from 'lodash.isplainobject'
import isString from 'lodash.isstring'

import { processUserInfo } from '../profileScreens/users/userService'
import { UserInfoT } from '../profileScreens/users/userTypes'
import { isTablet } from '../Utils/Platform'
import { capitalizeFirstLetter } from '../Utils/String.ts'

export const ScorePrivacy = {
    PUBLIC: 0,
    LINK: 1,
    PRIVATE: 2,
} as const

export type ScorePrivacyValue = (typeof ScorePrivacy)[keyof typeof ScorePrivacy]

type TInstrument = {
    name: string
}

export type MSScoreT = {
    webSourceUrl?: string
    source?: MSScoreT
    id: number
    revision: number
    webScoreSaved?: boolean
    catalogScoreId?: number
    importedFromArchive?: boolean
    title: string
    description: string
    license: string
    privacy: number
    keysig?: string
    duration: string
    measures?: number
    /** Base tempo in beats per minute (from API `bpm`); undefined if not provided. */
    bpm?: number
    partsCount: number
    addedAt: number
    lastTouchedAt: number
    dateCreated: number
    dateUpdated: number
    authorId: number
    authorName: string
    authorImage?: string
    authorPro?: boolean
    artistId: number
    artistName: string
    rating: number
    ratingCount?: number
    userRating?: number | null
    subtitle: string
    previewImageUrl: string | null
    commentsCount: number
    favoriteCount?: number
    pagesCount?: number
    hits: number
    instruments: TInstrument[]
    instrumentations: string[]
    publisher: {
        publisherId: number
        publisherTitle: string
    } | null
    isOfficial: boolean
    isPublicDomain: boolean
    idAnalytics: string
    isOffline: boolean
    isOrigin: boolean
    hasCustomVideo: boolean
    hasCustomAudio: boolean
    isPurchased: boolean
    /**
     * How MuseScore itself was paid: 0 TYPE_UNPAID, 1 TYPE_CREDIT, 2 TYPE_ONE_TIME_PAYMENT.
     * An external purchase (see `purchaseSource`) is `isPurchased: true` with `paymentType: 0` —
     * MU took no money for it, so never treat a falsy `paymentType` as "not owned".
     */
    paymentType?: 0 | 1 | 2
    /**
     * Marketplace the score was bought on (API field `source`), `null` for a native MU purchase.
     * NB: the API name cannot be reused here — `source` above is the source score object.
     */
    purchaseSource?: 'smp' | 'smd' | null
    songId: number
    songName: string
    /**
     * Redesign v2 (§2.1): cover of the related song — a size object shaped like
     * `thumbnails` (guaranteed `small` + `large` when present) or `null`. This is
     * a DIFFERENT image from the score's notation `thumbnails`. MVP: always `null`
     * (gate the whole object). Reuse the same size-selection logic when it lands.
     */
    songCover: { small: string; large: string; medium?: string; original?: string } | null
    genres: { [key: string]: string }[]
    complexity?: 1 | 2 | 3
    isFavorite: boolean
    score_blocked_by_country?: boolean
    isPdf: boolean
    isDownloadable: boolean
    isAnnotationsAllowed: boolean
    annotation: { url: string; version: number } | null
    largePreviewUrl: string
    originalPreviewUrl: string | null
    billing?: { currency: string; price: number }
    scoreComment?: {
        body: string
        user: { image?: string }
    }
    profile?: UserInfoT

    getDescriptionInstrumentsString: () => string
    getPartsString: () => string
    getShortPartsString: () => string
    isAiScan?: boolean
}

function getPartsCountString(partsCount: number) {
    return translate('native.score.parts_count', { count: partsCount })
}

function getCommentsCountString(commentsCount: number) {
    return translate('native.score.comments_count', { count: commentsCount })
}

function getSubtitle(authorName: string, partsCount: number, commentsCount: number) {
    if (!partsCount && !commentsCount) {
        return authorName
    }

    if (!commentsCount) {
        return `${authorName} • ${getPartsCountString(partsCount)}`
    }

    return `${authorName} • ${getPartsCountString(partsCount)} • ${getCommentsCountString(
        commentsCount,
    )}`
}

export function isScoreFromCatalog(score: MSScoreT) {
    // Scores from MuseScore catalogs have the idAnalytics property.
    // Local scores opened from the disk don't have it
    return !!score.idAnalytics
}

export function isScoreDownloadable(score: MSScoreT) {
    return (
        !score.isOfficial ||
        (score.isPdf && score.isPurchased) ||
        (score.isOfficial && score.isPurchased)
    )
}

export function getInstrumentTitle(instrument: TInstrument | string | null | undefined): string {
    let name = instrument
    if (
        instrument !== null &&
        typeof instrument === 'object' &&
        Object.hasOwn(instrument, 'name')
    ) {
        name = instrument.name
    }
    if (typeof name !== 'string') return ''
    return localizeInstrument(name)
}

export function getLicenseTitle(license: any): string {
    if (typeof license !== 'string') return ''
    return localizeLicense(license)
}

export function getPrivacyTitle(privacy: number): string {
    return privacy === ScorePrivacy.PUBLIC
        ? translate('native.privacy.public')
        : translate('native.privacy.private')
}

function getPreviewUrl(thumbnails: TScoreThumbnailsDto) {
    if (!thumbnails) return null
    const key = isTablet ? 'large' : 'small'
    const { [key]: url } = thumbnails
    return url.replace(/[?].*$/, '').replace(/x\d{3,}$/, '')
    /* FIXME */
}

export default class MSScore implements MSScoreT {
    webSourceUrl?: string
    id: number

    idAnalytics: string

    revision: number

    title: string

    description: string

    license: string

    privacy: number

    keysig?: string

    duration: string

    measures?: number

    bpm?: number

    partsCount: number

    addedAt: number

    lastTouchedAt: number

    dateCreated: number

    dateUpdated: number

    authorId: number

    authorName: string

    authorImage?: string

    authorPro?: boolean

    rating: number

    ratingCount?: number

    userRating?: number | null

    subtitle: string

    previewImageUrl: string | null

    commentsCount: number

    favoriteCount?: number

    pagesCount?: number

    hits: number

    instruments: TInstrument[]

    instrumentations: string[]

    genres: { [key: string]: string }[]

    artistId: number

    artistName: string

    songId: number

    songName: string

    songCover: { small: string; large: string; medium?: string; original?: string } | null

    publisher: {
        publisherId: number
        publisherTitle: string
    } | null

    isOfficial: boolean

    isPublicDomain: boolean

    isOrigin: boolean

    hasCustomVideo: boolean

    hasCustomAudio: boolean

    isPurchased: boolean

    mobile_app_web?: boolean

    //  TYPE_UNPAID 0; TYPE_CREDIT 1; TYPE_ONE_TIME_PAYMENT = 2
    //  External purchase: isPurchased true with paymentType 0 — see `purchaseSource`.
    paymentType?: 0 | 1 | 2

    //  Marketplace of an external purchase (API field `source`), null for a native MU purchase.
    purchaseSource: 'smp' | 'smd' | null

    score_blocked_by_country: boolean

    complexity?: 1 | 2 | 3

    isFavorite: boolean

    isPdf: boolean

    isAnnotationsAllowed: boolean

    annotation: { url: string; version: number } | null

    isOffline = false

    billing?: { currency: string; price: number }

    largePreviewUrl: string
    originalPreviewUrl: string | null
    scoreComment?: {
        body: string
        user: { image?: string }
    }

    profile?: UserInfoT

    constructor(apiScoreItem: TScoreSourceDto) {
        // Only `/score/info` embeds the full profile in `user`; list items send the short form
        // and the profile fields stay undefined, as they always did.
        this.profile = processUserInfo(apiScoreItem.user as TUserProfileInfoDto) ?? undefined

        this.id = apiScoreItem.id
        // List items omit the fields `/score/info` sends; the model keeps its required shape with
        // neutral defaults until it is split into a list and a full variant.
        this.revision = apiScoreItem.revision_id ?? 0
        this.idAnalytics = apiScoreItem.id_analytics
        this.title = apiScoreItem.title
        this.description = apiScoreItem.description || apiScoreItem.truncated_description || ''
        this.license = apiScoreItem.license ?? ''
        this.privacy = apiScoreItem.is_private ?? ScorePrivacy.PUBLIC
        this.keysig = apiScoreItem.keysig
        this.duration = apiScoreItem.duration ?? ''
        this.measures = apiScoreItem.measures
        this.bpm = apiScoreItem.bpm
        this.partsCount = apiScoreItem.parts
        this.dateCreated = apiScoreItem.date_created
        this.dateUpdated = apiScoreItem.date_updated
        this.addedAt = apiScoreItem.date_created
        this.lastTouchedAt = apiScoreItem.addedToFavoritesAt || apiScoreItem.date_updated
        // `/score/info` embeds the profile with the id as a string.
        this.authorId = Number(apiScoreItem.user.id)
        this.authorName = apiScoreItem.user.name ?? this.profile?.firstName
        this.authorImage = apiScoreItem.user.image ?? this.profile?.avatarUrl
        this.authorPro = apiScoreItem.user.is_pro ?? this.profile?.isPro
        this.rating = apiScoreItem?.rating?.rating
        this.ratingCount = apiScoreItem?.rating?.count
        this.userRating = apiScoreItem?.rating?.user_rating
        this.subtitle = getSubtitle(
            apiScoreItem.user.name,
            apiScoreItem.parts,
            apiScoreItem.comments_count,
        )
        this.previewImageUrl = getPreviewUrl(apiScoreItem.thumbnails)
        this.commentsCount = apiScoreItem.comments_count
        this.favoriteCount = apiScoreItem.favorite_count
        this.pagesCount = apiScoreItem.pages_count
        this.hits = apiScoreItem.hits ?? 0
        const { instruments, instrumentations } = apiScoreItem
        this.instruments = Array.isArray(instruments) ? instruments : []
        this.instrumentations = (Array.isArray(instrumentations) ? instrumentations : [])
            .filter(item => item && typeof item === 'object' && item.is_active)
            ?.map(({ name }) => name)
        this.genres = apiScoreItem.genres ?? []
        this.artistId = apiScoreItem.artist_id ?? 0
        this.artistName = apiScoreItem.artist_name ?? ''
        this.songId = apiScoreItem.song_id ?? 0
        this.songName = apiScoreItem.song_name ?? ''
        // MVP: always null; gated as a whole (see type doc). Shape mirrors thumbnails.
        this.songCover = apiScoreItem.song_cover ?? null
        this.publisher = apiScoreItem.publisher
            ? {
                  publisherId: apiScoreItem.publisher.publisher_id,
                  publisherTitle: apiScoreItem.publisher.publisher_title ?? '',
              }
            : null
        this.isOfficial = apiScoreItem.is_official
        this.isPublicDomain =
            apiScoreItem.is_public_domain === true || apiScoreItem.is_public_domain === 1
        this.score_blocked_by_country = apiScoreItem.score_blocked_by_country
        this.isOrigin = apiScoreItem.is_origin
        // Search sends 0/1, `/score/info` and uploaded lists send booleans.
        this.hasCustomVideo =
            apiScoreItem.has_custom_video === 1 || apiScoreItem.has_custom_video === true
        this.hasCustomAudio =
            apiScoreItem.has_custom_audio === 1 || apiScoreItem.has_custom_audio === true
        this.isPurchased = apiScoreItem.is_purchased ?? false
        this.mobile_app_web = apiScoreItem.mobile_app_web
        this.paymentType = apiScoreItem.payment_type
        this.purchaseSource = apiScoreItem.source ?? null
        // 0 means "not rated" on the wire; the model keeps only the three known levels.
        this.complexity = apiScoreItem.complexity || undefined
        this.isFavorite = apiScoreItem.is_favorite ?? false
        this.isPdf = Boolean(apiScoreItem.is_pdf)
        this.isAnnotationsAllowed = Boolean(apiScoreItem.is_annotations_allowed)
        this.annotation = apiScoreItem.annotation
            ? {
                  url: apiScoreItem.annotation.url,
                  version: Number(apiScoreItem.annotation.version),
              }
            : null
        this.billing = apiScoreItem.billing ?? undefined
        this.largePreviewUrl = apiScoreItem.thumbnails.large
        // Highest-resolution render the backend provides; used for the full-page
        // Score Info preview. Falls back to `large` when not present.
        this.originalPreviewUrl = apiScoreItem.thumbnails.original ?? null
        this.scoreComment = apiScoreItem.score_comment
            ? {
                  body: apiScoreItem.score_comment.body,
                  user: { image: apiScoreItem.score_comment.user?.image },
              }
            : undefined
    }

    /**
     * Guards the fields the app cannot render without. The rest of `TScoreDto` is trusted as
     * declared, so a violation there surfaces at the reading site, not here.
     */
    static isScoreSourceItemValid(apiScoreItem: unknown): apiScoreItem is TScoreDto {
        return MSScore.findInvalidField(apiScoreItem) === undefined
    }

    /** The first field `isScoreSourceItemValid` rejects, so a report can say which one. */
    static findInvalidField(apiScoreItem: unknown): string | undefined {
        if (!apiScoreItem || !isPlainObject(apiScoreItem)) return 'item'
        const item = apiScoreItem as Record<string, any>
        if (!item.id || !isNumber(item.id)) return 'id'
        if (!item.title || !isString(item.title)) return 'title'
        if (!item.parts || !isNumber(item.parts)) return 'parts'
        if (!item.date_updated || !isNumber(item.date_updated)) return 'date_updated'
        if (!item.user) return 'user'
        if (!item.user.id) return 'user.id'
        if (!item.user.name) return 'user.name'
        if (!item.rating) return 'rating'
        if (!item.thumbnails?.small) return 'thumbnails.small'
        return undefined
    }

    get isDownloadable(): boolean {
        return isScoreDownloadable(this)
    }

    getPartsString = () => {
        return [
            this.partsCount > 1 ? `${this.partsCount}${this.partsCount ? ' ' : ''}parts` : null,
            (this.instruments || [])?.map(item => item?.name).join(', '),
        ]
            .filter(item => item)
            .join(': ')
            .toLowerCase()
    }

    getShortPartsString = () => {
        return (this.instruments ?? [])
            .map(item => item?.name)
            .map(text => text.replace(/\b\p{L}/gu, c => c.toUpperCase()))
            .filter(item => item)
            .join(', ')
    }

    getDescriptionInstrumentsString = () => {
        let text = ' · '
        const description = this.description.trim()
        const parts = this.getPartsString().trim()
        if (description && description.length > 0) text += description
        if (description && parts) text += ' '
        if (parts) {
            if (description) text += parts.trim()
            else text += capitalizeFirstLetter(parts.trim())
        }
        return text
    }

    static processFavoritesSourceData(apiResponse: TFavoriteItemDto[]): Array<MSScore> | null {
        if (!Array.isArray(apiResponse)) return null
        return apiResponse
            .filter(item => MSScore.isScoreSourceItemValid(item?.score))
            .map(
                item =>
                    new MSScore({
                        ...item.score,
                        billing: item.billing,
                        addedToFavoritesAt: item.date_created,
                    }),
            )
    }

    static processOrdersSourceData(apiResponse: TScoreDto[]): Array<MSScore> | null {
        if (!Array.isArray(apiResponse)) return null
        return apiResponse
            .filter(score => MSScore.isScoreSourceItemValid(score))
            .map(score => new MSScore({ ...score, is_purchased: true }))
    }

    static processUserScoresSourceData(apiResponse: unknown): Array<MSScoreT> {
        if (!MSScore.isUserScoresSourceDataValid(apiResponse)) return []
        return apiResponse
            .filter(apiScoreItem => MSScore.isScoreSourceItemValid(apiScoreItem))
            .map(apiScoreItem => new MSScore(apiScoreItem))
    }

    static processHubScoresSourceData(items: TScoreDto[]): Array<MSScoreT> {
        return items
            .filter(apiScoreItem => MSScore.isScoreSourceItemValid(apiScoreItem))
            .map(apiScoreItem => new MSScore(apiScoreItem))
    }

    static isUserScoresSourceDataValid(apiResponse: unknown): apiResponse is unknown[] {
        if (!apiResponse) return false
        if (!Array.isArray(apiResponse)) return false
        return true
    }

    static processRecentlySourceData(apiResponse: TRecentScoreItemDto[]): Array<MSScore> | null {
        if (!Array.isArray(apiResponse)) return null
        return apiResponse
            .filter(item => MSScore.isScoreSourceItemValid(item?.score))
            .map(
                item =>
                    new MSScore({
                        ...item.score,
                        billing: item.billing,
                        date_updated: item.date_updated,
                        time_spent: item.time_spent,
                    }),
            )
    }

    static processSuggestionScores(apiResponse: TScoreSourceDto[]): Array<MSScore> {
        if (!Array.isArray(apiResponse)) return []
        return apiResponse.map(item => new MSScore(item))
    }
}

interface IButtonsScoreInfo {
    text: string
    icon: string | { uri: string }
    onPress: () => void
    testID?: string
}

export type IButtonsScore = IButtonsScoreInfo | string
