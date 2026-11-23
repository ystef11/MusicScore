import { createContext, useContext } from 'react'

import { createExtendedStoreChunk } from '@ug/store'

import { TCourse } from '../../../../../App/Courses/coursesTypes'

type TCourseListStoreChunkState = {
    courses: TCourse[]
    isLoading: boolean
    currentPage: number
    totalPages: number
    totalItems: number
    selectedFilters: { [key: string]: string[] | string }
}

export const createCourseListDynamicStoreChunk = (key: string) => {
    return createExtendedStoreChunk<TCourseListStoreChunkState>({
        treeKey: 'screens',
        storeKey: `course_list_${key}`,
    })({
        initialState: {
            courses: [],
            isLoading: false,
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            selectedFilters: {},
        },
        actions: {
            appendCourses: (courses: TCourse[], state) => {
                return {
                    courses: [...state.courses, ...courses],
                }
            },
            setPagination: ({
                totalPages,
                currentPage,
                totalItems,
            }: Pick<TCourseListStoreChunkState, 'totalPages' | 'currentPage'> & {
                totalItems?: number
            }) => {
                return { totalPages, currentPage, ...(totalItems !== undefined && { totalItems }) }
            },
            setSearchText: (text: string, state) => {
                return {
                    selectedFilters: { ...state.selectedFilters, text },
                }
            },
            toggleCourseLike: (courseId: string, state) => {
                const courseIndex = state.courses.findIndex(course => course.id === courseId)

                if (courseIndex > -1) {
                    const course = state.courses[courseIndex]
                    const courses = state.courses.splice(courseIndex, 1, {
                        ...course,
                        is_favorite: !course.is_favorite,
                    })
                    return { courses }
                }

                return state
            },
        },
    })
}

export type TCourseListDynamicStoreChunk = ReturnType<typeof createCourseListDynamicStoreChunk>

export const CourseListContext = createContext<
    ReturnType<TCourseListDynamicStoreChunk> | undefined
>(undefined)

export function useCourseListContext() {
    return useContext(CourseListContext)! as TCourseListDynamicStoreChunk
}
