import { memo } from 'react'
import { View, StyleSheet, Text } from 'react-native'

import { colors, style, layoutHelpers, replacerText } from '@mu-native/ds'
import { localizeMillions, translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { marketingStoreChunk } from '../../store/marketingStoreChunk'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    titleText: style.text({
        fontSize: getResponsiveSizeExtended(25),
        fontWeight: '600',
        color: colors.text900,
        paddingBottom: '2%',
        textAlign: 'center',
    }),
    subTitleText: style.text({
        fontSize: getResponsiveSizeExtended(14),
        textAlign: 'center',
        color: colors.gray500,
        paddingBottom: '2%',
        marginBottom: getResponsiveSizeExtended(16),
    }),
    balanceText: style.text({
        fontSize: getResponsiveSizeExtended(14),
        textAlign: 'center',
        marginBottom: getResponsiveSizeExtended(8),
    }),
})

const CreditsInfoComponent = () => {
    const [contentFields, balance] = useValues([
        marketingStoreChunk.props.getContentFields,
        marketingStoreChunk.props.getCreditBalance,
    ])

    return (
        <View>
            <Text style={styles.titleText}>{translate('native.credits.title')}</Text>
            <Text style={styles.subTitleText}>
                {translate('native.marketing.credits.description_pay_per_use', {
                    scoresCount: localizeMillions(contentFields.scoresAll),
                })}
            </Text>
            <Text style={styles.balanceText}>
                {replacerText({
                    text: translate('native.marketing.credits.balance_count', {
                        count: balance,
                    }),
                })}
            </Text>
        </View>
    )
}

export default memo(CreditsInfoComponent)
