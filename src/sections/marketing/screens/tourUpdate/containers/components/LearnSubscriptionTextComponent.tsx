import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    benefitLearnContainer: {
        width: '100%',
        flexDirection: 'column',
        backgroundColor: brandColors.additionalDefaultSubdued,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(16),
    },
})

export const LearnSubscriptionTextComponent = memo(() => (
    <View style={styles.benefitLearnContainer}>
        <AppText
            font="f17w400"
            rawText={translate('native.marketing.tour_update.learn_add_pro_plus')}
        />
    </View>
))
