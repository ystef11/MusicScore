import { apiRequest, scoreContracts, songContracts } from '@mu-native/api'
import type {
    TGenreDto,
    TScoreUpdatePayloadDto,
    TScoreUploadReferenceDto,
    TSongAutoCompleteDto,
} from '@mu-native/api'

import { type CopyrightOption } from '../constants.ts'

// --- API Response Types ---

export type ApiGenre = TGenreDto

export type ApiSongResult = TSongAutoCompleteDto

// --- Mapping Utilities ---

const LICENSE_MAP: Record<CopyrightOption, string> = {
    all_rights_reserved: 'all-rights-reserved',
    cc_by: 'cc-by',
    cc_by_nd: 'cc-by-nd',
    cc_by_sa: 'cc-by-sa',
    cc_by_nc: 'cc-by-nc',
    cc_by_nc_nd: 'cc-by-nc-nd',
    cc_by_nc_sa: 'cc-by-nc-sa',
    cc_zero: 'cc-zero',
}

export const mapLicense = (copyright: CopyrightOption): string => LICENSE_MAP[copyright]

// --- API Calls ---

export async function fetchReferenceData(): Promise<TScoreUploadReferenceDto> {
    return apiRequest(scoreContracts.uploadReferenceData)
}

type UpdateScoreParams = {
    scoreId: number
    title: string
    description: string
    privacy: number
    license: string
    genres: number[]
    songId: number | null
    songName: string | null
    isOrigin: boolean
}

/** An original work, an existing song, a new song by name, or no link at all. */
const songLink = (params: UpdateScoreParams): Partial<TScoreUpdatePayloadDto> => {
    if (params.isOrigin) return { is_origin: 1 }
    if (params.songId) return { song_id: params.songId }
    if (params.songName) return { song_name: params.songName }
    return {}
}

export async function updateScore(params: UpdateScoreParams): Promise<{ score_id: number }> {
    return apiRequest(scoreContracts.update, {
        payload: {
            score_id: params.scoreId,
            title: params.title,
            description: params.description,
            privacy: params.privacy,
            license: params.license,
            genres: params.genres,
            ...songLink(params),
        },
    })
}

export async function searchSongs(text: string): Promise<TSongAutoCompleteDto[]> {
    return apiRequest(songContracts.autoComplete, { params: { text } })
}
