import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { layout } from '../../constants/layout.ts'
import { brandColors } from '../../constants/new/brandColors.ts'

const styles = StyleSheet.create({
    // eslint-disable-next-line react-native/no-color-literals
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: brandColors.strokeDefault,
        marginVertical: 12,
        marginHorizontal: layout.baseMarginFromEdges,
    },
})

const Divider = ({ style }: { style?: StyleProp<ViewStyle> }) => {
    return <View style={[styles.divider, style]} />
}

export default memo(Divider)
