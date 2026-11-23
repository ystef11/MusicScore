import { memo } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { icons } from '@mu-native/ds'

import { styles } from './styles'

type TProps = {
    time: string
    title: string
    onCopy(): void
    onEvent(): void
    onShare(): void
}

const ListItemComponent = ({ time, title, onCopy, onEvent, onShare }: TProps) => (
    <TouchableOpacity style={styles.container} onPress={onEvent}>
        <View style={styles.row}>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onCopy}>
            <Image style={styles.icon} source={icons.copy} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare}>
            <Image style={styles.icon} source={icons.shareIos} />
        </TouchableOpacity>
    </TouchableOpacity>
)

export default memo(ListItemComponent)
