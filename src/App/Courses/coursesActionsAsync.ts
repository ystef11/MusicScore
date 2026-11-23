import { NativeModules } from 'react-native'
import RNFetchBlob from 'react-native-blob-util'

import { apiRequest, courseContracts, isResponse, TCourseSearchParamsDto } from '@mu-native/api'
import { getIsAuthorized } from '@mu-native/auth'
import { DispatchFun, GetStateFun, RNFS, RNShare, sanitizeCommentBody } from '@mu-native/common'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { type TCourseListDynamicStoreChunk } from '@mu-native/course-list'
import { translate } from '@mu-native/locale'
import { ensureNetwork } from '@mu-native/system'

import MetricaEvents from '../constants/MetricaEvents'
import { showAlertNotification } from '../Elements/NewAlertNotifications.tsx'
import reportEvent from '../Utils/Analytics'
import { isAndroid } from '../Utils/Platform'

import { coursesStorage } from './coursesStorage'
import type { TLesson, TMaterial, TProgress, TUnit } from './coursesTypes'

type TFeedbackParams = {
    rating: number
    feedback_like?: string
    feedback_suggest: string
    feedbackParams: {
        lessonId: number
        contentId: number
        source: string
    }
}

type TSelectedFilters = { [key: string]: string[] | string }

const listOf = (value: string[] | string | undefined) => {
    if (!value?.length) return undefined
    return Array.isArray(value) ? value : [value]
}

const SINGLE_CHOICE_FILTERS = new Set(['text', 'level', 'sort', 'only_editors_picks', 'alias'])

/**
 * Drops empty filters. Single-choice keys travel as the chosen keyword, the rest as lists.
 * The groups themselves come from `OPTIONS /course/search` and the carousel `view_all_data`,
 * so every selected key is forwarded rather than a fixed subset.
 */
const toCourseSearchParams = (
    selectedFilters: TSelectedFilters,
    page: number,
): TCourseSearchParamsDto => {
    const params: TCourseSearchParamsDto = { page }
    Object.entries(selectedFilters).forEach(([key, value]) => {
        const list = listOf(value)
        if (!list) return
        params[key] = SINGLE_CHOICE_FILTERS.has(key) ? list[0] : list
    })
    return params
}

const requestCourseList = (isFavorites: boolean, params: TCourseSearchParamsDto) =>
    apiRequest(isFavorites ? courseContracts.favorites : courseContracts.search, { params })

export function loadSections() {
    return async (dispatch: DispatchFun) => {
        try {
            dispatch(courseBrowseStoreChunk.actions.setIsLoading(true))
            const { sections } = await apiRequest(courseContracts.sections)
            dispatch(courseBrowseStoreChunk.actions.setSections(sections))
        } catch (error) {
            console.error('COURSES LOAD SECTIONS', error)
            dispatch(courseBrowseStoreChunk.actions.setSections([]))
        } finally {
            dispatch(courseBrowseStoreChunk.actions.setIsLoading(false))
        }
    }
}

export function loadFilters() {
    return async (dispatch: DispatchFun) => {
        try {
            const { filters } = await apiRequest(courseContracts.filterOptions)
            dispatch(courseBrowseStoreChunk.actions.setFilters(filters))
        } catch (error) {
            console.error('COURSES LOAD FILTERS', error)
            dispatch(courseBrowseStoreChunk.actions.setFilters(null))
        }
    }
}

export function loadCourses(chunk: TCourseListDynamicStoreChunk, isFavorites = false) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const isAuthorized = getIsAuthorized(getState())
            if (isFavorites && !isAuthorized) return

            dispatch(chunk.actions.setIsLoading(true))
            const params = toCourseSearchParams(chunk.props.getSelectedFilters(getState()), 1)
            const { data, pagination } = await requestCourseList(isFavorites, params)

            dispatch(chunk.actions.setIsLoading(false))
            dispatch(courseBrowseStoreChunk.actions.setFilters(data.filters))
            dispatch(chunk.actions.setCourses(data.courses))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            console.log('COURSES LOAD', error)
            dispatch(chunk.actions.setIsLoading(false))
            dispatch(chunk.actions.setCourses([]))
        }
    }
}

export function loadMoreCourses(chunk: TCourseListDynamicStoreChunk, isFavorites = false) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const isAuthorized = getIsAuthorized(getState())
            if (isFavorites && !isAuthorized) return

            const page = chunk.props.getCurrentPage(getState())
            const totalPages = chunk.props.getTotalPages(getState())

            if (page >= totalPages) return

            const params = toCourseSearchParams(
                chunk.props.getSelectedFilters(getState()),
                page + 1,
            )
            const { data, pagination } = await requestCourseList(isFavorites, params)

            dispatch(chunk.actions.appendCourses(data.courses))
            dispatch(chunk.actions.setPagination(pagination))
        } catch (error) {
            console.error('COURSES LOAD', error)
        }
    }
}

