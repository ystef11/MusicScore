import { memo, useCallback, useEffect } from 'react'

import { authStoreChunk, authThunks } from '@mu-native/auth'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { mainAppScreens } from '../../../../src/navigation'
import MetricaEvents from '../../../constants/MetricaEvents.ts'
import { countersStoreChunk } from '../../../Library/countersStoreChunk.ts'
import { currentUserCountersApi } from '../../../Library/currentUserCountersApi.ts'
import reportEvent from '../../../Utils/Analytics.ts'
import { ProfileCard } from '../../components/ProfileCard.tsx'

export const AuthorizedUserProfileContainer = memo(({ userId }: { userId: number }) => {
    const [userProfileInfo, counters, network] = useValues([
        authStoreChunk.props.getUserProfile,
        countersStoreChunk.props.getCounters,
        systemStoreChunk.props.getNetwork,
    ])
    const navigation = useAppNavigation()

    const actions = useActions({
        loadProfile: authThunks.loadUserProfile,
        fetchCounters: currentUserCountersApi.fetch,
    })

    useEffect(() => {
        const update = () => {
            if (network?.isConnected) {
                actions.loadProfile()
                actions.fetchCounters()
            }
        }
        const remove = navigation.addListener('focus', update)

        return () => {
            remove()
        }
    }, [userId, network?.isConnected])

    const onOpenScores = useCallback(() => {
        navigation.push(mainAppScreens.mySheetmusic)
    }, [])

    const onOpenSets = useCallback(() => {
        reportEvent(MetricaEvents.SETS_OPEN, {
            type: 'my',
            elements: userProfileInfo?.setsCount ?? 0,
        })
        navigation.push(Screen.profileSet, {
            userId,
            userName: translate('native.user.my'),
        })
    }, [userProfileInfo, userId])

    const onOpenFollowers = useCallback(() => {
        navigation.push(Screen.followers, {
            mode: 'followers',
            userId,
            title: translate('native.user.followers'),
        })
    }, [userId])

    const onOpenFollowings = useCallback(() => {
        navigation.push(Screen.followers, {
            mode: 'followings',
            userId,
            title: translate('native.user.followings'),
        })
    }, [userId])

    return (
        <ProfileCard
            testID="Profile"
            userProfileInfo={userProfileInfo}
            scoresNumber={counters.score_count}
            sets={userProfileInfo?.setsCount ?? 0}
            openScores={onOpenScores}
            openSets={onOpenSets}
            openFollowers={onOpenFollowers}
            openFollowings={onOpenFollowings}
        />
    )
})
