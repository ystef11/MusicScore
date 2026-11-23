import { StyleSheet } from 'react-native'

import { layout, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { UserInfoT } from '../userTypes.ts'

const styles = StyleSheet.create({
    button: {
        alignSelf: 'stretch',
        marginHorizontal: layout.baseMarginFromEdges,
    },
})

const FollowButton = ({ followUser }: { followUser: () => void }) => {
    return (
        <MuseButton
            onPress={followUser}
            style={styles.button}
            title={translate('native.user.follow')}
        />
    )
}

const UnfollowButton = ({ unfollowUser }: { unfollowUser?: () => void }) => {
    return (
        <MuseButton
            onPress={unfollowUser}
            style={styles.button}
            title={translate('native.user.unfollow')}
        />
    )
}

type TProps = {
    followUser: () => void
    unfollowUser?: () => void
    userProfileInfo?: UserInfoT | null
}

const UserProfileButtons = ({ userProfileInfo, followUser, unfollowUser }: TProps) => {
    const { isFollowing = false } = userProfileInfo || {}
    const Button = isFollowing ? UnfollowButton : FollowButton
    return <Button followUser={followUser} unfollowUser={unfollowUser} />
}

export default UserProfileButtons
