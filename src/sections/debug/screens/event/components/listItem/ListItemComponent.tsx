import { memo } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { icons } from '@mu-native/ds'

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
            <TouchableOpacity style={styles.timeButton} onPress={onCopyKey}>
                <Text style={styles.time}>{item.key}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.titleButton} onPress={onCopyValue}>
                <Text style={styles.title}>{item.value}</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity
            onPress={onCopyAll}
            hitSlop={{ bottom: 10, left: 10, right: 10, top: 10 }}
        >
            <Image style={styles.icon} source={icons.copy} />
        </TouchableOpacity>
    </View>
)

export default memo(ListItemComponent)
