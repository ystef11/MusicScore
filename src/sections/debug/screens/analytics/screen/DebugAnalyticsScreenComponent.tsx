import React, { memo } from 'react'
import { FlatList, View } from 'react-native'
import type { TEvent } from '@mu-native/debug'
import { ListItem } from '../components/listItem'
import { styles } from './styles'

type TProps = {
    data: TEvent[]
}

const DebugAnalyticsComponent = ({ data }: TProps) => (
    <View style={styles.container}>
        <FlatList
            contentContainerStyle={styles.list}
            data={data}
            keyExtractor={item => item.time}
            renderItem={({ index }) => <ListItem index={index} />}
        />
    </View>
)

export default memo(DebugAnalyticsComponent)
