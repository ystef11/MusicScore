import { memo, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    Icon,
    layout,
    layoutHelpers,
    showAlertNotification,
} from '@mu-native/ds'
import { attention } from '@mu-native/icons/attention'
import { close as closeIcon } from '@mu-native/icons/close'
import { translate } from '@mu-native/locale'
import {
    BillingInfoComponent,
    BuyButton,
    marketingStoreChunk,
    openSubscriptionManagement,
    PaymentLayerCloseBlockComponent,
    subscriptionHelpers,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

const styles = StyleSheet.create({
    paymentModalContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.blueLight,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(0),
        alignItems: 'center',
    },
    scrollViewContainerStyle: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(120),
    },
    loseAccessTitleExp: {
        alignSelf: 'flex-start',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginLg),
    },
    benefitsContainer: {
        flexDirection: 'column',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(30),
        alignSelf: 'flex-start',
    },
    benefitsItemWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    buttonBuyContainer: {
        position: 'relative',
        width: '100%',
        backgroundColor: colors.blueLight,
        paddingHorizontal: 0,
    },
    borderWrapper: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 6,
        borderColor: brandColors.contentPrimary,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXl),
    },
})

const RestoreOfferContainer = () => {
    const { goBack } = useNavigation()

    const actions = useActions({
        setSubscriptionsForRestore: marketingStoreChunk.actions.setSubscriptionsForRestore,
    })
    const [subscriptionsForRestore, isLearnLite] = useValues([
        marketingStoreChunk.props.getSubscriptionsForRestore,
        marketingStoreChunk.props.getIsLearningLite,
    ])

    useEffect(() => {
        reportEvent(MetricaEvents.BILLING_RESTORE_PURCHASE_SHOW, {
            funnel_source: 'splash',
        })
    }, [])

    const onRestorePress = () => {
        if (subscriptionsForRestore.length) {
            reportEvent(MetricaEvents.BILLING_RESTORE_SUBSCRIPTION_CLICK, {
                funnel_source: 'splash',
            })
            actions.setSubscriptionsForRestore(
                subscriptionsForRestore.map((subscription, index) =>
                    index === 0 ? { ...subscription, sourceRestore: 'splash' } : subscription,
                ),
            )
            openSubscriptionManagement(subscriptionsForRestore[0].productId)
            goBack()
            return
        }
        showAlertNotification({
            text: translate('native.marketing.no_subscriptions_to_restore'),
        })
    }

    const subscriptionBenefits = subscriptionHelpers.getSubscriptionBenefitsForRestore({
        planName: subscriptionsForRestore[0]?.planName,
        isLearnLite,
    })

    return (
        <View style={styles.paymentModalContainer}>
            <PaymentLayerCloseBlockComponent
                onClose={goBack}
                isAbsolutePosition
                closeIconStyle={{ tintColor: brandColors.contentSecondary }}
                containerStyle={{ backgroundColor: brandColors.overlyImage }}
            />
            <ScrollView
                style={globalStyles.fullWidth}
                showsVerticalScrollIndicator
                contentContainerStyle={[styles.scrollViewContainerStyle]}
            >
                <View
                    style={[
                        globalStyles.flexDirectionRow,
                        globalStyles.alignItemsCenter,
                        globalStyles.mb12,
                    ]}
                >
                    <Icon source={attention} tint={brandColors.statusError} />
                    <AppText
                        adaptiveSize
                        font="f17w400"
                        brandColor="statusError"
                        rawText={translate('native.marketing.action_required')}
                        style={globalStyles.ml4}
                    />
                </View>
                <View style={styles.borderWrapper}>
                    <AppText
                        adaptiveSize
                        textAlign="center"
                        font="f44w400Accent"
                        rawText={translate('native.marketing.membership_expire_soon')}
                    />
                </View>
                <AppText
                    adaptiveSize
                    font="f20w600"
                    rawText={translate('native.marketing.lose_access')}
                    style={styles.loseAccessTitleExp}
                />
                <View style={styles.benefitsContainer}>
                    {subscriptionBenefits.map((text, index) => (
                        <View style={styles.benefitsItemWrapper} key={`id - ${index.toString()}`}>
                            <Icon
                                source={closeIcon}
                                tint={brandColors.statusError}
                                size={layoutHelpers.getResponsiveSizeExtended(24)}
                            />
                            <AppText
                                rawText={text}
                                adaptiveSize
                                font="f17w400"
                                style={globalStyles.ml12}
                            />
                        </View>
                    ))}
                </View>
                <BuyButton
                    customStyleContainer={styles.buttonBuyContainer}
                    buttonText={translate('native.marketing.restart_membership')}
                    onBuyPress={onRestorePress}
                />
                <BillingInfoComponent />
            </ScrollView>
        </View>
    )
}

export default memo(RestoreOfferContainer)
