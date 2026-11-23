import { useCallback } from 'react'

import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { TCourse, TFilter } from '../../../../../App/Courses/coursesTypes'
import reportEvent from '../../../../../App/Utils/Analytics'

export type TOpenCourseAnalytics = {
    blockName?: string
    position?: number
}

// Mirrors the legacy CoursesCarouselItem press handler so analytics + navigation
// stay identical between the control and new-concept variants.
export const useOpenCourse = () => {
    const [filters] = useValues([courseBrowseStoreChunk.props.getFilters])

    return useCallback(
        (course: TCourse, analytics?: TOpenCourseAnalytics) => {
            const levelName = filters?.level?.find(
                (item: TFilter) => +item.id === course.level,
            )?.name

            reportEvent(MetricaEvents.COURSE_CLICK, {
                course_id: course.tracking_id,
                block_name: analytics?.blockName,
                position: analytics?.position,
            })
            reportEvent(MetricaEvents.COURSE_OPEN, { type: levelName })

            NavigationService.navigate(Screen.courseMain, {
                courseId: course.id,
                trackingId: course.tracking_id,
            })
        },
        [filters],
    )
}
