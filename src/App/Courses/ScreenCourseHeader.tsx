import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { RNShare } from '@mu-native/common'
import { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { AppNavigationHeaderView, brandColors, NavigationIconButton } from '@mu-native/ds'
import { heartFilled } from '@mu-native/icons/heartFilled'
import { heartOutlined } from '@mu-native/icons/heartOutlined'
import { share } from '@mu-native/icons/share'
import { translate } from '@mu-native/locale'
import { NavigationService } from '@mu-native/navigation'

import MetricaEvents from '../constants/MetricaEvents'
import type { State } from '../Reducers/Types'
import reportEvent from '../Utils/Analytics'

import { addCourseToFavorites, removeCourseFromFavorites } from './coursesActionsAsync'
import type { TCourseInfo } from './coursesTypes'

interface IProps {
    courseInfo: TCourseInfo | null
    title?: string
    isAuthorized: boolean
    addCourseToFavorites: (courseId: string) => void
    removeCourseFromFavorites: (courseId: string) => void
    showAuthModal: (action: () => void) => void
}

class ScreenCourseHeader extends PureComponent<IProps> {
    handleFavoriteAdd = () => {
        const { isAuthorized, courseInfo, addCourseToFavorites, showAuthModal } = this.props

        reportEvent(MetricaEvents.COURSE_LIKE_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
        })

        if (!courseInfo) return

        if (!isAuthorized) {
            showAuthModal(() => {
                reportEvent(MetricaEvents.COURSE_FAVORITES_ADD, {
                    ...courseInfo.tracking,
                    course_id: courseInfo?.course.tracking_id,
                })
                reportEvent(MetricaEvents.COURSE_LIKE, {
                    course_id: courseInfo?.course?.tracking_id,
                })
                addCourseToFavorites(courseInfo.course.id)
            })
        } else {
            reportEvent(MetricaEvents.COURSE_FAVORITES_ADD, {
                ...courseInfo.tracking,
                course_id: courseInfo?.course.tracking_id,
            })
            reportEvent(MetricaEvents.COURSE_LIKE, { course_id: courseInfo?.course?.tracking_id })
            addCourseToFavorites(courseInfo.course.id)
        }
    }

    handleFavoriteRemove = () => {
        const { courseInfo, removeCourseFromFavorites } = this.props

        if (!courseInfo) {
            return
        }

        reportEvent(MetricaEvents.COURSE_FAVORITES_REMOVE, {
            ...courseInfo.tracking,
            course_id: courseInfo?.course.tracking_id,
        })
        reportEvent(MetricaEvents.COURSE_UNLIKE, { course_id: courseInfo?.course?.tracking_id })
        removeCourseFromFavorites(courseInfo.course.id)
    }

    handleSharePress = async () => {
        const { courseInfo } = this.props
        reportEvent(MetricaEvents.COURSE_SHARE_CLICK, {
            course_id: courseInfo?.course?.tracking_id,
        })

        if (!courseInfo) {
            return
        }

        reportEvent(MetricaEvents.COURSE_SHARE_EXPAND, {
            ...courseInfo.tracking,
            course_id: courseInfo?.course.tracking_id,
        })

        const url = courseInfo.course.web_url
        const title = courseInfo.course.name

        const message = translate('native.share.title')
        const options = Platform.select({
            ios: {
                activityItemSources: [
                    {
                        placeholderItem: { type: 'url', content: url },
                        item: { default: { type: 'url', content: url } },
                        subject: { default: title },
                        linkMetadata: { originalUrl: url, url, title },
                    },
                ],
                failOnCancel: false,
            },
            default: {
                title,
                subject: title,
                message: `${message} ${title}\n${url}`,
                failOnCancel: false,
            },
        })
        reportEvent(MetricaEvents.COURSE_SHARE_MODAL_OPEN, {
            course_id: courseInfo?.course?.tracking_id,
        })
        // @ts-ignore
        await RNShare.open(options)
    }

    rightBlock = () => {
        const { courseInfo } = this.props
        const isFavorite = courseInfo?.course?.is_favorite

        return (
            <>
                <NavigationIconButton
                    isHapticEnabled
                    icon={isFavorite ? heartFilled : heartOutlined}
                    onPress={isFavorite ? this.handleFavoriteRemove : this.handleFavoriteAdd}
                    color={brandColors.contentPrimary}
                />
                <NavigationIconButton
                    icon={share}
                    color={brandColors.contentPrimary}
                    onPress={this.handleSharePress}
                />
            </>
        )
    }

    render() {
        const { title } = this.props

        return (
            <AppNavigationHeaderView
                title={title}
                goBack={NavigationService.goBack}
                rightBlock={() => this.rightBlock()}
            />
        )
    }
}

const mapStateToProps = (state: State, ownProps: { chunk: TCourseDetailsDynamicStoreChunk }) => ({
    courseInfo: ownProps.chunk.props.getCourseInfo(state),
    isAuthorized: getIsAuthorized(state),
})
const mapDispatchToProps = (
    dispatch: (...args: Array<any>) => any,
    ownProps: { chunk: TCourseDetailsDynamicStoreChunk },
) => ({
    addCourseToFavorites: (courseId: string) => {
        dispatch(addCourseToFavorites(courseId))
        dispatch(ownProps.chunk.actions.toggleLikeCourse())
    },
    removeCourseFromFavorites: (courseId: string) => {
        dispatch(removeCourseFromFavorites(courseId))
        dispatch(ownProps.chunk.actions.toggleLikeCourse())
    },
    showAuthModal: (action: () => void) => {
        dispatch(authStoreChunk.actions.setIsVisible(true))
        dispatch(authStoreChunk.actions.setModalAction(action))
    },
})

// @ts-ignore
export default connect(
    mapStateToProps,
    mapDispatchToProps,
    // @ts-ignore
)(ScreenCourseHeader) as React.ComponentClass<{
    chunk: TCourseDetailsDynamicStoreChunk
    title?: string
}>
