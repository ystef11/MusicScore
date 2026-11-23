import { Image, StyleSheet, View } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { platform, useDimensions } from '@mu-native/common'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { AppText, BadgeComplexity, colors, CommonTouchable, globalStyles } from '@mu-native/ds'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useI18n } from '@muse/i18n'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import type { TCourse, TFilter } from '../../coursesTypes'

type Props = {
    course: TCourse
    isEditorPicks?: boolean
}

export const CourseListItem = ({ course, isEditorPicks }: Props) => {
    const { t } = useI18n()
    const dimensions = useDimensions('window')
    const [filters] = useValues([courseBrowseStoreChunk.props.getFilters])

    const handleItemPress = () => {
        const { id, level, tracking_id } = course
        const levelName = filters?.level?.find((item: TFilter) => +item.id === level)?.name
        reportEvent(MetricaEvents.COURSE_CLICK, { course_id: tracking_id })
        reportEvent(MetricaEvents.COURSE_OPEN, { type: levelName })

        NavigationService.navigate(Screen.courseMain, {
            courseId: id,
            trackingId: tracking_id,
            isEditorPicks,
        })
    }

    const { name, level, duration, lesson_count, preview_link } = course

    const width = dimensions.width - (platform.isTablet ? 64 : 20) * 2
    const imageHeight = width * (9 / 16)

    return (
        <CommonTouchable
            style={styles.container}
            onPress={handleItemPress}
            testID={coursesTestIds.courseListItem}
        >
            <View style={[styles.imageContainer, { width, height: imageHeight }]}>
                <Image
                    source={{ uri: preview_link }}
                    style={[styles.image, { width, height: imageHeight }]}
                    resizeMode="cover"
                />
                <View style={styles.complexityWrapper}>
                    <BadgeComplexity complexity={level as 1 | 2 | 3 | 4} />
                </View>
            </View>
            <View style={[styles.contentContainer, { maxWidth: width }]}>
                <AppText
                    testID={coursesTestIds.courseListItemTitle}
                    brandColor="contentPrimary"
                    rawText={name}
                    style={globalStyles.flex1}
                    font="f15w500"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                />

                <AppText
                    style={styles.infoText}
                    font="f15w400"
                    brandColor="contentSecondary"
                    rawText={t('native.courses.card.hours_lessons', {
                        hours: Math.round(duration / 3600),
                        lessons: lesson_count,
                    })}
                />
            </View>
        </CommonTouchable>
    )
}

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 8,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    complexityWrapper: {
        position: 'absolute',
        left: 8,
        bottom: 8,
    },

    image: {
        position: 'absolute',
        overflow: 'hidden',
    },

    contentContainer: {
        marginTop: 8,
        flex: 1,
        justifyContent: 'space-between',
    },
    infoText: {
        fontSize: 12,
        lineHeight: 16,
        color: colors.gray500,
        marginRight: 4,
    },
})
