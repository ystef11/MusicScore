import { memo } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { icons } from '@mu-native/ds'

import { getColorByStatus, styles } from './styles'

type TProps = {
    status: number
    time?: string
    title: string
    onCopy(): void
    onEvent(): void
    onShare(): void
}

const ListItemComponent = ({ status, time, title, onCopy, onEvent, onShare }: TProps) => (
    <TouchableOpacity style={styles.container} onPress={onEvent}>
        <View style={styles.row}>
            <View style={styles.timeStatusContainer}>
                <Text style={styles.time}>{time}</Text>
                <Text style={[styles.time, { color: getColorByStatus(status) }]}>{status}</Text>
            </View>
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
