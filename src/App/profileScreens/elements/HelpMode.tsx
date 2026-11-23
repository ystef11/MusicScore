import { StyleSheet, Text, View } from 'react-native'

import { CommonTouchable } from '@mu-native/ds'

import { COLOR_DEEP_BLUE, MARGIN_MD } from '../../constants/styles'

const styles = StyleSheet.create({
    variantContainer: {
        paddingVertical: MARGIN_MD,
    },
    variantText: {
        fontSize: 16,
        lineHeight: 21,
        color: COLOR_DEEP_BLUE,
    },
})

type Props = {
    title: string
    onPress: () => void
}

export const HelpMode = ({ onPress, title }: Props) => (
    <CommonTouchable onPress={onPress}>
        <View style={styles.variantContainer}>
            <Text style={styles.variantText}>{title}</Text>
        </View>
    </CommonTouchable>
)