export function loadCourseInfo(
    chunk: TCourseDetailsDynamicStoreChunk,
    usage: 'online' | 'offline',
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const id = chunk.props.getCourseId(getState())
            dispatch(chunk.actions.setIsLoadingCourseInfo(true))

            const courseInfo = await apiRequest(courseContracts.info, { params: { id, usage } })
            const units = courseInfo.units.map((item: TUnit) => {
                const lessons: TLesson[] = []

                // eslint-disable-next-line no-restricted-syntax
                for (const lessonId of item.lesson_position) {
                    const lesson = courseInfo.lessons.find((item: TLesson) => item.id === lessonId)
                    if (lesson) lessons.push(lesson)
                }

                return { id: item.tracking_id, name: item.name, lessons }
            })
            const firstLessonId = units[0]?.lessons[0]?.id
            const firstMaterial = courseInfo.materials.find(
                (item: TMaterial) => item.lesson_id === firstLessonId,
            )

            dispatch(chunk.actions.setUnits(units))
            dispatch(chunk.actions.setCourseInfo(courseInfo))
            dispatch(courseBrowseStoreChunk.actions.setAnalyticsOnlyVisibleCourseInfo(courseInfo))
            if (firstMaterial) dispatch(loadCourseContent(chunk, firstMaterial.id))
        } catch (error) {
            console.error('COURSE INFO', error)
            dispatch(chunk.actions.setCourseInfo(null))
        } finally {
            dispatch(chunk.actions.setIsLoadingCourseInfo(false))
        }
    }
}

export function loadCourseContent(chunk: TCourseDetailsDynamicStoreChunk, material_id: string) {
    return async (dispatch: DispatchFun) => {
        try {
            const { url } = await apiRequest(courseContracts.content, { params: { material_id } })
            dispatch(chunk.actions.setContent(url))
        } catch (error) {
            console.error('COURSE MATERIAL', error)
            if (!isResponse(error) || error.status !== 500) {
                dispatch(chunk.actions.setContent(null))
            }
        }
    }
}

export function loadCourseAdditionalContent(
    chunk: TCourseDetailsDynamicStoreChunk,
    material: TMaterial,
    index: number,
) {
    return async (dispatch: DispatchFun) => {
        try {
            dispatch(chunk.actions.setIsMaterialsLoading(true))
            dispatch(chunk.actions.setLoadingMaterialIndex(index))
            dispatch(chunk.actions.setMaterialProgress('0%'))

            const content = await apiRequest(courseContracts.content, {
                params: { material_id: material.id },
            })

            const download = await RNFetchBlob.config({
                path: `${RNFetchBlob.fs.dirs.CacheDir}/${material.name}`,
            })
                .fetch('GET', content.url)
                .progress({ count: 1 }, (received: number, total: number) => {
                    dispatch(
                        chunk.actions.setMaterialProgress(
                            `${Math.round((received / total) * 100)}%`,
                        ),
                    )
                })

            dispatch(chunk.actions.setLoadingMaterialIndex(-1))

            const sourceUri = `${isAndroid ? 'file://' : ''}${download.path()}`
            const { path } = await RNFS.stat(sourceUri)
            const name = path.split('/').at(-1)

            if (isAndroid) {
                const { SaveDocumentModule } = NativeModules
                await SaveDocumentModule.saveDocuments([sourceUri])
                return
            }

            const options = {
                url: sourceUri,
                title: name,
                saveToFiles: true,
                failOnCancel: false,
            }
            await RNShare.open(options)
        } catch (error) {
            console.error('COURSE LOAD ALL ADDITIONAL CONTENT', error)
        } finally {
            dispatch(chunk.actions.setIsMaterialsLoading(false))
        }
    }
}

