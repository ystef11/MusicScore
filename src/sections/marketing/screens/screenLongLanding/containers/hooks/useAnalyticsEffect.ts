import { useEffect } from 'react'

import { marketingConstants, subscriptionsRtHelpers, TSources, TSubscription, } from '@mu-native/marketing'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { TPlanNameScreenNoLanding } from '../../types/screenNoLandingScreenAppTypes'

type TUseAnalyticsEffect = {
    source: TSources
    isUpgradeMode: boolean
    isShowScoreBlock: boolean
    currentSubscriptionsGroup: TPlanNameScreenNoLanding
    switcherGroups: TPlanNameScreenNoLanding[] | undefined
    subscriptions: TSubscription[] | undefined
    funnelStartAction?: string
    saleUi?: string
}
export const useAnalyticsEffect = ({
    source,
    isUpgradeMode,
    isShowScoreBlock,
    currentSubscriptionsGroup,
    switcherGroups,
    subscriptions,
    funnelStartAction,
    saleUi,
}: TUseAnalyticsEffect) => {
    useEffect(() => {
        const planTypes = (switcherGroups || [currentSubscriptionsGroup]).map(
            group => marketingConstants.currentSubscriptionType[group] || 'pro_plus',
        )
        const subscriptionType = [...planTypes, ...(isShowScoreBlock ? ['piece'] : [])]

        reportEvent(MetricaEvents.LANDING_PLANS_VIEW, {
            ui: saleUi || source,
            subscription_type: subscriptionsRtHelpers.getPaywallSubscriptionType(
                subscriptionType,
                subscriptions,
            ),
            funnel_type: 'intentional',
            landing_name: isUpgradeMode ? 'update' : 'long landing',
            funnel_source: source,
            have_quiz: 'no',
            ...(funnelStartAction ? { funnel_start_action: funnelStartAction } : {}),
        })
        if (isShowScoreBlock) {
            reportEvent(MetricaEvents.SCREEN_LANDING_PIECE_SALE_CLICK, {
                ui: 'pieceSale',
            })
        }

        return () => {
            reportEvent(MetricaEvents.LANDING_PLANS_CLOSE, {
                ui: saleUi || source,
                subscription_type: subscriptionType,
                funnel_type: 'intentional',
                landing_name: isUpgradeMode ? 'update' : 'long landing',
                funnel_source: source,
                have_quiz: 'no',
                ...(funnelStartAction ? { funnel_start_action: funnelStartAction } : {}),
            })
        }
    }, [])
}
