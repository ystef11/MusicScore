import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText, brandColors, type BrandsThemeFontKey, replacerText } from '@mu-native/ds'

const styles = StyleSheet.create({
    containerText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})

type TextFirstLineProps = {
    color: string | undefined
    font?: BrandsThemeFontKey
    dateText?: string
    style?: StyleProp<ViewStyle>
}

const TextFirstLine = ({ color, font = 'f17w600', dateText = '', style }: TextFirstLineProps) => (
    <View style={[styles.containerText, style]}>
        <AppText
            adaptiveSize
            numberOfLines={2}
            font={font}
            style={{ color: color || brandColors.contentPrimary }}
            rawText={replacerText({ text: dateText })}
        />
    </View>
)

export default memo(TextFirstLine)
