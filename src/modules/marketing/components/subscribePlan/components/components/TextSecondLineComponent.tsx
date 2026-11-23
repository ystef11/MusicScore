import { memo } from 'react'
import { StyleSheet, TextStyle, View } from 'react-native'

import { AppText, type BrandsThemeFontKey, layoutHelpers, replacerText, style } from '@mu-native/ds'

const styles = StyleSheet.create({
    containerText: style.view({
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    textLine2Container: style.view({
        marginTop: layoutHelpers.getResponsiveSizeExtended(4),
        alignItems: 'flex-start',
    }),
    flex1: style.text({
        flex: 1,
    }),
})

type TextSecondLineProps = {
    text?: string
    customStyle: TextStyle
    font?: BrandsThemeFontKey
}

const TextSecondLine = ({ font = 'f13w400', text = '', customStyle }: TextSecondLineProps) => (
    <View style={[styles.containerText, styles.textLine2Container]}>
        {!!text && (
            <AppText
                font={font}
                adaptiveSize
                style={[styles.flex1, !!customStyle && customStyle]}
                rawText={replacerText({ text })}
            />
        )}
    </View>
)

export default memo(TextSecondLine)
