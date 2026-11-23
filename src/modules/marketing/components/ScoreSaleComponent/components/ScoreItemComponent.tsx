import { memo } from 'react'
import { Image, StyleSheet, Text, TextStyle, TouchableWithoutFeedback, View } from 'react-native'

import { brandColors, colors, icons, layout, layoutHelpers, replacerText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import type { TInAppForShow, TProductId } from '../../../types/marketingTypes'

const { getResponsiveSizeExtended } = layoutHelpers
const styles = StyleSheet.create({
    textScore: {
        fontSize: getResponsiveSizeExtended(12),
        color: colors.gray500,
    },
    scoreImage: {
        width: getResponsiveSizeExtended(48),
        height: getResponsiveSizeExtended(64),
    },
    scoreContainer: {
        maxWidth: layout.maxWidthTabletContainer,
        paddingHorizontal: getResponsiveSizeExtended(16),
        paddingVertical: getResponsiveSizeExtended(12),
        borderWidth: 2,
        alignSelf: 'center',
        borderColor: colors.gray200,
        flexDirection: 'row',
        marginBottom: getResponsiveSizeExtended(20),
        borderRadius: 6,
    },
    scoreContainerActive: {
        borderWidth: 2,
        borderColor: brandColors.accentPrimary,
    },
    scoreInfoContainer: {
        flex: 1,
        paddingLeft: getResponsiveSizeExtended(8),
    },
    titleScore: {
        fontSize: getResponsiveSizeExtended(16),
        color: colors.text900,
        marginBottom: getResponsiveSizeExtended(4),
        ...(layoutHelpers.fontWeight600 as TextStyle),
    },
    checkCornerContainer: {
        height: 12,
        width: 12,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        right: 0,
        borderRadius: 2,
    },
    checkCorner: {
        backgroundColor: colors.blue600,
        height: 12,
        width: 12,
        position: 'absolute',
        transform: [{ rotate: '45deg' }],
        top: -6,
        right: -6,
    },
})

type TScoreSaleComponent = {
    score: TInAppForShow
    isActiveScore: boolean
    setActiveSubscribePlan: (id: TProductId) => void
    creditBalance?: number
    imageInAppUri?: string
}
const ScoreItemComponent = ({
    score,
    isActiveScore,
    setActiveSubscribePlan,
    creditBalance,
    imageInAppUri,
}: TScoreSaleComponent) => {
    const { title = '', price = '', id = '', summary = '' } = score

    const onPressScore = () => {
        setActiveSubscribePlan(id)
    }

    return (
        <TouchableWithoutFeedback onPress={onPressScore}>
            <View style={[styles.scoreContainer, isActiveScore && styles.scoreContainerActive]}>
                <Image
                    style={styles.scoreImage}
                    source={imageInAppUri ? { uri: imageInAppUri } : icons.scoreImage}
                />
                <View style={styles.scoreInfoContainer}>
                    <Text numberOfLines={2} style={styles.titleScore}>
                        {translate('native.marketing.score_sale.access_to_score', {
                            title: title || '',
                        })}
                    </Text>
                    <Text style={styles.textScore}>
                        {!creditBalance
                            ? replacerText({
                                  text: summary,
                              })
                            : translate('native.marketing.one_pro_credit')}
                    </Text>
                </View>
                {isActiveScore && (
                    <View style={styles.checkCornerContainer}>
                        <View style={styles.checkCorner} />
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    )
}

export default memo(ScoreItemComponent)
