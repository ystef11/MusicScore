import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, LayoutAnimation, StyleSheet } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import {
    KeyboardSpacer,
    layout,
    Loader,
    NativeBottomSheet,
    NativeBottomSheetRef,
    SheetTitle,
    staticSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { RouteProp, Screen, useAppNavigation, useRoute } from '@mu-native/navigation'
import {
    getThreadCommentIdsByParent,
    scoreCommentsScreenStoreChunk,
    TComment,
} from '@mu-native/score-comments-screen'
import { useActions, useValues } from '@ug/store'

import { EmptyListComponent } from '../../../Components/EmptyListComponent/EmptyListComponent.tsx'
import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import { NewAlertNotifications } from '../../../Elements/NewAlertNotifications.tsx'
import reportEvent from '../../../Utils/Analytics'
import { isIOS } from '../../../Utils/Platform.ts'
import { useCurrentScore } from '@mu-native/score-screen'
import { fetchComments, likeAction, loadMoreComments } from '../commentActionsAsync'

import { NewCommentInput } from './NewCommentInput.tsx'
import { NewCommentListItem } from './NewCommentListItem.tsx'

const keyExtractor = (item: number) => String(item)

type TRouteParams = {
    Comments: {
        scoreId: number
    }
}

export type TReplyTo = {
    id: number
    name: string
}

const OldDesignComments = () => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const hasMore = useRef(true)
    const navigation = useAppNavigation()
    const route = useRoute<RouteProp<TRouteParams, 'Comments'>>()
    const score = useCurrentScore()
    const { scoreId } = route.params
    const [comments, isAuthorized, isLoading] = useValues([
        scoreCommentsScreenStoreChunk.props.getComments,
        getIsAuthorized,
        scoreCommentsScreenStoreChunk.props.getIsLoading,
    ])
    const { ids: commentIds } = comments
    const actions = useActions({
        fetchComments,
        loadMoreComments,
        proceedToAuth: authStoreChunk.actions.setIsVisible,
        setAuthModalAction: authStoreChunk.actions.setModalAction,
        like: likeAction,
        reset: scoreCommentsScreenStoreChunk.actions.reset,
    })

    const [data, setData] = useState<number[]>([])
    const [expandedThreadIds, setExpandedThreadIds] = useState<Set<number>>(new Set())
    const prevDataRef = useRef<number[]>([])

    useEffect(() => {
        sheetRef.current?.present()
    }, [])

    useEffect(() => {
        // Build data array with top-level comments and sorted inline replies
        const result: number[] = []
        const addedIds = new Set<number>()
        const prevData = prevDataRef.current

        commentIds.forEach(id => {
            if (addedIds.has(id)) return

            const comment = comments.byIds[id]
            if (!comment) return

            if (!comment.isReply) {
                // Top-level comment
                result.push(id)
                addedIds.add(id)

                const thread = comments.threads[id]
                const isSmallThread = thread && thread.length <= 4
                const isUserExpanded = expandedThreadIds.has(id)
                // Keep replies visible if they were visible in previous render
                // (prevents collapsing when thread grows past threshold)
                const hasVisibleReplies =
                    thread && thread.some(replyId => replyId !== id && prevData.includes(replyId))

                if (isSmallThread || isUserExpanded || hasVisibleReplies) {
                    const sortedReplies = getThreadCommentIdsByParent(comments, id)
                    sortedReplies.forEach(replyId => {
                        result.push(replyId)
                        addedIds.add(replyId)
                    })
                }
            }
            // Skip replies in main loop - they're added after their parent above
        })

        prevDataRef.current = result
        setData(result)
    }, [commentIds, comments, expandedThreadIds])

    const onLoadMore = async () => {
        if (isLoading) return
        if (!hasMore.current) return
        if (data.length === 0) {
            hasMore.current = false
            return
        }
        // @ts-ignore
        hasMore.current = await actions.loadMoreComments(scoreId)
    }

    useEffect(() => {
        actions.fetchComments(scoreId)
        return () => {
            actions.reset()
        }
    }, [scoreId])

    const [replyTo, setReplyTo] = useState<TReplyTo | null>(null)
    const onPressReply = useCallback(
        (commentId: number, username: string) => {
            reportEvent(MetricaEvents.SCORE_REPLY_CLICK, getScoreMetaEvent(score))

            LayoutAnimation.easeInEaseOut()
            setReplyTo({ id: commentId, name: username })
        },
        [isAuthorized, score],
    )
    const onClearReplyTo = useCallback(() => {
        LayoutAnimation.easeInEaseOut()
        setReplyTo(null)
    }, [])

    const onLike = useCallback(
        (commentId: number) => {
            actions.like(commentId)
        },
        [isAuthorized],
    )

    const onExpandThread = useCallback((threadId: number) => {
        setExpandedThreadIds(prev => new Set(prev).add(threadId))
    }, [])

    const onCommentPress = useCallback((comment: TComment) => {
        navigation.goBack()
        navigation.navigate(Screen.profileMain, {
            userId: comment.user.id,
            userName: comment.user.name,
        })
    }, [])

    const renderComment = ({ item }: { item: number }) => {
        const comment = comments.byIds[item]
        const isParent = comment && !comment.isReply
        const thread = isParent ? comments.threads[item] : null
        const replyCount = thread ? thread.length - 1 : 0 // exclude parent from count
        const isSmallThread = thread && thread.length <= 4
        const isExpanded = expandedThreadIds.has(item)
        // Show button only for parent comments with large threads that aren't expanded
        const showExpandButton = isParent && !isSmallThread && !isExpanded && replyCount > 0

        return (
            <NewCommentListItem
                id={item}
                onReply={onPressReply}
                onLike={onLike}
                onExpandThread={onExpandThread}
                onCommentPress={onCommentPress}
                canLikeOptimistically={isAuthorized}
                showExpandButton={showExpandButton}
                replyCount={replyCount}
            />
        )
    }

    return (
        <NativeBottomSheet ref={sheetRef} onDismiss={navigation.goBack}>
            <>
                <SheetTitle title={translate('native.screen_comments.comments')} />
                {data.length === 0 && !isLoading && <EmptyListComponent />}
                {isLoading && <Loader style={styles.loader} />}
                {data.length > 0 && !isLoading && (
                    <FlatList
                        data={data}
                        renderItem={renderComment}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.contentContainer}
                        onEndReached={onLoadMore}
                    />
                )}

                <NewAlertNotifications bottomOffset={60} />
                <NewCommentInput replyTo={replyTo} onClearReplyTo={onClearReplyTo} />
                <KeyboardSpacer
                    handleAndroid
                    openedSpacing={8}
                    defaultBottomSpacing={isIOS ? staticSafeArea().bottom : 8}
                />
            </>
        </NativeBottomSheet>
    )
}

export const ScreenComments = React.memo(() => {
    return <OldDesignComments />
})

const styles = StyleSheet.create({
    contentContainer: {
        paddingHorizontal: layout.baseMarginFromEdges,
        alignSelf: 'center',
        width: '100%',
    },

    loader: {
        minHeight: 200,
        position: 'relative',
    },
})
