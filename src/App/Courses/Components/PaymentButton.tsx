import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { colors, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { BuyButton, getSaleSubscriptionsLearn } from '@mu-native/marketing'
import { useValues } from '@ug/store'

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: colors.white,
        width: '100%',
        alignItems: 'center',
        padding: layout.marginMd,
        justifyContent: 'flex-end',
        borderTopWidth: 2,
        borderColor: colors.colorBorder,
    },
    buttonBuy: {
        backgroundColor: colors.green500,
        maxWidth: layout.maxWidthTabletContainer,
    },
    buttonBuyText: {
        textTransform: 'capitalize',
    },
    describeText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        fontWeight: '400',
        lineHeight: layoutHelpers.getResponsiveSizeExtended(18),
        color: colors.gray900,
        padding: layout.marginSm,
    },
})

type TPaymentButtonProps = {
    isLearnLite: boolean
    isCoursesStatus: boolean
    goLanding: (isLearnLite: boolean) => void
    isUserHasCreditBalance: boolean
}

const PaymentButton = ({
    isLearnLite = false,
    isCoursesStatus,
    goLanding,
    isUserHasCreditBalance = false,
}: TPaymentButtonProps) => {
    const [subscriptions] = useValues([getSaleSubscriptionsLearn])

    const goToSaleCourses = useCallback(() => {
        goLanding(isLearnLite)
    }, [isLearnLite])

    const textUnderButton = translate('native.marketing.courses.plan_subscription_required', {
        plan: isLearnLite ? 'LEARN Lite' : 'LEARN',
    })

    if (isCoursesStatus || !subscriptions.length) return null

    return (
        <BuyButton
            onBuyPress={goToSaleCourses}
            buttonText={
                isUserHasCreditBalance && isLearnLite
                    ? translate('native.courses.start_this_course')
                    : translate('native.screen_tour.start_free')
            }
            underButtonText={isUserHasCreditBalance && !isLearnLite ? '' : textUnderButton}
        />
    )
}

export default memo(PaymentButton)
