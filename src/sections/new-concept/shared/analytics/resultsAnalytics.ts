import { buildSearchEventParams } from '@mu-native/search'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../../App/constants/scoreAnalytic'
import type { MSScoreT } from '../../../../App/Model/MSScore'
import reportEvent from '../../../../App/Utils/Analytics'

export type TResultsListContext = {
    screen: string
    blockName?: string
    searchType: 'search' | 'browse' | 'quick filters'
    entity?: 'score' | 'recently_viewed'
    filters?: { key: string; value: string | boolean }[]
    sort?: string
    searchQuery?: string
    searchQueryId?: number
    place?: string
}

type TResultParams = {
    score: MSScoreT
    position: number
    totalCount: number
    page: number
    context: TResultsListContext
}

export const buildResultParams = ({
    score,
    position,
    totalCount,
    page,
    context,
}: TResultParams) => {
    const base = buildSearchEventParams({
        filters: context.filters,
        sort: context.sort,
        totalCount,
        page,
        entity: context.entity,
        position,
        score,
        searchQueryId: context.searchQueryId,
        searchQuery: context.searchQuery,
        screen: context.screen,
        searchType: context.searchType,
    })

    if (!context.blockName) return base

    // Analytics asked for the block name both as its own column and inside params.*
    return {
        ...base,
        search_result_block_name: context.blockName,
        'params.key': [...base['params.key'], 'search_result_block_name'],
        'params.str_value': [...base['params.str_value'], context.blockName],
        'params.value': [...base['params.value'], 0],
    }
}

export const reportSearchBrowseResultsClick = (
    score: MSScoreT,
    position: number,
    totalCount: number,
    context: TResultsListContext,
) => {
    reportEvent(
        MetricaEvents.SEARCH_BROWSE_RESULTS_CLICK,
        buildResultParams({ score, position, totalCount, page: 0, context }),
    )
}

export const reportScoreResultClick = (
    score: MSScoreT,
    position: number,
    totalCount: number,
    context: TResultsListContext,
) => {
    reportEvent(MetricaEvents.SCORE_CLICK, {
        ...getScoreMetaEvent(score),
        place: context.place ?? context.blockName ?? context.screen,
    })

    reportEvent(MetricaEvents.SCORE_READ, {
        score_id: score?.idAnalytics,
        scoreTitle: score?.title,
        secondary_score_id: score?.id,
        score_type: 'Browse',
    })

    reportSearchBrowseResultsClick(score, position, totalCount, context)
}
