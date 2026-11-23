import { memo, useEffect } from 'react'
import Animated, { LinearTransition } from 'react-native-reanimated'

import {
    AppText,
    globalStyles,
    RootViewScreenComponent,
    RootViewTabletLayoutComponent,
} from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import {
    ActiveSubscriptionPlanContainer,
    getActiveSubscriptionsUser,
    getIsShowPricingPage,
    getTabSubscriptions,
    marketingStoreChunk,
    RestoreSubscriptionCardComponent,
} from '@mu-native/marketing'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents.ts'
import reportEvent from '../../../Utils/Analytics.ts'

import { ViewAllPlansComponent } from './components/ViewAllPlansComponent.tsx'
import { translate } from '@mu-native/locale'
import { platform } from '@mu-native/common'

export const SubscriptionsTab = memo(() => {
    const [
        { subscriptionsTheme },
        activeUserSubscriptions,
        tabSubscriptions,
        isShowViewAll,
        subscriptionsForRestore,
        isLearnLite,
    ] = useValues([
        dynamicDecorStoreChunk.props.getActiveDecorData,
        getActiveSubscriptionsUser,
        getTabSubscriptions,
        getIsShowPricingPage,
        marketingStoreChunk.props.getSubscriptionsForRestore,
        marketingStoreChunk.props.getIsLearningLite,
    ])

    useEffect(() => {
        reportEvent(MetricaEvents.PROFILE_SETTINGS_SUBSCRIPTION_VIEW, {
            funnel_source: 'settings-pro',
        })
    }, [])

    return (
        <RootViewScreenComponent>
            <RootViewTabletLayoutComponent
                style={[globalStyles.padding20, globalStyles.paddingBottom40]}
            >
                <Animated.View
                    style={globalStyles.fullWidth}
                    layout={LinearTransition.duration(700)}
                >
                    {!!subscriptionsForRestore?.length &&
                        subscriptionsForRestore.map(subscriptionForRestore => (
                            <RestoreSubscriptionCardComponent
                                key={subscriptionForRestore.productId}
                                isLearnLite={isLearnLite}
                                subscriptionForRestore={subscriptionForRestore}
                            />
                        ))}
                    {!!activeUserSubscriptions.length && (
                        <ActiveSubscriptionPlanContainer
                            plans={activeUserSubscriptions}
                            subscriptionsTheme={subscriptionsTheme}
                        />
                    )}
                    <ActiveSubscriptionPlanContainer
                        plans={tabSubscriptions}
                        subscriptionsTheme={subscriptionsTheme}
                    />
                    {!activeUserSubscriptions.length && !tabSubscriptions.length && (
                        <AppText
                            font="f20w400"
                            adaptiveSize
                            rawText={translate('native.marketing.subscription_problem', {
                                storeName: platform.isIos ? 'Apple' : 'Google',
                            })}
                        />
                    )}
                    {isShowViewAll && <ViewAllPlansComponent />}
                </Animated.View>
            </RootViewTabletLayoutComponent>
        </RootViewScreenComponent>
    )
})
