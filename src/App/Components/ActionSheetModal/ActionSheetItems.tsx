import { StyleSheet, View } from 'react-native'

import { staticSafeArea } from '@mu-native/ds'

import ActionSheetListItem from './components/listItem/ActionSheetListItem'

export const ActionSheetItemsView = ({
    items,
}: {
    items: { text: string; selected: boolean; onPress: () => void }[]
}) => {
    return (
        <View style={styles.base}>
            {items.map((item, index) => (
                <ActionSheetListItem key={item.text} {...item} />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        paddingTop: 16,
        paddingBottom: staticSafeArea().bottomWithAndroid,
    },
})
