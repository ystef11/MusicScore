import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, brandFontsStyles, ExpandableText, Icon } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { DigitalEbookModelFull } from '../../api/digital.ebooks.models'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

import { DigitalEbookDetailsSeparator } from './DigitalEbookDetailsSeparator.tsx'

type TProps = {
    style?: StyleProp<ViewStyle>
    description: DigitalEbookModelFull['description']
    instruments: DigitalEbookModelFull['instruments']
}

const RatingView = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()
    const [rating] = useValues([chunk.props.getRating])
    if (!rating || !rating.rating_calculated) return null

    return (
        <View style={styles.rating}>
            <Icon source={star} size={16} style={styles.me4} />
            <AppText font="f17w500" rawText={`${rating.rating_calculated.toString()} · `} />
        </View>
    )
})

export const DigitalEbookDetailsDescription = memo(
    ({ style, description, instruments }: TProps) => {
        if (!description || description.length === 0) return null
        return (
            <>
                <View testID={songbookTestIds.detailsDescription} style={style}>
                    <View style={styles.row}>
                        <RatingView />
                        <AppText rawText={instruments.join(' · ')} font="f17w500" />
                    </View>
                    <ExpandableText
                        numberOfLines={2}
                        text={description}
                        textStyle={styles.text}
                        moreLabel={translate('native.view.all')}
                        badgeStyle={styles.badge}
                    />
                </View>
                <DigitalEbookDetailsSeparator />
            </>
        )
    },
)
const styles = StyleSheet.create({
    text: {
        ...brandFontsStyles.f15w400,
        color: brandColors.contentPrimary,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },

    rating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    me4: {
        marginEnd: 4,
    },

    badge: {
        ...brandFontsStyles.f15w400,
        color: brandColors.accentPrimary,
    },
})
