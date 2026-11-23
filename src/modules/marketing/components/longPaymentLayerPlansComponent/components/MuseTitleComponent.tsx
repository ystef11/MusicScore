import { memo } from 'react'

import { AppText, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants } from '@mu-native/marketing'

import { type TStockLandingPlanType } from '../../../types/marketingTypes.ts'

type TMuseTitleComponentProps = {
    tourSaleAppText?: string
    currentSubscriptionsGroup: TStockLandingPlanType
    isHideSaleText?: boolean
    saleValue?: string
}

export const MuseTitleComponent = memo(
    ({
        tourSaleAppText,
        currentSubscriptionsGroup,
        isHideSaleText = false,
        saleValue,
    }: TMuseTitleComponentProps) => {
        if (!tourSaleAppText) return null

        return (
            <AppText
                textAlign="center"
                font="f44w400Accent"
                rawText={
                    isHideSaleText
                        ? translate('native.marketing.choose_your_plan')
                        : `${tourSaleAppText} \n${
                              saleValue ??
                              marketingConstants.getSaleValueForPaymentLayer(
                                  currentSubscriptionsGroup,
                              )
                          }`
                }
                style={globalStyles.mb16}
                lineHeight={38}
            />
        )
    },
)
