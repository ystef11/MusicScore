import { memo } from 'react'

import { useValues } from '@ug/store'

import { getTourSecondBlockSubscriptions } from '../../../store/marketingStoreChunk.ts'
import SubscribePlanComponent from '../../subscribePlan/SubscriptionsPlanContainer.tsx'

type TTourMorePlansContainerProps = {
    activeSubscribePlan: string
    onChangeSubscribePlan: (planId: string) => void
    isLandscapeLayout: boolean
}
export const TourMorePlansContainer = memo(
    ({
        activeSubscribePlan,
        onChangeSubscribePlan,
        isLandscapeLayout,
    }: TTourMorePlansContainerProps) => {
        const [subscriptions] = useValues([getTourSecondBlockSubscriptions])

        return (
            <SubscribePlanComponent
                activeSubscribePlan={activeSubscribePlan}
                onPress={onChangeSubscribePlan}
                subscribePlans={subscriptions}
                currentScreen="TOUR_MORE_PLANS"
                isLandscapeLayout={isLandscapeLayout}
                isShowMorePlanLayout
            />
        )
    },
)
