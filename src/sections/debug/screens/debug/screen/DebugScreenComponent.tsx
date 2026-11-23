import { memo } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { icons } from '@mu-native/ds'

import { styles } from './styles'

type TProps = {
    analyticsCount: number
    apiCount: number
    onAnalytics(): void
    onAnalyticsShare(): void
    onApi(): void
    onApiShare(): void
    onReset(): void
}

const DebugComponent = ({
    analyticsCount,
    apiCount,
    onAnalytics,
    onAnalyticsShare,
    onApi,
    onApiShare,
    onReset,
}: TProps) => (
    <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={onAnalytics}>
            <Text style={styles.title}>Analytics: {analyticsCount}</Text>
            <TouchableOpacity onPress={onAnalyticsShare}>
                <Image style={styles.icon} source={icons.shareIos} />
            </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onApi}>
            <Text style={styles.title}>Api: {apiCount}</Text>
            <TouchableOpacity onPress={onApiShare}>
                <Image style={styles.icon} source={icons.shareIos} />
            </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.title}>Reset</Text>
        </TouchableOpacity>
    </View>
)

export default memo(DebugComponent)
