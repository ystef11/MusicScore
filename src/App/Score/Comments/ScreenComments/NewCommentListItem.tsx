import React, { useCallback, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    CommonTouchable,
    globalStyles,
    Icon,
    IconSource,
} from '@mu-native/ds'
import { likeFilled } from '@mu-native/icons/likeFilled'
import { likeOutlined } from '@mu-native/icons/likeOutlined'
import { reply } from '@mu-native/icons/reply'
import { translate } from '@mu-native/locale'
import { getCommentById, TComment } from '@mu-native/score-comments-screen'
import { useValues } from '@ug/store'

import { State } from '../../../Reducers/Types'
import { formatDate } from '../commentHelpers'

type Props = {
    id: number
    onLike: (id: number) => void
    onReply: (id: number, name: string) => void
    onCommentPress: (comment: TComment) => void
    onExpandThread: (threadId: number) => void
    canLikeOptimistically?: boolean
    showExpandButton: boolean
    replyCount: number
}

const OpenThreadButton = React.memo(
    ({
        threadId,
        replyCount,
        onPress,
    }: {
        threadId: number
        replyCount: number
        onPress: (threadId: number) => void
    }) => {
        const buttonText = translate('native.screen_comments.replies_count_plural', {
            count: replyCount,
        })
        return (
            <CommonTouchable
                hitSlop={20}
                onPress={() => onPress(threadId)}
                style={styles.threadButton}
            >
                <AppText rawText={buttonText} brandColor="contentPrimary" font="f15w500" />
            </CommonTouchable>
        )
    },
)

const FooterButton = (props: { onPress: () => void; icon: IconSource; text: string }) => (
    <CommonTouchable hitSlop={20} onPress={props.onPress} style={styles.likeButton} isHapticEnabled>
        <Icon tint={brandColors.contentPrimary} source={props.icon} />
        <AppText rawText={props.text} brandColor="contentPrimary" font="f15w500" />
    </CommonTouchable>
)

export const NewCommentListItem = React.memo(
    ({
        id,
        onLike,
        onReply,
        onExpandThread,
        onCommentPress,
        canLikeOptimistically = true,
        showExpandButton,
        replyCount,
    }: Props) => {
        const [comment] = useValues([(state: State) => getCommentById(state, id)])
        const [isLiked, setLiked] = useState(comment?.is_liked ?? false)

        const handleLike = useCallback(() => {
            onLike?.(id)
            if (canLikeOptimistically) {
                setLiked(p => !p)
            }
        }, [canLikeOptimistically, id, onLike])
        const handleReply = useCallback(() => {
            if (comment?.user.name) {
                onReply?.(id, comment?.user.name)
            }
        }, [comment?.user.name, onReply, id])
        const onOpenProfile = useCallback(() => {
            if (!comment) return
            onCommentPress(comment)
        }, [onCommentPress, comment])

        if (!comment) return null

        const { user, dateCreatedAt, likes_count, isReply } = comment

        return (
            <View style={[styles.container, isReply && styles.replyContainer]}>
                <CommonTouchable onPress={onOpenProfile}>
                    <Image source={{ uri: user.image }} style={styles.avatar} />
                </CommonTouchable>
                <View style={styles.body}>
                    <View style={styles.header}>
                        <CommonTouchable style={styles.usernameWrapper} onPress={onOpenProfile}>
                            <AppText
                                rawText={user.name}
                                font="f15w500"
                                ellipsizeMode="tail"
                                numberOfLines={1}
                            />
                        </CommonTouchable>
                        <AppText
                            brandColor="contentSecondary"
                            font="f15w500"
                            rawText={formatDate(dateCreatedAt)}
                            style={globalStyles.flex1}
                            numberOfLines={1}
                        />
                    </View>
                    <AppText font="f15w400" rawText={comment.text.trim()} />
                    <View style={styles.footer}>
                        <FooterButton
                            onPress={handleLike}
                            icon={isLiked ? likeFilled : likeOutlined}
                            text={`${likes_count || translate('native.screen_comments.likes')}`}
                        />

                        <FooterButton
                            onPress={handleReply}
                            icon={reply}
                            text={translate('native.screen_comments.reply')}
                        />
                    </View>
                    {showExpandButton && (
                        <OpenThreadButton
                            threadId={id}
                            replyCount={replyCount}
                            onPress={onExpandThread}
                        />
                    )}
                </View>
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingTop: 16,
    },

    body: {
        marginLeft: 16,
        flex: 1,
    },

    header: {
        flexDirection: 'row',
        columnGap: 8,
        marginBottom: 4,
        flex: 1,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        columnGap: 20,
    },

    usernameWrapper: {},

    replyContainer: {
        marginLeft: 64,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },

    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
        height: 44,
    },

    threadButton: {
        height: 44,
        justifyContent: 'center',
    },
})
