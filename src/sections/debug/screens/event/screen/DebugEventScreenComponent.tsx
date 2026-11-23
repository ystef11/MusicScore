import React, { memo } from 'react'
import { FlatList, View } from 'react-native'
import { ListItem } from '../components/listItem'
import { styles } from './styles'

type TProps = {
    event: { key: string; value: string }[]
}

const DebugEventScreenComponent = ({ event }: TProps) => (
    <View style={styles.container}>
        <FlatList
            contentContainerStyle={styles.list}
            data={event}
            keyExtractor={item => item.key}
            renderItem={({ item }) => <ListItem item={item} />}
        />
    </View>
)

export default memo(DebugEventScreenComponent)
