import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, FastImage, layout } from '@mu-native/ds'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'
import { formatLessonsProgress, getCourseProgress } from '../helpers/courseProgress'

import { CourseProgressBar } from './CourseProgressBar'

type TProps = {
    course: TCourse
    onPress: (course: TCourse) => void
    showProgress?: boolean
    testID?: string
}

export const CourseRow = memo(({ course, onPress, showProgress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(course)} style={styles.container} testID={testID}>
        <View style={styles.row}>
            <FastImage
                style={styles.image}
                source={course.preview_link ? { uri: course.preview_link } : undefined}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <AppText font="f17w600" numberOfLines={2} rawText={course.name} />
                <AppText
                    font="f13w400"
                    brandColor="contentTertiary"
                    numberOfLines={1}
                    rawText={formatLessonsProgress(course)}
                    style={styles.subtitle}
                />
            </View>
        </View>
        {showProgress && <CourseProgressBar ratio={getCourseProgress(course).ratio} />}
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        gap: layout.marginSm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXm,
    },
    image: {
        width: 135,
        height: 74,
        borderRadius: 1,
        backgroundColor: brandColors.backgroundInactive,
    },
    info: {
        flex: 1,
        gap: layout.marginXs,
    },
    subtitle: {
        marginTop: 2,
    },
})
