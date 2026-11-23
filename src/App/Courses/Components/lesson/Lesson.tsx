import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { useCourseDetailsContext } from '@mu-native/course-details'
import { AppText, brandColors, CommonTouchable, globalStyles, Icon } from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { lock } from '@mu-native/icons/lock'
import { playing } from '@mu-native/icons/playing'
import { useValues } from '@ug/store'

import type { TLesson, TProgress } from '../../coursesTypes'

type TProps = {
    unitIndex: number
    lesson: TLesson
    index: number
    isActive: boolean
    onPress: (unitIndex: number, index: number, isAvailable: boolean) => void
    noMarginLeft?: boolean
}

const Lesson = ({
    unitIndex,
    lesson,
    index,
    isActive,
    onPress,
    noMarginLeft,
}: TProps): React.ReactElement => {
    const courseDetailsChunk = useCourseDetailsContext()

    const [courseInfo] = useValues([courseDetailsChunk.props.getCourseInfo])
    const progress = courseInfo?.progress ?? []
    const hasAccess = courseInfo?.has_access ?? false

    const getDuration = useMemo(() => {
        const { duration } = lesson
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)

        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }, [lesson])
    const lessonProgress = progress.find((item: TProgress) => item.lesson_id === lesson.id)
    const isAvailable = lesson.name.toLocaleLowerCase().includes('intro') || hasAccess

    const onPressLesson = () => onPress(unitIndex, index, isAvailable)

    const renderIcon = () => {
        if (!isAvailable) return <Icon source={lock} />
        if (isActive || lessonProgress?.status === 2) {
            return <Icon source={isActive ? playing : checkmarkCircle} />
        }
        return <View style={styles.circle} />
    }

    return (
        <CommonTouchable
            style={StyleSheet.flatten([styles.container, noMarginLeft ? { marginLeft: 0 } : {}])}
            onPress={onPressLesson}
        >
            <View style={styles.titleContainer}>
                {renderIcon()}
                <AppText
                    font="f15w400"
                    numberOfLines={1}
                    style={globalStyles.flexShrink}
                    rawText={lesson.name}
                />
            </View>
            <AppText
                font="f15w400"
                brandColor="contentSecondary"
                rawText={getDuration}
                style={styles.ms8}
            />
        </CommonTouchable>
    )
}

export default React.memo(Lesson)

const styles = StyleSheet.create({
    container: {
        height: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 29,
        marginBottom: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },

    circle: {
        width: 20,
        height: 20,
        borderRadius: 100,
        backgroundColor: brandColors.colorBackgroundDisabled,
    },

    ms8: {
        marginStart: 8,
    },
})
