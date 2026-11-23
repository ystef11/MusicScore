import { useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { Loader } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import { COLOR_WHITE, MARGIN_SM } from '../../../constants/styles'
import { isTablet } from '../../../Utils/Platform'
import type { UserListItemT } from '../userTypes'

import UserFollowersListItem from './UserFollowersListItem'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: COLOR_WHITE,
    },
    content: {
        paddingVertical: MARGIN_SM,
    },

    indicator: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: COLOR_WHITE,
    },
})

type TProps = {
    readonly items: UserListItemT[]
    readonly testID: string | undefined
    readonly onEndReached: () => void
    readonly isLoading: boolean
}

const keyExtractor = (item: any) => item.userId

export const UserFollowersList = ({ items, testID, onEndReached, isLoading }: TProps) => {
    const navigation = useAppNavigation()
    const openUserScreen = useCallback((userId: number, userName: string) => {
        navigation.push(Screen.profileMain, { userId, userName })
    }, [])

    if (isLoading && items.length === 0) {
        return (
            <View style={styles.indicator}>
                <Loader size="large" />
            </View>
        )
    }

    const renderItem = (info: ListRenderItemInfo<UserListItemT>) => {
        return (
            <UserFollowersListItem
                testID={!info.index && testID ? testID : undefined}
                {...info.item}
                openUserScreen={openUserScreen}
            />
        )
    }

    return (
        <FlatList
            key={isTablet ? 'tablet4' : 'mobile3'}
            data={items}
            showsVerticalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.content}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={onEndReached}
        />
    )
}
