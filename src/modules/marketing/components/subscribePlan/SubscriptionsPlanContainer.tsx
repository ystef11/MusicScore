import { memo, useCallback, useEffect } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { appsFlyerEvent } from '@mu-native/analytics'
import { platform } from '@mu-native/common'
import { layout, layoutHelpers } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { useIsLandscape } from '@mu-native/system'
import { useValues } from '@ug/store'
import throttle from 'lodash.throttle'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics.ts'
import {
    ExperimentsMonetization,
    useMonetizationExperiment,
    useUgPlanLineup4IterationExperiment,
} from '../../index.ts'
import type { TProductId, TScreenName, TSubscription } from '../../types/marketingTypes'
import { TProductInApp } from '../../types/marketingTypes'
import { UpgradeWebTextComponent } from '../upgradeWeb/UpgradeTextComponent.tsx'

import SubscribePlanItem from './components/SubscriptionPlanItem.tsx'
import UgLineupPlanItem from './components/UgLineupPlanItem.tsx'

const EXPERIMENT_SCREENS: TScreenName[] = ['TOUR_INSTALL']

const styles = StyleSheet.create({
    planContainer: {
        width: '100%',
        minWidth: platform.isTablet ? 300 : '100%',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        gap: layoutHelpers.getResponsiveSizeExtended(12),
        alignItems: 'center',
    },
    planContainerLandscape: {
        maxWidth: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
    },
})

type TSubscribePlanProps = {
    subscribePlans: TSubscription[] | TProductInApp[]
    activeSubscribePlan: TProductId
    onPress: (productId: TProductId) => void
    containerStyle?: StyleProp<ViewStyle>
    currentScreen?: TScreenName
    username?: string
    isNeedToShowTimer?: boolean
    isWebUpgrade?: boolean
    isLandscapeLayout?: boolean
    isShowMorePlanLayout?: boolean
}

const SubscriptionsPlanContainer = ({
    subscribePlans = [],
    activeSubscribePlan,
    onPress,
    containerStyle = {},
    currentScreen = 'LANDING',
    username = '',
    isNeedToShowTimer,
    isWebUpgrade = false,
    isLandscapeLayout = false,
    isShowMorePlanLayout = false,
}: TSubscribePlanProps) => {
    const [{ subscriptionsTheme }] = useValues([dynamicDecorStoreChunk.props.getActiveDecorData])

    const isUgLineupEligible = !isWebUpgrade && EXPERIMENT_SCREENS.includes(currentScreen)

    const { isUgPlanLineup4Iteration } = useUgPlanLineup4IterationExperiment(isUgLineupEligible)

    const isUgPlanLineup =
        isUgLineupEligible &&
        (isUgPlanLineup4Iteration || platform.isAndroid) &&
        !isShowMorePlanLayout

    const isBilledAnnuallyExpEligible =
        platform.isIos &&
        !isWebUpgrade &&
        subscribePlans.some(plan => 'summaryExp' in plan && !!plan.summaryExp)

    const { variation } = useMonetizationExperiment(
        isBilledAnnuallyExpEligible,
        8294,
        ExperimentsMonetization.billedAnnually,
    )
    const isBilledAnnuallyExp = variation === 2

    const onChangeSubscribePlan = useCallback(
        throttle((activeSubscribePlanId: TProductId) => {
            appsFlyerEvent('changePlan')
            onPress(activeSubscribePlanId)
        }, 300),
        [onPress],
    )

    useEffect(() => {
        if (!subscribePlans?.length) {
            reportEvent(MetricaEvents.EMPTY_PLANS)
        }
    }, [])

    const isLandscape = useIsLandscape()

    return (
        <View
            style={[
                styles.planContainer,
                isLandscapeLayout && isShowMorePlanLayout && styles.planContainerLandscape,
                containerStyle,
            ]}
        >
            {isWebUpgrade && <UpgradeWebTextComponent />}
            {isUgPlanLineup &&
                !!subscribePlans?.length &&
                subscribePlans.map(subscription => (
                    <UgLineupPlanItem
                        key={subscription?.productId}
                        subscription={subscription}
                        isActive={subscription?.productId === activeSubscribePlan}
                        onChangeSubscribePlan={onChangeSubscribePlan}
                        currentScreen={currentScreen}
                        subscriptionsTheme={subscriptionsTheme}
                    />
                ))}
            {!isWebUpgrade &&
                !isUgPlanLineup &&
                !!subscribePlans?.length &&
                subscribePlans.map((subscription, index) => (
                    <SubscribePlanItem
                        key={subscription?.productId}
                        subscription={subscription}
                        index={index}
                        isActive={subscription?.productId === activeSubscribePlan}
                        onChangeSubscribePlan={onChangeSubscribePlan}
                        subscriptionsLength={subscribePlans.length}
                        username={username}
                        isNeedToShowTimer={!!isNeedToShowTimer && index === 1}
                        currentScreen={currentScreen}
                        subscriptionsTheme={subscriptionsTheme}
                        isLandscapeLayout={isLandscapeLayout}
                        isLandscape={isLandscape}
                        isBilledAnnuallyExp={isBilledAnnuallyExp}
                    />
                ))}
        </View>
    )
}

export default memo(SubscriptionsPlanContainer)
