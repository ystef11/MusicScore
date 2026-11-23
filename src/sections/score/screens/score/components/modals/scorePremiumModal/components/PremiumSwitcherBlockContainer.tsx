import { memo } from 'react'
import { View } from 'react-native'

import {
    AppText,
    brandColors,
    DividerComponent,
    globalStyles,
    layoutHelpers,
    replacerText,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, PlanSwitcher, TInAppForSale } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import { ScorePriceSaleComponent } from './ScorePriceSaleComponent.tsx'

export const PremiumSwitchBlockContainer = memo(
    ({
        score,
        price = '',
        isActiveSwitcher,
        onChangeSwitcher,
    }: {
        score: TInAppForSale
        price?: string
        isActiveSwitcher: boolean
        onChangeSwitcher?: () => void
    }) => {
        const [products] = useValues([marketingStoreChunk.props.getProducts])
        const actions = useActions({
            onChangePremiumSwitcher: marketingStoreChunk.actions.onChangePremiumSwitcher,
        })

        const onChangePremiumSwitcher = () => {
            onChangeSwitcher?.()
            actions.onChangePremiumSwitcher()
        }

        return (
            <View style={[globalStyles.fullWidth, globalStyles.mb32]}>
                <DividerComponent isShowOrTitle={false} customStyle={globalStyles.mb0} />
                <ScorePriceSaleComponent
                    isActive={isActiveSwitcher}
                    score={score}
                    products={products}
                />
                <PlanSwitcher
                    colorText={brandColors.contentPrimary}
                    changeSubscriptions={onChangePremiumSwitcher}
                    isActiveOffScores={isActiveSwitcher}
                    backgroundColor={brandColors.contentTertiary}
                    activeColor={brandColors.contentPrimary}
                    customTitle={replacerText({
                        text: translate('native.marketing.get_premium_discount', {
                            discount: '40',
                        }),
                    })}
                />
                <DividerComponent isShowOrTitle={false} />
                <AppText
                    adaptiveSize
                    style={{ minHeight: layoutHelpers.getResponsiveSizeExtended(40) }}
                    font="f15w400"
                    rawText={replacerText({
                        text: isActiveSwitcher
                            ? price
                            : translate('native.marketing.get_premium_discount_switch'),
                    })}
                    brandColor="contentSecondary"
                />
            </View>
        )
    },
)
