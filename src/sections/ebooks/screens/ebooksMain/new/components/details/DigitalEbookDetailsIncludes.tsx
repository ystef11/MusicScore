import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors, brandFontsStyles, ExpandableText, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { DigitalEbookModelFull } from '../../api/digital.ebooks.models'

import { DigitalEbookDetailsSeparator } from './DigitalEbookDetailsSeparator.tsx'

type TProps = {
    style?: StyleProp<ViewStyle>
    chapters: DigitalEbookModelFull['chapters']
}

export const DigitalEbookDetailsIncludes = ({ style, chapters }: TProps) => {
    if (!chapters || chapters.length === 0) return null

    return (
        <>
            <View testID={songbookTestIds.detailsIncludes} style={[styles.base, style]}>
                <AppText rawText={translate('native.ebooks.includes')} font="f17w500" />

                <ExpandableText
                    numberOfLines={3}
                    text={chapters?.join(', ') ?? ''}
                    textStyle={styles.text}
                    moreLabel={translate('native.view.all')}
                    badgeStyle={styles.badge}
                />
            </View>
            <DigitalEbookDetailsSeparator />
        </>
    )
}

const styles = StyleSheet.create({
    base: {
        rowGap: 8,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    text: {
        ...brandFontsStyles.f15w400,
        color: brandColors.contentPrimary,
    },

    badge: {
        ...brandFontsStyles.f15w400,
        color: brandColors.accentPrimary,
    },
})
