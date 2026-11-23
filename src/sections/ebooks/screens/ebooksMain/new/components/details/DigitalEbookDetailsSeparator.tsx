import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { brandColors, layout } from '@mu-native/ds'

type TProps = {
    style?: StyleProp<ViewStyle>
}

export const DigitalEbookDetailsSeparator = memo(({ style }: TProps) => {
    return <View style={[styles.base, style]} />
})
const styles = StyleSheet.create({
    base: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 20,
        backgroundColor: brandColors.contentPrimary,
        opacity: 0.1,
        marginHorizontal: layout.baseMarginFromEdges,
    },
})
