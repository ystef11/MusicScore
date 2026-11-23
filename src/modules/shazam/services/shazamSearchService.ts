import { apiRequest, shazamContracts, type TShazamSearchParamsDto } from '@mu-native/api'
import { TFiltersAPIData, toFiltersAPIData } from '@mu-native/search'

import MSScore, { MSScoreT } from '../../../App/Model/MSScore'
import { TShazamSearchMeta, TShazamSearchMode } from '../store/shazamStoreChunk'

export type ShazamSearchParams = TShazamSearchMeta & {
    page: number
    sort?: string
    mode?: TShazamSearchMode
} & Record<string, string | number | undefined>

export type ShazamSearchResult = {
    mode: TShazamSearchMode
    scores: MSScoreT[]
    rawFilters: TFiltersAPIData | null
    currentPage: number
    totalPages: number
    totalItems: number
}

const stripEmpty = (params: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    Object.keys(params).forEach(key => {
        const value = params[key]
        if (value === undefined || value === null || value === '') return
        out[key] = value
    })
    return out
}

export const searchShazamScores = async (
    params: ShazamSearchParams,
): Promise<ShazamSearchResult> => {
    const { data, pagination } = await apiRequest(shazamContracts.search, {
        params: stripEmpty(params) as TShazamSearchParamsDto,
    })

    const scores = (data.scores ?? [])
        .filter(item => MSScore.isScoreSourceItemValid(item))
        .map(item => new MSScore(item))

    // The backend returns `filters: []` for empty-result modes; the downstream
    // converter expects a keyed object, so normalize the array form to null.
    const rawFilters =
        data.filters && !Array.isArray(data.filters) ? toFiltersAPIData(data.filters) : null

    return {
        mode: data.mode,
        scores,
        rawFilters,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems || data.total_count || scores.length,
    }
}
