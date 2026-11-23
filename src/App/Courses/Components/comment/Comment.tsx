import React, { useRef } from 'react'
import { Image, LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { getUserId } from '@mu-native/auth'
import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { useCourseDetailsContext } from '@mu-native/course-details'
import { brandColors, CommonTouchable, Icon, icons, layoutHelpers } from '@mu-native/ds'
import { detail } from '@mu-native/icons/detail'
import { translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import ViewController from '../../../Controllers/ViewController'
import Label from '../../../Elements/Label'
import { formatDate } from '../../../Score/Comments/commentHelpers'
import type { TComment } from '../../coursesTypes'
import TruncatedThread from '../TruncatedThread'

import { styles } from './styles'

const dot = ' '

type TProps = {
    courseId: string
    comment: TComment
    noReplies?: boolean
    isReply?: boolean
    onReply: (commentId: number, userName: string, offset: number) => void
}

const Comment = ({
    courseId,
    comment,
    noReplies,
    isReply,
    onReply,
}: TProps): React.ReactElement => {
    const offset = useRef(0)

    const courseDetailsChunk = useCourseDetailsContext()

    const actions = useActions({ showActions: ViewController.showCourseCommentActionPopup })
    const [ownId, commentsThreads] = useValues([
        getUserId,
        courseDetailsChunk.props.getCommentsThreads,
    ])

    const { container, avatar, contentContainer, title, time, message, buttonText, icon } = styles
    const containerStyle = StyleSheet.flatten([container, isReply ? styles.marginLeft : {}])

    const { id, user, date_created, body } = comment
    const thread = commentsThreads?.[comment.id]

    const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
        offset.current = nativeEvent.layout.y
    }
    const navigateToUserProfile = () => {
        NavigationService.navigate(Screen.profileMain, { userId: user.id, userName: user.name })
    }
    const navigatetoThread = () => {
        NavigationService.navigate(Screen.courseCommentThread, { courseId, commentId: comment.id })
    }
    const handleReply = () => onReply(comment.id, user.name, offset.current)
    const openActions = () => actions.showActions(id, courseDetailsChunk)

    let commentText = body
    const mentionIndex = commentText.indexOf('@')
    const commaIndex = commentText.indexOf(',')
    let mention = ''

    if (mentionIndex !== -1) {
        mention = commentText.slice(mentionIndex, commaIndex)
        commentText = commentText.slice(commaIndex)
    }

    return (
        <View
            style={containerStyle}
            onLayout={handleLayout}
            testID={coursesTestIds.courseDetails.commentsItem}
        >
            <TouchableOpacity onPress={navigateToUserProfile}>
                <Image style={avatar} source={{ uri: user.avatar_url }} />
            </TouchableOpacity>
            <View style={contentContainer}>
                <View style={styles.headingContainer}>
                    <View style={styles.headingBlock}>
                        <TouchableOpacity onPress={navigateToUserProfile}>
                            <Text style={title}>{user.name}</Text>
                        </TouchableOpacity>
                        {user.is_pro ? <Label theme="pro" size="small" text="pro" /> : null}
                        <Text style={time}>
                            {`${user.is_pro ? ' ' : ''}${dot} ${formatDate(+date_created)}`}
                        </Text>
                    </View>
                    {ownId === +user.id ? (
                        <CommonTouchable onPress={openActions} hitSlop={32}>
                            <Icon
                                source={detail}
                                size={layoutHelpers.getResponsiveSizeExtended(16)}
                                tint={brandColors.contentPrimary}
                            />
                        </CommonTouchable>
                    ) : null}
                </View>
                <Text style={message}>
                    <Text style={styles.mention} onPress={navigateToUserProfile}>
                        {mention}
                    </Text>
                    {commentText}
                </Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleReply}>
                        <Image style={icon} source={icons.iconAnswer} />
                        <Text style={buttonText}>{translate('native.screen_comments.reply')}</Text>
                    </TouchableOpacity>
                </View>
                {thread && !noReplies ? (
                    <TruncatedThread comments={thread} onThread={navigatetoThread} />
                ) : null}
            </View>
        </View>
    )
}

export default React.memo(Comment)
