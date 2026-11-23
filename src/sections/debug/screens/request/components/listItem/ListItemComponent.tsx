import { memo } from 'react'
import { Image, Text, View } from 'react-native'

import { CommonTouchable, icons } from '@mu-native/ds'

import { styles } from './styles'

type TProps = {
    item: { key: string; value: string }
    onCopyAll(): void
    onCopyKey(): void
    onCopyValue(): void
}

const ListItemComponent = ({ item, onCopyAll, onCopyKey, onCopyValue }: TProps) => (
    <View style={styles.container}>
        <View style={styles.row}>
            <CommonTouchable style={styles.timeButton} onPress={onCopyKey}>
                <Text style={styles.time}>{item.key}</Text>
            </CommonTouchable>
            <CommonTouchable style={styles.titleButton} onPress={onCopyValue}>
                <Text style={styles.title}>{item.value}</Text>
            </CommonTouchable>
        </View>
        <CommonTouchable onPress={onCopyAll}>
            <Image style={styles.icon} source={icons.copy} />
        </CommonTouchable>
    </View>
)

export default memo(ListItemComponent)
