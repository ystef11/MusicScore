import { useEffect, useRef } from 'react'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import type { MSScoreT } from '../../../../App/Model/MSScore'
import reportEvent from '../../../../App/Utils/Analytics'

import { buildResultParams, type TResultsListContext } from './resultsAnalytics'

type TOptions = {
    scores: MSScoreT[]
    totalCount?: number
    context: TResultsListContext
    enabled?: boolean
}

export const useResultsViewReporter = ({
    scores,
    totalCount,
    context,
    enabled = true,
}: TOptions) => {
    const reportedCountRef = useRef(0)
    const pageRef = useRef(0)

    const resetKey = [
        context.searchQuery ?? '',
        context.sort ?? '',
        JSON.stringify(context.filters ?? []),
    ].join('|')
    const prevResetKeyRef = useRef(resetKey)

    const contextRef = useRef(context)
    contextRef.current = context

    useEffect(() => {
        if (prevResetKeyRef.current !== resetKey || scores.length < reportedCountRef.current) {
            prevResetKeyRef.current = resetKey
            reportedCountRef.current = 0
            pageRef.current = 0
        }

        if (!enabled || scores.length === reportedCountRef.current) return

        const offset = reportedCountRef.current
        pageRef.current += 1
        const page = pageRef.current

        scores.slice(offset).forEach((score, index) => {
            reportEvent(
                MetricaEvents.SEARCH_BROWSE_RESULTS_VIEW,
                buildResultParams({
                    score,
                    position: offset + index,
                    totalCount: totalCount ?? scores.length,
                    page,
                    context: contextRef.current,
                }),
            )
        })

        reportedCountRef.current = scores.length
    }, [scores, resetKey, enabled, totalCount])
}
