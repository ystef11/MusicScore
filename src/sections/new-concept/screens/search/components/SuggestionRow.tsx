import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable, layout } from '@mu-native/ds'

type TProps = {
    text: string
    index: number
    onPress: (text: string, index: number) => void
    testID?: string
}

export const SuggestionRow = memo(({ text, index, onPress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(text, index)} style={styles.container} testID={testID}>
        <AppText font="f15w400" rawText={text} numberOfLines={1} />
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: layout.marginXm,
    },
})
