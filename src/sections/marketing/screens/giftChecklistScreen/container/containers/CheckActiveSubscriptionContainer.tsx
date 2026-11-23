import { memo, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    brandColors,
    globalStyles,
    layoutHelpers,
    NativeBottomSheet,
    OnboardingTitleComponent,
} from '@mu-native/ds'
import { giftChecklistStoreChunk } from '@mu-native/gift-checklist'
import { translate } from '@mu-native/locale'
import {
    getIsUserHasActiveSubscription,
    marketingStoreChunk,
    openSubscriptionManagement,
} from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

/* eslint-disable import/no-relative-packages */
import MetricaEvents from '../../../../../../App/constants/MetricaEvents.ts'
import Button from '../../../../../../App/Elements/NewButton.tsx'
import reportEvent from '../../../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    subscriptionInfoContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    controlButton: {
        backgroundColor: brandColors.accentPrimary,
        borderWidth: 0,
        borderRadius: 25,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
    cancelTextButtonColor: {
        color: brandColors.backgroundDefault,
    },
    laterButton: {
        backgroundColor: brandColors.backgroundDefault,
        borderWidth: 0,
        borderRadius: 25,
    },
    laterTextButtonStyle: {
        color: brandColors.contentPrimary,
    },
    subTitleCustomStyle: {
        textAlign: 'center',
        color: brandColors.contentSecondary,
        marginTop: -10,
    },
})

const CheckActiveSubscriptionContainerModal = ({
    onRestorePress,
    isShowRestoreButton,
}: {
    onRestorePress: () => void
    isShowRestoreButton: boolean
}) => {
    const { navigate, goBack } = useAppNavigation()

    const onGoPaymentPage = () => {
        reportEvent(RT_EVENTS.CHECKLIST_SUBSCRIPTION_CONTINUE_CLICK, {
            funnel_source: 'checklist',
        })
        navigate('FloatingButtonLanding')
    }

    return (
        <View style={styles.subscriptionInfoContainer}>
            <OnboardingTitleComponent
                contentStyle={globalStyles.mb16}
                titleStyle={globalStyles.textAlignCenter}
                title={translate('native.marketing.gift_title')}
                borderWidth={0}
                subTitle={
                    isShowRestoreButton
                        ? translate('native.marketing.gift_disable_subscription')
                        : translate('native.marketing.gift_active_subscription')
                }
                subTitleStyle={styles.subTitleCustomStyle}
            />
            <Button
                scheme="active"
                style={styles.controlButton}
                textStyle={styles.cancelTextButtonColor}
                onPress={isShowRestoreButton ? onRestorePress : onGoPaymentPage}
                text={isShowRestoreButton ? 'Resubscribe' : translate('native.marketing.continue')}
                disabled={false}
            />
            <Button
                scheme="active"
                style={styles.laterButton}
                textStyle={styles.laterTextButtonStyle}
                onPress={goBack}
                text={translate('native.actions.later')}
                disabled={false}
            />
        </View>
    )
}

export const CheckActiveSubscriptionContainer = memo(() => {
    const [isHasActiveSubscription, isOpenSubscriptionModal, subscriptionsForRestore] = useValues([
        getIsUserHasActiveSubscription,
        giftChecklistStoreChunk.props.getIsOpenSubscriptionModal,
        marketingStoreChunk.props.getSubscriptionsForRestore,
    ])
    const actions = useActions({
        setFirstTimeInitCustom: giftChecklistStoreChunk.actions.setFirstTimeInitCustom,
        setIsOpenSubscriptionModal: giftChecklistStoreChunk.actions.setIsOpenSubscriptionModal,
        setSubscriptionsForRestore: marketingStoreChunk.actions.setSubscriptionsForRestore,
    })
    const { goBack } = useAppNavigation()

    useEffect(() => {
        actions.setIsOpenSubscriptionModal(!isHasActiveSubscription)

        if (isHasActiveSubscription) {
            actions.setFirstTimeInitCustom(Date.now())
        }
    }, [isHasActiveSubscription])

    const onCloseModalCallback = () => {
        goBack()
        actions.setIsOpenSubscriptionModal(false)
    }

    const onRestorePress = () => {
        if (subscriptionsForRestore.length) {
            reportEvent(MetricaEvents.BILLING_RESTORE_SUBSCRIPTION_CLICK, {
                funnel_source: 'gift_checklist',
            })
            actions.setSubscriptionsForRestore(
                subscriptionsForRestore.map((subscription, index) =>
                    index === 0
                        ? { ...subscription, sourceRestore: 'gift_checklist' }
                        : subscription,
                ),
            )
            openSubscriptionManagement(subscriptionsForRestore[0].productId)
            goBack()
        }
    }

    useEffect(() => {
        if (isOpenSubscriptionModal) {
            reportEvent(RT_EVENTS.CHECKLIST_SUBSCRIPTION_SHOW)
        }
    }, [isOpenSubscriptionModal])

    if (!isOpenSubscriptionModal) return null

    return (
        <NativeBottomSheet inline presentOnMount onDismiss={onCloseModalCallback}>
            <CheckActiveSubscriptionContainerModal
                onRestorePress={onRestorePress}
                isShowRestoreButton={!isHasActiveSubscription && !!subscriptionsForRestore.length}
            />
        </NativeBottomSheet>
    )
})
