import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { AppText, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { NewProLabel } from '../../Components/CommentListItem/Elements/NewProLabel.tsx'
import { COLOR_WHITE } from '../../constants/styles'
import UserFollowersElement from '../users/components/followersElement/UserFollowersElement'
import UserProfileButtons from '../users/components/UserProfileButtons'
import type { UserInfoT } from '../users/userTypes'

const newAvatarSize = 92

type ProfileCardProps = {
    testID?: string
    userProfileInfo: UserInfoT | null | undefined
    scoresNumber: number
    sets: number
    followUser?: () => void
    unfollowUser?: () => void
    openFollowings: () => void
    openFollowers: () => void
    openScores: () => void
    openSets: () => void
}

export const ProfileCard = memo(
    ({
        userProfileInfo,
        followUser,
        unfollowUser,
        openFollowers,
        openFollowings,
        openScores,
        openSets,
        scoresNumber,
        sets,
        testID,
    }: ProfileCardProps) => {
        const { avatarUrl, coverUrl, userName } = userProfileInfo || {}
        const [currentUser] = useValues([authStoreChunk.props.getUser])

        const followersElement = [
            {
                scores: `${scoresNumber}`,
                counterName: '',
                columnName: translate('native.user.scores'),
                onPress: openScores,
            },
            {
                scores: `${sets}`,
                counterName: '',
                columnName: translate('native.user.sets'),
                onPress: openSets,
            },
            {
                scores: '',
                counterName: 'followersCount',
                columnName: translate('native.user.followers'),
                onPress: openFollowers,
            },
            {
                scores: '',
                counterName: 'followingsCount',
                columnName: translate('native.user.followings'),
                onPress: openFollowings,
            },
        ]

        const backgroundImageStyle = styles.newBackgroundImage
        const avatarImageStyle = styles.newAvatarImage

        return (
            <View style={styles.newContainer} testID={testID}>
                <Image source={{ uri: coverUrl }} style={backgroundImageStyle} />
                <Image source={{ uri: avatarUrl }} style={avatarImageStyle} />
                <View style={styles.titleContainer}>
                    <AppText font="f44w400Accent" textAlign="center" brandColor="contentPrimary">
                        {userName}
                    </AppText>
                    {currentUser.id?.toString() === userProfileInfo?.userId.toString() && (
                        <NewProLabel />
                    )}
                </View>
                <UserFollowersElement
                    userProfileInfo={userProfileInfo}
                    followersElement={followersElement}
                />
                {followUser && (
                    <UserProfileButtons
                        userProfileInfo={userProfileInfo}
                        followUser={followUser}
                        unfollowUser={unfollowUser}
                    />
                )}
            </View>
        )
    },
)

const styles = StyleSheet.create({
    newContainer: {
        alignItems: 'center',
    },

    newAvatarImage: {
        width: newAvatarSize,
        height: newAvatarSize,
        borderRadius: newAvatarSize / 2,
        borderWidth: 1,
        borderColor: COLOR_WHITE,
        marginTop: newAvatarSize / 2,
    },
    newBackgroundImage: {
        ...StyleSheet.absoluteFill,
        bottom: 'auto',
        height: 88,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 16,
        gap: 8,
    },
})