export function loadCourseAllAdditionalContent(
    chunk: TCourseDetailsDynamicStoreChunk,
    materials: TMaterial[],
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const urls: string[] = []
            const courseInfo = chunk.props.getCourseInfo(getState())

            dispatch(chunk.actions.setIsMaterialsLoading(true))

            for (let i = 0; i < materials?.length; i++) {
                dispatch(chunk.actions.setLoadingMaterialIndex(i))
                dispatch(chunk.actions.setMaterialProgress('0%'))
                const material = materials[i]
                // eslint-disable-next-line no-await-in-loop
                const content = await apiRequest(courseContracts.content, {
                    params: { material_id: material.id },
                })
                // eslint-disable-next-line no-await-in-loop
                const download = await RNFetchBlob.config({
                    path: `${RNFetchBlob.fs.dirs.CacheDir}/${material.name}`,
                })
                    .fetch('GET', content.url)
                    .progress({ count: 1 }, (received: number, total: number) => {
                        dispatch(
                            chunk.actions.setMaterialProgress(
                                `${Math.round((received / total) * 100)}%`,
                            ),
                        )
                    })
                urls.push(`${isAndroid ? 'file://' : ''}${download.path()}`)

                const lessonIndex = courseInfo?.lessons.findIndex(
                    (item: TLesson) => item.id === material.lesson_id,
                )

                if (courseInfo && lessonIndex && lessonIndex !== -1) {
                    const unit = courseInfo.units.find((item: TUnit) =>
                        item.lesson_position.includes(courseInfo.lessons[lessonIndex].id),
                    )
                    reportEvent(MetricaEvents.COURSE_MATERIAL_DOWNLOAD, {
                        content_index: courseInfo.lessons[lessonIndex].order,
                        lesson_id: courseInfo.lessons[lessonIndex].tracking_id,
                        content_id: material.tracking_id,
                        content_type: material.type,
                        content_placement: material.placement,
                        course_id: courseInfo.course.tracking_id,
                        unit_id: unit?.tracking_id,
                        ...courseInfo.tracking,
                        ...material.tracking,
                    })
                }
            }
            dispatch(chunk.actions.setLoadingMaterialIndex(-1))

            if (isAndroid) {
                const { SaveDocumentModule } = NativeModules
                await SaveDocumentModule.saveDocuments(urls)
                return
            }

            const options = {
                urls,
                title: translate('native.courses.materials'),
                saveToFiles: true,
                failOnCancel: false,
            }
            await RNShare.open(options)
        } catch (error) {
            console.error('COURSE LOAD ALL ADDITIONAL CONTENT', error)
        } finally {
            dispatch(chunk.actions.setIsMaterialsLoading(false))
        }
    }
}

export function addCourseToFavorites(course_id: string) {
    return async () => {
        try {
            await ensureNetwork()
            await apiRequest(courseContracts.addFavorite, { payload: { course_id } })
        } catch (error) {
            console.error('LIKE COURSE', error)
        }
    }
}

export function removeCourseFromFavorites(course_id: string) {
    return async () => {
        try {
            await ensureNetwork()
            await apiRequest(courseContracts.removeFavorite, { params: { course_id } })
        } catch (error) {
            console.error('COURSE REMOVE FROM FAVORITES', error)
        }
    }
}

export function loadComments(chunk: TCourseDetailsDynamicStoreChunk) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const courseId = chunk.props.getCourseId(getState())
            const response = await apiRequest(courseContracts.comments, {
                params: { course_id: courseId, page: 1 },
            })

            const comments = response.comments.filter(item => !item.parent_id)
            const commentsThreads: { [key: string]: typeof comments } = {}

            response.comments
                .filter(item => item.parent_id)
                .forEach(item => {
                    commentsThreads[item.parent_id] = [
                        ...(commentsThreads[item.parent_id] || []),
                        item,
                    ]
                })

            dispatch(chunk.actions.setComments(comments))
            dispatch(chunk.actions.setCommentsThreads(commentsThreads))
        } catch (error) {
            console.error('COURSE LOAD COMMENTS', error)
            dispatch(chunk.actions.setComments([]))
            dispatch(chunk.actions.setCommentsThreads({}))
        }
    }
}

export function sendComment(
    chunk: TCourseDetailsDynamicStoreChunk,
    body: string,
    parent_id: number,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const courseId = chunk.props.getCourseId(getState())
            await apiRequest(courseContracts.addComment, {
                payload: { course_id: courseId, body: sanitizeCommentBody(body), parent_id },
            })
            await dispatch(loadComments(chunk))
        } catch (error) {
            console.error('COURSE SEND COMMENT', error)
        }
    }
}

export function deleteComment(chunk: TCourseDetailsDynamicStoreChunk, comment_id: number) {
    return async (dispatch: (...args: Array<any>) => void, getState: GetStateFun) => {
        try {
            const courseInfo = chunk.props.getCourseInfo(getState())
            await apiRequest(courseContracts.removeComment, { params: { comment_id } })
            if (courseInfo) dispatch(loadComments(chunk))
        } catch (error) {
            console.error('COURSE DELETE COMMENT', error)
        }
    }
}

export function startProgress(
    chunk: TCourseDetailsDynamicStoreChunk,
    material_id: string,
    lesson_id: string,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isAuthorized = getIsAuthorized(getState())
        if (!isAuthorized) return
        try {
            await apiRequest(courseContracts.startProgress, { payload: { material_id } })
            dispatch(chunk.actions.setLessonProgress({ lesson_id, status: 1, duration: 0 }))
        } catch (error) {
            console.error('COURSE START PROGRESS', error)
        }
    }
}

