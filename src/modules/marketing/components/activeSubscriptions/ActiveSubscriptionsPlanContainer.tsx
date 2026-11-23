import { memo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { layout } from '@mu-native/ds'
import { TSubscriptionsTheme } from '@mu-native/dynamic-decor'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions } from '@ug/store'

import reportEvent from '../../../../App/Utils/Analytics.ts'
import { sources } from '../../constants/marketingConstants'
import { subscriptionsRtHelpers } from '../../helpers/subscriptionsRtHelpers.ts'
import { marketingStoreChunk } from '../../store/marketingStoreChunk'
import type { TCurrentSubscription, TSubscription } from '../../types/marketingTypes'

import { ActiveSubscribePlanItemComponent } from './components/ActiveSubscribePlanItem.tsx'

const styles = StyleSheet.create({
    planContainer: {
        width: '100%',
        minWidth: platform.isTablet ? 300 : '100%',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
    },
})

type TSubscribePlanProps = {
    plans: (TCurrentSubscription | TSubscription)[]
    containerStyle?: StyleProp<ViewStyle>
    subscriptionsTheme: TSubscriptionsTheme
}

export const ActiveSubscriptionPlanContainer = memo(
    ({ plans = [], containerStyle = {}, subscriptionsTheme }: TSubscribePlanProps) => {
        const { navigate } = useAppNavigation()
        const { setSource } = useActions({ setSource: marketingStoreChunk.actions.setSource })

        const onPressPlan = (plan: TCurrentSubscription | TSubscription) => {
            if ('planNameType' in plan) {
                const isGame = plan.planNameType === 'offScores'
                const landingName = isGame ? Screen.game : Screen.screenLongLanding
                if (isGame) setSource(sources.profileSale)
                navigate(plan.planNameType === 'ebook' ? 'featuresLandingScreenId' : landingName, {
                    planName: plan.planNameType,
                })

                reportEvent(
                    RT_EVENTS.PROFILE_SETTINGS_SUBSCRIPTION_CONTINUE_CLICK,
                    subscriptionsRtHelpers.getRtBillingParams(plan),
                )

                return
            }

            navigate('SubscriptionSettings', {
                plan,
            })
        }

        if (!plans?.length) return null

        return (
            <Animated.View
                layout={LinearTransition.duration(700)}
                style={[styles.planContainer, containerStyle]}
            >
                {plans.map((plan, index) => (
                    <ActiveSubscribePlanItemComponent
                        key={index}
                        subscription={plan}
                        index={index}
                        onPressPlan={onPressPlan}
                        isActive={'isActive' in plan && plan.isActive}
                        subscriptionsTheme={subscriptionsTheme}
                        isHighlightActive
                    />
                ))}
            </Animated.View>
        )
    },
)
