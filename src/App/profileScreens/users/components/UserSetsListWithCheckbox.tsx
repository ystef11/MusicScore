import { memo } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { BrandCheckboxWithTitle } from '@mu-native/ds'

import { SetT } from '../userTypes'

type TSetList = {
    data: SetT[]
    selectedIds: number[]
    onToggle: (selectedSet: SetT) => void
    isLoading: boolean
    onLoadMore: () => void
}

export const UserSetsListWithCheckbox = memo(
    ({ data, onToggle, isLoading, onLoadMore, selectedIds }: TSetList) => {
        const renderItem = ({ item }: ListRenderItemInfo<SetT>) => {
            const { title } = item
            const selected = selectedIds.includes(item.id)

            return (
                <View style={styles.newItemContainer}>
                    <BrandCheckboxWithTitle
                        title={title}
                        selected={selected}
                        onToggle={() => onToggle(item)}
                    />
                </View>
            )
        }

        return (
            <FlatList<SetT>
                data={data}
                extraData
                renderItem={renderItem}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                initialNumToRender={data.length}
                onEndReached={isLoading || data.length === 0 ? undefined : onLoadMore}
            />
        )
    },
)

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 10,
        paddingTop: 20,
    },

    newItemContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 48,
        width: '100%',
    },
})
