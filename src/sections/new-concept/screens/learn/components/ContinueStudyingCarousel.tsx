import { useMemo } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'

import { CourseRow } from './CourseRow'

const ROWS_PER_COLUMN = 2
// The card spans 80% of the viewport so the next column peeks, but never grows
// past 300px on wide screens/tablets where a full-width row would look sparse.
const MAX_CARD_WIDTH = 300
const CARD_WIDTH_RATIO = 0.8

type TProps = {
    /** Already ordered by the backend section: most recent interaction first. */
    courses: TCourse[]
    onCoursePress: (course: TCourse) => void
    onViewAllPress?: () => void
}

// Started courses as a sideways carousel of two stacked rows (mirroring the
// web layout) — a user can have many started courses, so they page horizontally.
export const ContinueStudyingCarousel = ({ courses, onCoursePress, onViewAllPress }: TProps) => {
    const { width } = useWindowDimensions()
    const cardWidth = Math.min(MAX_CARD_WIDTH, width * CARD_WIDTH_RATIO)

    const columns = useMemo(() => {
        const grouped: TCourse[][] = []
        for (let i = 0; i < courses.length; i += ROWS_PER_COLUMN) {
            grouped.push(courses.slice(i, i + ROWS_PER_COLUMN))
        }
        return grouped
    }, [courses])

    return (
        <View style={styles.container}>
            <SectionHeader
                title={translate('native.courses.my_courses')}
                onViewAllPress={onViewAllPress}
                style={styles.header}
            />
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + layout.marginMd}
                decelerationRate="fast"
                contentContainerStyle={styles.content}
            >
                {columns.map((columnCourses, columnIndex) => (
                    <View key={columnIndex} style={[styles.column, { width: cardWidth }]}>
                        {columnCourses.map(course => (
                            <CourseRow
                                key={course.id}
                                course={course}
                                onPress={onCoursePress}
                                showProgress
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
    },
    header: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: layout.marginXm,
    },
    content: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginMd,
    },
    column: {
        gap: layout.marginMd,
    },
})
