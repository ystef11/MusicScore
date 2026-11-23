import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
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
import { NavigationService, Screen } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import type { TCourse, TFilter } from '../../../../App/Courses/coursesTypes'
import reportEvent from '../../../../App/Utils/Analytics'

type TProps = {
    course: TCourse
    blockName?: string
    position?: number
}

const CARD_WIDTH = 232
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * (130 / 232))

export const CourseCard = memo(({ course, blockName, position }: TProps) => {
    const [filters] = useValues([courseBrowseStoreChunk.props.getFilters])

    const handlePress = () => {
        const { id, level, tracking_id } = course
        const levelName = filters?.level?.find((item: TFilter) => +item.id === level)?.name

        reportEvent(MetricaEvents.COURSE_CLICK, {
            course_id: tracking_id,
            block_name: blockName,
            position,
        })
        reportEvent(MetricaEvents.COURSE_OPEN, { type: levelName })

        NavigationService.navigate(Screen.courseMain, {
            courseId: id,
            trackingId: tracking_id,
        })
    }

    return (
        <CommonTouchable
            testID={coursesTestIds.courseListItem}
            onPress={handlePress}
            style={styles.container}
        >
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
            <AppText
                testID={coursesTestIds.courseListItemTitle}
                font="f15w500"
                numberOfLines={1}
                ellipsizeMode="tail"
                rawText={course.name}
                style={styles.title}
            />
            <View style={styles.infoRow}>
                <Icon source={star} size={16} tint={brandColors.contentPrimary} />
                <AppText font="f15w400" rawText={course.rating.rating.toFixed(1)} />
                <AppText font="f15w400" brandColor="contentSecondary" rawText="·" />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.new_concept.learn.course_hours_short', {
                        count: String(Math.round(course.duration / 3600)),
                    })}
                />
                <AppText font="f15w400" brandColor="contentSecondary" rawText="·" />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    numberOfLines={1}
                    rawText={translate('native.new_concept.learn.lessons_count', {
                        count: String(course.lesson_count),
                    })}
                />
            </View>
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
    },
    imageWrapper: {
        width: CARD_WIDTH,
        height: IMAGE_HEIGHT,
        borderRadius: 1,
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
