import { JSX, memo, useCallback, useState } from 'react'
import {
    FlatList,
    Image,
    ImageStyle,
    ListRenderItemInfo,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { colors, CommonTouchable, icons, layout, BaseEmptyStateView } from '@mu-native/ds'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'

import NavHeaderSearchBar from '../../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { SetT } from '../userTypes'
import { filterSetsByName } from '../utils'

const styles = StyleSheet.create({
    setsList: {
        flex: 1,
        backgroundColor: colors.white,
    } as ViewStyle,
    contentList: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    } as ViewStyle,
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        width: '100%',
    } as ViewStyle,
    titleContainer: {
        alignItems: 'flex-start',
    } as ViewStyle,

    newItemTitle: {
        fontSize: 14,
        lineHeight: 20,
        maxWidth: layout.fullScreenHeight / 3,
        color: colors.text900,
    } as TextStyle,
    itemDescription: {
        fontSize: 12,
        lineHeight: 16,
        maxWidth: layout.fullScreenHeight / 3,
        color: colors.gray500,
        marginTop: 4,
    } as TextStyle,

    newForwardIcon: {
        height: 17,
        width: 17,
    } as ImageStyle,
})

type TSetList = {
    data: SetT[]
    isLoading: boolean
    onEdit: (set: SetT) => void
    onEmpty: () => void
    onLoadMore: () => void
    onFocus: () => void
}

type Item = {
    item: SetT
    index: number
}

export const UserSetsList = memo(
    ({ data, onEdit, onEmpty, onLoadMore, isLoading, onFocus }: TSetList) => {
        const [searchText, setSearchText] = useState<string>('')

        const renderItem = ({ item }: Item) => {
            const { title, description } = item
            const doEdit = () => onEdit(item)
            const iconSource = icons.iosForwardIcon
            const iconStyle = styles.newForwardIcon
            return (
                <CommonTouchable
                    onPress={doEdit}
                    testID={libraryTestIds.lists.mySetsItem(item.id)}
                >
                    <View style={styles.itemContainer}>
                        <View style={styles.titleContainer}>
                            <Text numberOfLines={1} style={styles.newItemTitle}>
                                {title}
                            </Text>
                            {description?.length ? (
                                <Text numberOfLines={1} style={styles.itemDescription}>
                                    {description}
                                </Text>
                            ) : null}
                        </View>
                        <Image source={iconSource} style={iconStyle} />
                    </View>
                </CommonTouchable>
            )
        }

        const filteredData = filterSetsByName(data, searchText)

        const onCancel = useCallback(() => {
            setSearchText('')
        }, [])

        return data?.length ? (
            <>
                <NavHeaderSearchBar
                    searchTerm={searchText}
                    onChangeText={setSearchText}
                    clearInputValue={onCancel}
                    onSearchFocus={onFocus}
                    moduleKey="setList"
                />
                <FlatList
                    testID={libraryTestIds.lists.mySetsList}
                    data={filteredData}
                    extraData
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    renderItem={
                        renderItem as ({ item }: ListRenderItemInfo<unknown>) => JSX.Element
                    }
                    keyExtractor={(({ id }) => `item-${id}`) as (item: unknown) => string}
                    style={styles.setsList}
                    contentContainerStyle={styles.contentList}
                    refreshing={isLoading}
                    onEndReached={isLoading || filteredData.length === 0 ? undefined : onLoadMore}
                />
            </>
        ) : (
            <BaseEmptyStateView
                title={translate('native.sets.empty_title')}
                description={translate('native.sets.empty_description')}
                icon={noteList}
                primaryButton={{
                    title: translate('native.sets.empty_button'),
                    onPress: onEmpty,
                }}
            />
        )
    },
)
