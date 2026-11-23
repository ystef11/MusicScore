import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import type { TLesson, TProgress } from '../../coursesTypes'
import Unit from '../Unit'

interface IProps {
    units: { name: string; lessons: TLesson[]; id: number }[]
    activeUnit: number
    expandedUnit: number
    activeLesson: number
    lessonsCount: number
    lessonsDuration: number
    progress: TProgress[]
    onUnitChange: (index: number, id: number) => void
    onLessonChange: (unitIndex: number, index: number, isAvailable: boolean) => void
}

const Lessons = ({
    units,
    activeUnit,
    expandedUnit,
    activeLesson,
    lessonsCount,
    lessonsDuration,
    progress,
    onUnitChange,
    onLessonChange,
}: IProps) => {
    useEffect(() => {
        reportEvent(MetricaEvents.COURSE_LESSONS_SHOW, {
            item: 'lesson',
            item_id: units[activeUnit].lessons[activeLesson].id,
        })
    }, [])

    const getLessonsCountWithDuration = () => {
        const hours = Math.floor(lessonsDuration / 3600)
        const minutes = Math.floor((lessonsDuration - hours * 3600) / 60)

        return hours
            ? translate('native.courses.lessons.count_hours_minutes', {
                  lessons: lessonsCount,
                  hours,
                  minutes,
              })
            : translate('native.courses.lessons.count_minutes', { lessons: lessonsCount, minutes })
    }

    const getCompletedLessons = () => {
        let completedLessons = 0
        console.log('PROGRESS', progress)
        // eslint-disable-next-line no-restricted-syntax
        for (const item of progress) {
            if (item.status === 2) {
                completedLessons++
            }
        }

        return completedLessons
    }

    const renderUnit = (item: { id: number; name: string; lessons: TLesson[] }, index: number) => (
        <Unit
            key={item.name}
            unit={item}
            isActive={index === activeUnit}
            isExpanded={index === expandedUnit}
            index={index}
            activeLesson={activeLesson}
            progress={progress}
            onUnitPress={onUnitChange}
            onLessonPress={onLessonChange}
        />
    )

    const renderUnits = () => {
        if (units?.length === 1) {
            const item = units[0]

            return (
                <Unit
                    unit={item}
                    isActive
                    isExpanded
                    index={0}
                    activeLesson={activeLesson}
                    progress={progress}
                    onUnitPress={onUnitChange}
                    onLessonPress={onLessonChange}
                    withoutDropdown
                />
            )
        }

        return <View style={styles.listContainer}>{units?.map(renderUnit)}</View>
    }

    const completedLessons = getCompletedLessons()
    const percents = Math.round((completedLessons / lessonsCount) * 100)

    return (
        <View style={styles.container}>
            <View style={styles.progressInfoContainer}>
                <AppText testID={coursesTestIds.courseDetails.lessonsContent} font="f15w400">
                    {translate('native.courses.overall_progress', {
                        percents: percents.toString(),
                    })}
                </AppText>
                <AppText font="f15w400" brandColor="contentSecondary">
                    {translate('native.courses.lessons.completed_of_count', {
                        completed: completedLessons.toString(),
                        count: lessonsCount,
                    })}
                </AppText>
            </View>
            <View style={styles.progressContainer}>
                <View style={[styles.progressLine, { width: `${percents}%` }]} />
            </View>
            <AppText
                font="f15w400"
                style={styles.textLessonsDuration}
                brandColor="contentSecondary"
            >
                {getLessonsCountWithDuration()}
            </AppText>
            {renderUnits()}
        </View>
    )
}

export default Lessons

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 60,
    },

    progressLine: {
        width: '0%',
        height: 4,
        backgroundColor: brandColors.contentPrimary,
    },
    textLessonsDuration: {
        marginTop: 26,
        marginBottom: 12,
    },
    progressInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    progressContainer: {
        width: '100%',
        height: 4,
        marginTop: 10,
        borderRadius: 100,
        marginBottom: 10,
        overflow: 'hidden',
        backgroundColor: brandColors.colorBackgroundDisabled,
    },
    listContainer: {
        marginTop: 10,
    },
})
