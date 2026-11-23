import { forwardRef } from 'react'
import { StyleSheet, View, type ViewInstance } from 'react-native'

import { brandColors, CommonTouchable, Icon } from '@mu-native/ds'
import { micIdentify } from '@mu-native/icons/micIdentify'

type Props = {
    onPress: () => void
    testID?: string
}

export const ShazamSearchButton = forwardRef<ViewInstance, Props>(({ onPress, testID }, ref) => (
    <CommonTouchable onPress={onPress} testID={testID} style={styles.touch}>
        <View ref={ref} collapsable={false} style={styles.button}>
            <Icon source={micIdentify} tint={brandColors.contentSecondary} />
        </View>
    </CommonTouchable>
))

const styles = StyleSheet.create({
    touch: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
