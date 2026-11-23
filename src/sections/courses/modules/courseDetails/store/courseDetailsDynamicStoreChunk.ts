import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import {
    type TComment,
    type TCourseInfo,
    type TLesson,
    type TProgress,
} from '../../../../../App/Courses/coursesTypes'

type TCourseDetailsStoreChunkState = {
    courseId: string
    isLoadingCourseInfo: boolean
    courseInfo: TCourseInfo | null
    units: { id: number; name: string; lessons: TLesson[] }[]
    content: string | null
    isMaterialsLoading: boolean
    loadingMaterialIndex: number
    materialProgress: string
    comments: TComment[]
    commentsThreads: { [key: string]: TComment[] }
    userRating: number
    needShowFeedbackModal: boolean
}

export const createCourseDetailsDynamicStoreChunk = (key: string, courseId: string) => {
    return createExtendedStoreChunk<TCourseDetailsStoreChunkState>({
        treeKey: 'screens',
        storeKey: `course_details_${key}`,
    })({
        initialState: {
            courseId,
            isLoadingCourseInfo: false,
            courseInfo: null,
            units: [],
            content: null,
            isMaterialsLoading: false,
            loadingMaterialIndex: -1,
            materialProgress: '',
            comments: [],
            commentsThreads: {},
            userRating: -1,
            needShowFeedbackModal: false,
        },
        actions: {
            setLessonProgress: (lessonProgress: TProgress, state) => {
                if (!state.courseInfo) return state

                return {
                    courseInfo: {
                        ...state.courseInfo,
                        progress: [...(state.courseInfo?.progress || []), lessonProgress],
                    },
                }
            },
            updateLessonProgress: (lessonProgress, state) => {
                if (!state.courseInfo) return state

                const progress = [...(state.courseInfo.progress || [])]
                const index = progress.findIndex(
                    (item: TProgress) => item.lesson_id === lessonProgress.lesson_id,
                )
                progress.splice(index, 1, lessonProgress)

                return {
                    courseInfo: {
                        ...state.courseInfo,
                        progress,
                    },
                }
            },
            setUserRating: (userRating: number, state) => {
                if (!state.courseInfo) return state

                return {
                    courseInfo: {
                        ...state.courseInfo,
                        course: {
                            ...state.courseInfo.course,
                            rating: {
                                ...state.courseInfo.course.rating,
                                user_rating: userRating,
                            },
                        },
                    },
                }
            },
            toggleLikeCourse: (_: undefined, state) => {
                if (!state.courseInfo) return state

                return {
                    courseInfo: {
                        ...state.courseInfo,
                        course: {
                            ...state.courseInfo.course,
                            is_favorite: !state.courseInfo.course.is_favorite,
                        },
                    },
                }
            },
        },
    })
}

export type TCourseDetailsDynamicStoreChunk = ReturnType<
    typeof createCourseDetailsDynamicStoreChunk
>

export const CourseDetailsContext = createContext<
    ReturnType<TCourseDetailsDynamicStoreChunk> | undefined
>(undefined)

export function useCourseDetailsContext() {
    return useContext(CourseDetailsContext)! as TCourseDetailsDynamicStoreChunk
}
