import { createExtendedStoreChunk } from '@ug/store'

import { TCourseInfo, TFilters, TSection } from '../../../../../App/Courses/coursesTypes'

type TCourseBrowseStoreChunkState = {
    sections: TSection[]
    filters: TFilters | null
    isLoading: boolean
    analyticsOnlyVisibleCourseInfo: TCourseInfo | null
}

export const courseBrowseStoreChunk = createExtendedStoreChunk<TCourseBrowseStoreChunkState>({
    treeKey: 'screens',
    storeKey: 'course_browse',
})({
    initialState: {
        sections: [],
        filters: null,
        isLoading: false,
        analyticsOnlyVisibleCourseInfo: null,
    },
    actions: {
        toggleLikeCourse: (courseId: string, state) => {
            const sectionIndex = state.sections.findIndex(
                section => !!section.data.find(course => course.id === courseId),
            )

            if (sectionIndex > -1) {
                const section = state.sections[sectionIndex]
                const courseIndex = section.data.findIndex(course => course.id === courseId)
                const course = section.data[courseIndex]
                const data = section.data.splice(courseIndex, 1, {
                    ...course,
                    is_favorite: !course.is_favorite,
                })
                const sections = state.sections.splice(sectionIndex, 1, { ...section, data })
                return { sections }
            }
            return state
        },
    },
})
