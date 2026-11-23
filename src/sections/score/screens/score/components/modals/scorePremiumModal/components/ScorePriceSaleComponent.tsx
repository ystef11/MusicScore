import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, globalStyles, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    findByProductId,
    subscriptionHelpers,
    type TInAppForSale,
    type TProduct,
} from '@mu-native/marketing'

const styles = StyleSheet.create({
    backgroundPriceBlock: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.margin3Xs),
    },
    lineStyle: { opacity: 0.4, textDecorationLine: 'line-through' },
})

export const ScorePriceSaleComponent = memo(
    ({
        score,
        isActive,
        products,
    }: {
        score: TInAppForSale
        isActive: boolean
        products: TProduct[]
    }) => {
        const scoreInAppAfterPremium = useMemo(
            () =>
                findByProductId(
                    products,
                    subscriptionHelpers.getInAppIdByPrice(score?.price, true, 'pro'),
                ),
            [products, score?.price],
        )

        const scoreInApp = useMemo(
            () =>
                findByProductId(
                    products,
                    subscriptionHelpers.getInAppIdByPrice(score?.price, false, 'pro'),
                ),
            [products, score?.price],
        )

        return (
            <View
                style={[
                    styles.backgroundPriceBlock,
                    {
                        backgroundColor: isActive
                            ? brandColors.statusSuccess
                            : brandColors.contentPrimary,
                    },
                ]}
            >
                <AppText
                    style={isActive && styles.lineStyle}
                    font="f15w600"
                    brandColor="backgroundDefault"
                    adaptiveSize
                    rawText={`${scoreInApp?.priceWithCurrency}${isActive ? '' : ' '}`}
                />
                {isActive && (
                    <AppText
                        adaptiveSize
                        font="f15w600"
                        brandColor="backgroundDefault"
                        style={globalStyles.ml4}
                        rawText={`${scoreInAppAfterPremium?.priceWithCurrency} `}
                    />
                )}
                <AppText
                    font="f15w400"
                    brandColor="backgroundDefault"
                    adaptiveSize
                    rawText={translate('native.marketing.for_this_score')}
                />
            </View>
        )
    },
)
