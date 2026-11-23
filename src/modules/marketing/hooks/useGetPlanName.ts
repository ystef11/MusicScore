import { useEffect, useState } from 'react'

import { platform } from '@mu-native/common'
import { useValues } from '@ug/store'

import { marketingConstants } from '../constants/marketingConstants'
import { marketingStoreChunk } from '../store/marketingStoreChunk'
import { TPlanTypeSplash, TProductId, TSubscriptionsGroup } from '../types/marketingTypes'

export const useGetPlanName = (
    isLearnPlan: boolean,
    subscriptions: TSubscriptionsGroup<TPlanTypeSplash>,
) => {
    const [planData, setPlanInfo] = useState<{
        planName: TPlanTypeSplash
        activePlan?: TProductId
    }>({
        planName: 'offScores',
        activePlan: platform.isIos
            ? marketingConstants.offScores69SubscriptionId
            : marketingConstants.instantOffScoresLiteSubscriptionId,
    })
    const [isPro, isOffScores, isCourses] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
    ])

    useEffect(() => {
        if (isLearnPlan || isOffScores) {
            setPlanInfo({
                planName: 'learning',
                activePlan: subscriptions.learning?.[0]?.productId,
            })
            return
        }

        if (isPro || isOffScores) {
            setPlanInfo({
                planName: 'one',
                activePlan: subscriptions.one?.[0]?.productId,
            })
            return
        }

        if (!isPro) {
            setPlanInfo({
                planName: 'offScores',
                activePlan: subscriptions.offScores?.[0]?.productId,
            })
        }
    }, [isPro, isOffScores, isCourses])

    return planData
}
