import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText, brandColors, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    card: {
        width: '100%',
        padding: getResponsiveSizeExtended(16),
        marginBottom: getResponsiveSizeExtended(24),
        backgroundColor: brandColors.exceptionMultilayerLight,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    divider: {
        height: 1,
        width: '100%',
        marginVertical: getResponsiveSizeExtended(12),
        backgroundColor: brandColors.splash,
    },
})

type TPurchaseSuccessPlanCardComponentProps = {
    planTitle?: string
    style?: StyleProp<ViewStyle>
    isTrial: boolean
    date: string
    price: string
}

export const PurchaseSuccessPlanCardComponent = memo(
    ({ planTitle, style, isTrial, date, price }: TPurchaseSuccessPlanCardComponentProps) => (
        <View style={[styles.card, style]}>
            {!!planTitle && (
                <>
                    <AppText
                        adaptiveSize
                        font="f17w600"
                        brandColor="exceptionConstantLight"
                        rawText={planTitle}
                    />
                    <View style={styles.divider} />
                </>
            )}
            {isTrial && !!date && (
                <>
                    <View style={styles.row}>
                        <AppText
                            adaptiveSize
                            font="f15w400"
                            brandColor="exceptionConstantLight"
                            rawText={translate('native.marketing.purchase_success.free_until')}
                        />
                        <AppText
                            adaptiveSize
                            font="f15w600"
                            brandColor="exceptionConstantLight"
                            rawText={date}
                        />
                    </View>
                    <View style={styles.divider} />
                </>
            )}
            <View style={styles.row}>
                <AppText
                    adaptiveSize
                    font="f15w400"
                    brandColor="exceptionConstantLight"
                    rawText={translate(
                        isTrial
                            ? 'native.marketing.purchase_success.then'
                            : 'native.marketing.purchase_success.renews',
                    )}
                />
                <AppText
                    adaptiveSize
                    font="f15w600"
                    brandColor="exceptionConstantLight"
                    rawText={price}
                />
            </View>
        </View>
    ),
)
