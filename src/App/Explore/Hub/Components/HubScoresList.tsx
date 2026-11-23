import { useCallback, useEffect } from 'react'

import { useOpenScore } from '@mu-native/score'
import { THub } from '@mu-native/hub-common'
import { buildSearchEventParams, searchStoreChunk } from '@mu-native/search'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import type { MSScoreT } from '../../../Model/MSScore'
import MSFlashList from '../../../MSComponents/MSFlashList'
import reportEvent from '../../../Utils/Analytics'

type HubScoresListProps = {
    hub: THub
    isLoading: boolean
    scores: MSScoreT[]
    loadMore: () => void
    listHeaderComponent: () => any
}

export const HubScoresList = ({
    listHeaderComponent,
    hub,
    scores,
    loadMore,
    isLoading,
}: HubScoresListProps) => {
    const openScore = useOpenScore()

    const actions = useActions({
        createSearchSession: searchStoreChunk.actions.createSearchSession,
    })

    useEffect(() => {
        actions.createSearchSession('')
    }, [actions])

    const onItemPress = useCallback(
        (score: MSScoreT) => {
            reportEvent(
                MetricaEvents.SCORE_CLICK,
                getScoreMetaEvent(score, score?.isOfficial, { place: 'Hub' }),
            )

            const position = scores.indexOf(score)
            const params = buildSearchEventParams({
                filters: [{ key: 'hub', value: `${hub.id}` }],
                score,
                position,
                totalCount: scores.length,
                page: 0,
            })
            reportEvent(MetricaEvents.SEARCH_BROWSE_RESULTS_CLICK, params)
            openScore(score)

            if (hub.featured) {
                reportEvent(MetricaEvents.BROWSE_OPEN_FEATURED_HUB_SCORE, { hub: hub.title })
            }
        },
        [hub.featured, hub.id, hub.title, openScore, scores],
    )

    return (
        <MSFlashList
            testID="Hub score"
            scores={scores}
            onItemPress={onItemPress}
            loadMore={loadMore}
            isLoading={isLoading}
            listHeaderComponent={listHeaderComponent()}
        />
    )
}