const getCompletedLessons = (progress: TProgress[] | undefined) => {
    let completedLessons = 0

    if (progress) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of progress) {
            if (item.status === 2) {
                completedLessons++
            }
        }
    }

    return completedLessons
}

export function updateCourseProgress(
    chunk: TCourseDetailsDynamicStoreChunk,
    material_id: string,
    duration: number,
    lesson: TLesson,
    contentId: number,
    showRateModal: (
        feedbackParams: {
            lessonId: number
            contentId: number
            source: string
        },
        feedbackStep: number,
        userRating: number,
    ) => void,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        const isAuthorized = getIsAuthorized(getState())
        if (!isAuthorized) return
        try {
            const courseInfo = chunk.props.getCourseInfo(getState())
            const previousCompletedLessons = getCompletedLessons(courseInfo?.progress)

            await apiRequest(courseContracts.updateProgress, { payload: { material_id, duration } })

            const lessonProgress = courseInfo?.progress.find(
                (item: TProgress) => item.lesson_id === lesson.id,
            )

            if (lessonProgress?.status !== 2) {
                const percents = Math.floor((duration / lesson.duration) * 100)

                if (percents >= 90) {
                    dispatch(
                        chunk.actions.updateLessonProgress({
                            lesson_id: lesson.id,
                            status: 2,
                            duration,
                        }),
                    )

                    const courseInfo = chunk.props.getCourseInfo(getState())
                    const lessonsCount = courseInfo?.course?.lesson_count

                    const completedLessons = getCompletedLessons(courseInfo?.progress)

                    const sentFeedback = coursesStorage.get(`sentFeedback-${courseInfo?.course.id}`)

                    if (lessonsCount && sentFeedback !== 'true') {
                        const isComplete =
                            previousCompletedLessons < lessonsCount &&
                            completedLessons === lessonsCount

                        if (completedLessons === 3 || isComplete) {
                            showRateModal(
                                {
                                    lessonId: lesson.tracking_id,
                                    contentId,
                                    source: isComplete ? 'course complete' : '3rd lesson complete',
                                },
                                isComplete ? 0 : 1,
                                0,
                            )
                        }
                    }
                }
            }
        } catch (error) {
            console.error('COURSE START PROGRESS', error)
        }
    }
}

export function tryRateCourse(
    chunk: TCourseDetailsDynamicStoreChunk,
    rating: number,
    courseTrackingId: number,
    lessonId: number,
    contentId: number,
    showRateModal: (
        feedbackParams: {
            lessonId: number
            contentId: number
            source: string
        },
        feedbackStep: number,
        userRating: number,
    ) => void,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const id = chunk.props.getCourseId(getState())
            await apiRequest(courseContracts.rate, { payload: { id, rating } })

            dispatch(chunk.actions.setUserRating(rating))
            reportEvent(MetricaEvents.COURSE_RATING, { course_id: courseTrackingId })

            const sentFeedback = coursesStorage.get(`sentFeedback-${id}`)
            if (sentFeedback !== 'true') {
                showRateModal({ lessonId, contentId, source: 'rating click' }, 1, rating - 1)
            } else {
                await apiRequest(courseContracts.rate, { payload: { id, rating } })
                dispatch(chunk.actions.setUserRating(rating))
            }
        } catch (error) {
            if (isResponse(error)) {
                if (error.status === 422) {
                    showAlertNotification({ text: translate('native.courses.voted.error') })
                }
            }
            console.error('COURSE RATE COURSE', error)
        }
    }
}

export function sendFeedback(
    chunk: TCourseDetailsDynamicStoreChunk,
    params: TFeedbackParams,
    setStep: (step: 0 | 1 | 2) => void,
) {
    return async (dispatch: DispatchFun, getState: GetStateFun) => {
        try {
            const courseId = chunk.props.getCourseId(getState())
            const courseInfo = chunk.props.getCourseInfo(getState())
            const courseTrackingId = courseInfo?.course.tracking_id

            await apiRequest(courseContracts.rate, {
                payload: { id: courseId, rating: params.rating },
            })

            dispatch(chunk.actions.setUserRating(params.rating))

            const { contentId, lessonId, source } = params.feedbackParams
            await apiRequest(courseContracts.sendFeedback, {
                payload: {
                    course_id: courseTrackingId,
                    lesson_id: lessonId,
                    content_id: contentId,
                    source,
                    rating: params.rating,
                    feedback_like: params.feedback_like,
                    feedback_suggest: params.feedback_suggest,
                },
            })

            setStep(1)
            coursesStorage.set(`sentFeedback-${courseId}`, 'true')
        } catch (error) {
            if (isResponse(error)) {
                if (error.status === 422) {
                    showAlertNotification({ text: translate('native.courses.voted.error') })
                }
            }
            console.log('FEEDBACK ERROR', error)
        }
    }
}
