import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { translate } from '@mu-native/locale'
import { style, colors, layoutHelpers, layout } from '@mu-native/ds'

const styles = StyleSheet.create({
    instructionConnectBlockContainer: style.view({
        width: '100%',
        marginTop: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    }),
    connectTitle: style.text({
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        fontWeight: '500',
        lineHeight: layoutHelpers.getResponsiveSizeExtended(30),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXs),
    }),
    instructionTextItem: style.text({
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(23),
    }),
})

type TInstructionConnectBlockProps = {
    instructionData: string[]
}

const InstructionConnectBlock = ({ instructionData }: TInstructionConnectBlockProps) => {
    return (
        <View style={styles.instructionConnectBlockContainer}>
            <Text style={styles.connectTitle}>
                {translate('native.bluetooth_pedal.instruction_title')}
            </Text>
            {instructionData.map((text: string, index) => (
                <Text style={styles.instructionTextItem} key={`${index.toString()}`}>
                    {index + 1}. {text}
                </Text>
            ))}
        </View>
    )
}

export default memo(InstructionConnectBlock)
