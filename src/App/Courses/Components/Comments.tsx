import { useEffect } from 'react'
import { View, ViewStyle, Text, TextStyle, StyleSheet } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { useCourseDetailsContext } from '@mu-native/course-details'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { COLOR_GREY_900, COLOR_GREY_700 } from '../../constants/styles'
import reportEvent from '../../Utils/Analytics'
import { loadComments } from '../coursesActionsAsync'
import type { TComment } from '../coursesTypes'

import Comment from './comment/Comment'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 100,
    } as ViewStyle,
    emptyContainer: {
        paddingHorizontal: 16,
    } as ViewStyle,
    emptyTitle: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        color: COLOR_GREY_900,
        marginBottom: 12,
    } as TextStyle,
    emptyDescription: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: COLOR_GREY_700,
    } as TextStyle,
})

type Props = {
    onReply: (commentId: number, userName: string, offset: number) => void
}

const Comments = ({ onReply }: Props) => {
    const courseDetailsChunk = useCourseDetailsContext()

    const [courseInfo, comments] = useValues([
        courseDetailsChunk.props.getCourseInfo,
        courseDetailsChunk.props.getComments,
    ])
    const actions = useActions({
        loadComments,
    })
    const courseId = courseInfo?.course.id || '0'

    useEffect(() => {
        if (courseInfo) {
            reportEvent(MetricaEvents.COURSE_DISCUSSION, { ...courseInfo.tracking })
            actions.loadComments(courseDetailsChunk)
        }
    }, [courseInfo, actions, courseDetailsChunk])

    const renderComment = (comment: TComment) => (
        <Comment
            key={comment.id}
            courseId={courseId}
            comment={comment}
            onReply={onReply}
        />
    )

    return (
        <View style={styles.container} testID={coursesTestIds.courseDetails.commentsContent}>
            {comments?.length ? (
                comments?.map(renderComment)
            ) : (
                <View style={styles.emptyContainer}>
                    <Text
                        testID={coursesTestIds.courseDetails.commentsEmptyTitle}
                        style={styles.emptyTitle}
                    >
                        {translate('native.courses.no_comments_title')}
                    </Text>
                    {courseInfo?.has_access ? (
                        <Text style={styles.emptyDescription}>
                            {translate('native.courses.no_comments_description')}
                        </Text>
                    ) : null}
                </View>
            )}
        </View>
    )
}

export default Comments
