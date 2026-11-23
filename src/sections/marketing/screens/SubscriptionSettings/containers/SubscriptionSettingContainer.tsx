import { memo, useEffect, useMemo } from 'react'
import { View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { platform } from '@mu-native/common'
import { AppText, globalStyles, layout } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { translate } from '@mu-native/locale'
import {
    ActiveSubscribePlanItemComponent,
    marketingStoreChunk,
    subscriptionsRtHelpers,
    TCurrentSubscription,
    TSubscription,
} from '@mu-native/marketing'
import { useAppRoute } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import formatDate from '../../../../../App/Utils/Date'

import { BottomSettingsComponent } from './components/BottomSettingsComponent'

const PriceBlock = ({
    price,
    dateSubscriptionEnd,
}: {
    price?: string
    dateSubscriptionEnd: string
}) => (
    <View style={globalStyles.paddingVertical12}>
        <AppText
            adaptiveSize
            brandColor="contentPrimary"
            font="f16w400"
            rawText={translate('native.next.payment')}
            style={globalStyles.mb2}
        />
        <AppText
            adaptiveSize
            brandColor="contentSecondary"
            font="f13w400"
            rawText={
                price
                    ? translate('native.marketing.subscription_settings.price_on_date', {
                          price,
                          date: dateSubscriptionEnd,
                      })
                    : dateSubscriptionEnd
            }
        />
        {!price && (
            <AppText
                adaptiveSize
                brandColor="contentSecondary"
                font="f13w400"
                rawText={translate('native.subscription_description', {
                    platform: platform.isIos ? 'android' : 'iOS',
                })}
            />
        )}
    </View>
)

export const SubscriptionSettingsContainer = memo(() => {
    const { plan } = useAppRoute<{ plan: TCurrentSubscription }>()
    const [subscriptions, { subscriptionsTheme }, user] = useValues([
        marketingStoreChunk.props.getSubscriptions,
        dynamicDecorStoreChunk.props.getActiveDecorData,
        authStoreChunk.props.getUser,
    ])

    const subscriptionInfo = useMemo(
        () => subscriptions.find(sub => sub.productId === plan.productId),
        [subscriptions],
    )

    useEffect(() => {
        reportEvent(
            MetricaEvents.PROFILE_SETTINGS_SUBSCRIPTION_MANAGE_CLICK,
            subscriptionInfo?.formattedPrice
                ? subscriptionsRtHelpers.getRtBillingParams(subscriptionInfo as TSubscription)
                : {},
        )
    }, [])

    const dateSubscriptionEnd = plan?.dateEndAccess
        ? formatDate(plan.dateEndAccess, 'MMMM DD, YYYY')
        : ''

    const price = subscriptionInfo?.formattedPrice

    return (
        <>
            <View
                style={[
                    globalStyles.fullWidth,
                    { maxWidth: layout.maxTabletWidth },
                    globalStyles.horizontalPadding20,
                    globalStyles.pb12,
                ]}
            >
                <ActiveSubscribePlanItemComponent
                    key={plan?.productId}
                    subscription={plan}
                    index={0}
                    isActive={plan.isActive}
                    subscriptionsTheme={subscriptionsTheme}
                />
                {plan.autoRenew ? (
                    <PriceBlock price={price} dateSubscriptionEnd={dateSubscriptionEnd} />
                ) : (
                    <AppText
                        adaptiveSize
                        brandColor="contentSecondary"
                        font="f13w400"
                        rawText={translate('native.marketing.subscription_settings.active_until', {
                            date: dateSubscriptionEnd,
                        })}
                    />
                )}
            </View>
            <BottomSettingsComponent
                userId={user.id}
                productId={plan.productId}
                isAppStoreSubscription={!!subscriptionInfo?.formattedPrice}
            />
        </>
    )
})
