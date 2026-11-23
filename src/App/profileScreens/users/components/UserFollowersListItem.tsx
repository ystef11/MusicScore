import { PureComponent } from 'react'
import { Image, StyleSheet, Text } from 'react-native'

import { colors, CommonTouchable, layout } from '@mu-native/ds'

import { TRANSPARENT } from '../../../constants/styles'
import { isTablet } from '../../../Utils/Platform'

const AVATAR_DIMENSIONS = isTablet ? 104 : 60
const NEW_AVATAR_DIMENSIONS = isTablet ? 84 : 40

const styles = StyleSheet.create({
    newContainer: {
        height: NEW_AVATAR_DIMENSIONS + 2,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        gap: 8,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    newText: {
        color: colors.text900,
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 14,
        lineHeight: 20,
        flexShrink: 1,
    },
    newImage: {
        width: NEW_AVATAR_DIMENSIONS,
        height: NEW_AVATAR_DIMENSIONS,
        borderColor: TRANSPARENT,
        borderRadius: NEW_AVATAR_DIMENSIONS / 2,
    },
})
interface UserFollowersListItemProps {
    userId: number
    openUserScreen: (userId: number, userName: string) => void
    avatarUrl: string
    userName: string
    testID: string | undefined
}

class UserFollowersListItem extends PureComponent<UserFollowersListItemProps> {
    openUserScreen: () => void = () => {
        const { userId, userName, openUserScreen } = this.props
        openUserScreen(userId, userName)
    }

    render() {
        const { avatarUrl, userName, testID } = this.props
        return (
            <CommonTouchable
                testID={testID}
                onPress={this.openUserScreen}
                style={styles.newContainer}
            >
                <Image
                    source={{ uri: avatarUrl || undefined }}
                    resizeMode="cover"
                    style={styles.newImage}
                />
                <Text style={styles.newText} numberOfLines={1} ellipsizeMode="tail">
                    {userName}
                </Text>
            </CommonTouchable>
        )
    }
}

export default UserFollowersListItem
