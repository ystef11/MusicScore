import { memo, useCallback } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import { AppText, brandColors, CommonTouchable, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'

import reportEvent from '../../../../../../App/Utils/Analytics'
import Utils from '../../../../../../App/Utils/Utils'
import { getScoreMetaEvent } from '../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../types/scoreTypes'

type Props = {
    score: MSScoreT
}

export const ScoreDetailHighlightComment = memo(({ score }: Props) => {
    const navigation = useAppNavigation()
    const totalCountString = Utils.formatNumber(score.commentsCount)
    const comment = score.scoreComment

    const onPress = useCallback(() => {
        reportEvent(RT_EVENTS.SCORE_VIEW_COMMENTS_CLICK, getScoreMetaEvent(score))
        navigation.navigate(Screen.comments, { scoreTitle: score.title, scoreId: score.id })
    }, [navigation, score])

    const userAvatar = getStoreValue(authStoreChunk.props.getUser)?.avatar

    return (
        <CommonTouchable
            style={styles.container}
            onPress={onPress}
            testID={scoreTestIds.scoreDetailsCommentsSection}
        >
            <View style={styles.headerTextContainer}>
                <AppText font="f15w500" rawText={translate('native.screen_comments.comments')} />
                <AppText font="f15w400" brandColor="contentSecondary" rawText={totalCountString} />
            </View>
            {!!comment && (
                <View style={styles.bodyContainer}>
                    {comment.user?.image && (
                        <Image source={{ uri: comment.user.image }} style={styles.authorImage} />
                    )}
                    <AppText
                        font="f15w400"
                        numberOfLines={2}
                        style={globalStyles.flex1}
                        rawText={comment.body}
                    />
                </View>
            )}

            {!comment && (
                <View style={styles.bodyContainer}>
                    {!!userAvatar && (
                        <Image source={{ uri: userAvatar }} style={styles.authorImage} />
                    )}
                    <AppText
                        font="f15w400"
                        brandColor="contentSecondary"
                        style={globalStyles.flex1}
                        rawText={translate('native.add_comment')}
                    />
                </View>
            )}
        </CommonTouchable>
    )
})
const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: brandColors.backgroundInactive,
        marginTop: 20,
        borderRadius: 1,
    },

    headerTextContainer: {
        flexDirection: 'row',
        columnGap: 4,
    },

    bodyContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
        gap: 8,
    },
    authorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
})
