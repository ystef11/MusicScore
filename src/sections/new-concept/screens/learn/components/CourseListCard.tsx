import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    AppText,
    BadgeComplexity,
    brandColors,
    CommonTouchable,
    FastImage,
    Icon,
    layout,
} from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'
import { formatCourseHours } from '../helpers/courseProgress'

type TProps = {
    course: TCourse
    onPress: (course: TCourse) => void
    testID?: string
}

export const CourseListCard = memo(({ course, onPress, testID }: TProps) => (
    <CommonTouchable onPress={() => onPress(course)} style={styles.container} testID={testID}>
        <View style={styles.imageWrapper}>
            <FastImage
                style={styles.image}
                source={course.preview_link ? { uri: course.preview_link } : undefined}
                resizeMode="cover"
            />
            <View style={styles.badge}>
                <BadgeComplexity complexity={course.level as 1 | 2 | 3 | 4} />
            </View>
        </View>
        <AppText font="f15w500" numberOfLines={2} rawText={course.name} style={styles.title} />
        <View style={styles.infoRow}>
            <Icon source={star} size={16} tint={brandColors.contentPrimary} />
            <AppText font="f15w400" rawText={course.rating.rating.toFixed(1)} />
            <AppText font="f15w400" brandColor="contentSecondary" rawText="·" />
            <AppText
                font="f15w400"
                brandColor="contentSecondary"
                rawText={formatCourseHours(course)}
            />
            <AppText font="f15w400" brandColor="contentSecondary" rawText="·" />
            <AppText
                font="f15w400"
                brandColor="contentSecondary"
                numberOfLines={1}
                rawText={translate('native.new_concept.learn.lessons_count_plural', {
                    count: course.lesson_count,
                })}
            />
        </View>
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 350 / 196,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: brandColors.backgroundInactive,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        left: layout.marginSm,
        bottom: layout.marginSm,
    },
    title: {
        marginTop: layout.marginSm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXs,
        marginTop: 2,
    },
})
