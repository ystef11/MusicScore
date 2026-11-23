import { memo, useCallback, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { userProfileInfoThunks } from '@mu-native/user-profile-info'
import { useActions } from '@ug/store'

import ViewController from '../../../../../../App/Controllers/ViewController'
import reportEvent from '../../../../../../App/Utils/Analytics'
import Utils from '../../../../../../App/Utils/Utils'
import { getScoreMetaEvent } from '../../helpers/scoreHelpers'
import { MSScoreT } from '../../types/scoreTypes'

export const ScoreDetailUploaderProfileDetails = memo(({ score }: { score: MSScoreT }) => {
    const { push } = useAppNavigation()
    const actions = useActions({
        follow: userProfileInfoThunks.toggleFollowUser,
        unfollow: ViewController.showUserProfileActionSheet,
    })

    const onOpenProfile = useCallback(() => {
        reportEvent(RT_EVENTS.SCORE_PROFILE_CLICK, {
            ...getScoreMetaEvent(score),
            'params.key': ['placement'],
            'params.str_value': ['score'],
            'params.value': [0],
        })
        push(Screen.profileMain, { userId: score.authorId, userName: score.authorName })
    }, [push, score])

    const buttonText = score.profile?.isFollowing
        ? translate('native.user.unfollow')
        : translate('native.user.follow')

    const [_, setReload] = useState(false)
    const onButtonPress = useCallback(async () => {
        const { profile } = score
        if (!profile) return

        reportEvent(
            profile.isFollowing ? RT_EVENTS.SCORE_UNFOLLOW : RT_EVENTS.SCORE_FOLLOW,
            getScoreMetaEvent(score),
        )
        if (profile.isFollowing) {
            await actions.unfollow(profile)
        } else {
            await actions.follow(profile)
        }
        setReload(reload => !reload)
    }, [actions, score])

    const followersCountText = score.profile
        ? translate('native.user.followers_count', {
              count: score.profile.followersCount,
              formattedCount: Utils.formatNumber(score.profile.followersCount),
          })
        : ''

    return (
        <View style={styles.container}>
            <CommonTouchable style={styles.profileContainer} onPress={onOpenProfile}>
                <Image source={{ uri: score.profile?.avatarUrl }} style={styles.profileImage} />
                <View style={styles.profileNameContainer}>
                    <AppText font="f15w500" rawText={score.authorName} />
                    <AppText
                        font="f13w400"
                        brandColor="contentSecondary"
                        rawText={followersCountText}
                    />
                </View>
            </CommonTouchable>
            {!!score.profile && (
                <MuseButton
                    size="small"
                    onPress={onButtonPress}
                    type="secondary"
                    title={buttonText}
                />
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 6,
        alignItems: 'center',
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    profileImage: {
        height: 44,
        width: 44,
        borderRadius: 22,
    },
    profileNameContainer: {
        flex: 1,
    },
})
