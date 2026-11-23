import { translate } from '@mu-native/locale'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'

const clamp = (value: number, max = 1) => Math.min(max, Math.max(0, value))

// Redesign v2 (§2.2) sends `completed_lessons_count` for an exact "N / M" bar,
// clamped to [0, lesson_count]. Until the backend ships it, fall back to the old
// estimate from watched vs. total duration (same unit) and the total lesson count.
export const getCourseProgress = (course: TCourse) => {
    const total = course.lesson_count
    const completedLessons =
        course.completed_lessons_count != null
            ? clamp(course.completed_lessons_count, total)
            : Math.round(
                  (course.duration > 0 ? clamp(course.progress_duration / course.duration) : 0) *
                      total,
              )
    const ratio = total > 0 ? completedLessons / total : 0
    return { ratio, completedLessons }
}

export const formatLessonsProgress = (course: TCourse) => {
    const { completedLessons } = getCourseProgress(course)
    return translate('native.new_concept.learn.lessons_progress_plural', {
        completed: String(completedLessons),
        total: course.lesson_count,
    })
}

export const formatCourseHours = (course: TCourse) =>
    translate('native.new_concept.learn.course_hours_short_plural', {
        count: Math.round(course.duration / 3600),
    })
