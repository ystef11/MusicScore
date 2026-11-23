import { View } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import { TFeedItem } from '@mu-native/activity'
import { CommonTouchable } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { scoreThunks } from '@mu-native/score'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../../constants/scoreAnalytic'
import { ScoreListItem } from '../../../../Elements/scoreListItem/ScoreListItem'
import { MSScoreT } from '../../../../Model/MSScore'
import reportEvent from '../../../../Utils/Analytics'
import FeedScoreInfo from '../../elements/FeedScoreInfo'
import FeedItemHeader from '../../elements/itemHeader/FeedItemHeader'
import FeedItemBody from '../FeedItemBody'

import { styles } from './styles'

type Props = {
    item: TFeedItem
    notification?: boolean
}

const FeedListItem = ({ item, notification }: Props) => {
    const navigation = useAppNavigation()
    const openScoreNav = useOpenScore()
    const actions = useActions({ saveScoreCommentsCount: scoreThunks.saveScoreCommentsCount })

    const openScoreScreen = (score: MSScoreT) => {
        reportEvent(MetricaEvents.SCORE_CLICK, getScoreMetaEvent(score, score?.isOfficial))
        openScoreNav(score)
    }

    const openCommentScreen = (score: MSScoreT) => {
        actions.saveScoreCommentsCount(score)
        navigation.navigate(Screen.comments, {
            scoreTitle: score.title,
            scoreId: score.id,
        })
    }

    const openUserProfile = () => {
        if (item?.firstUserId) {
            reportEvent(MetricaEvents.NOTIFICATION_MODAL_CLICK)
            reportEvent(MetricaEvents.FEED_OPEN_USER, {
                verb: item.verb,
                userId: item.firstUserId,
            })
            if (notification) reportEvent(MetricaEvents.NOTIFICATIONS_SETTINGS_FOLLOWER_TURN)
            navigation.navigate(Screen.profileMain, {
                userId: item.firstUserId,
                userName: item.firstUserName,
            })
        }
    }

    const openScoreAuthorProfile = () => {
        reportEvent(MetricaEvents.NOTIFICATION_MODAL_CLICK)

        reportEvent(MetricaEvents.FEED_OPEN_AUTHOR, {
            verb: item.verb,
            userId: item.scoreAuthorId,
        })
        if (notification) reportEvent(MetricaEvents.NOTIFICATIONS_SETTINGS_FOLLOWER_TURN)
        navigation.navigate(Screen.profileMain, {
            userId: item.scoreAuthorId,
            userName: item.scoreAuthorName,
        })
    }

    const openScore = () => {
        const { score } = item.data
        if (!score) return
        reportEvent(MetricaEvents.NOTIFICATION_MODAL_CLICK)

        reportEvent(MetricaEvents.FEED_OPEN_SCORE, {
            verb: item.verb,
            scoreId: score.id,
            scoreTitle: score.title as string,
        })
        openScoreScreen(score as MSScoreT)
    }

    const openComments = () => {
        const { score } = item.data
        if (!score) return
        reportEvent(MetricaEvents.FEED_OPEN_COMMENTS, {
            verb: item.verb,
            scoreId: score.id,
            scoreTitle: score.title as string,
        })
        if (notification) reportEvent(MetricaEvents.NOTIFICATIONS_SETTINGS_SCORE_COMMENTED_TURN)
        openCommentScreen(score as MSScoreT)
    }

    const onPressItem = () => {
        const COMMENT_VERBS = [20, 21, 26]
        const USER_VERBS = [22]

        if (COMMENT_VERBS.includes(item.verb)) {
            openComments()
        }

        if (USER_VERBS.includes(item.verb)) {
            openUserProfile()
        }
    }

    const renderItemHead = (item: any) => (
        <CommonTouchable onPress={openUserProfile} style={styles.itemHeadContainer}>
            <FeedItemHeader item={item} />
        </CommonTouchable>
    )

    const renderItemBody = (item: any) => {
        if (item?.verb === 57 || item?.verb === 58 || item?.verb === 31) {
            return null
        }

        if (item?.verb !== 30) {
            return <FeedScoreInfo item={item} openScore={openScore} />
        }

        return (
            <FeedItemBody
                item={item}
                openScore={openScore}
                onPressItem={onPressItem}
                openComments={openComments}
                likesCount={item?.data?.likesCount}
                openScoreAuthorProfile={openScoreAuthorProfile}
            />
        )
    }

    if (!item) return null

    if (item?.data?.score?.id) {
        return (
            <>
                {renderItemHead(item)}
                <ScoreListItem
                    score={item.data.score as MSScoreT}
                    onScorePress={openScore}
                    style={styles.feedItem}
                />
            </>
        )
    }

    return (
        <View style={styles.container}>
            {renderItemHead(item)}
            {renderItemBody(item)}
        </View>
    )
}

export default FeedListItem
