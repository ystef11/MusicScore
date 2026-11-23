import React, { memo } from 'react'
import { FlatList, View } from 'react-native'
import type { TRequestMap } from '@mu-native/debug'
import { ListItem } from '../components/listItem'
import { styles } from './styles'

type TProps = {
    request: TRequestMap
}

const DebugRequestScreenComponent = ({ request }: TProps) => (
    <View style={styles.container}>
        <FlatList
            contentContainerStyle={styles.list}
            data={request}
            keyExtractor={item => item.key}
            renderItem={({ item }) => <ListItem item={item} />}
        />
    </View>
)

export default memo(DebugRequestScreenComponent)
