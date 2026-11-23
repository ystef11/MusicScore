import { StyleSheet, View } from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { AppText, BadgeComplexity, CommonTouchable, FastImage, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import type { TCourse, TFilter } from '../../coursesTypes'

type Props = {
    course: TCourse
    isEditorPicks?: boolean
    cardWidth?: number
    isGrid?: boolean
}

export const CoursesCarouselItem = ({
    course,
    isEditorPicks,
    cardWidth: width = 232,
    isGrid = false,
}: Props) => {
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

    const { level, name, duration, lesson_count, preview_link } = course

    const height = width * (9 / 16)

    return (
        <CommonTouchable
            testID={coursesTestIds.courseListItem}
            onPress={handleItemPress}
            style={isGrid ? { marginBottom: layout.marginMd } : undefined}
        >
            <View style={[styles.imageContainer, { width, height }]}>
                <FastImage
                    style={[styles.image, { width, height }]}
                    source={preview_link ? { uri: preview_link } : undefined}
                />
                <View style={styles.complexityWrapper}>
                    <BadgeComplexity complexity={level as 1 | 2 | 3 | 4} />
                </View>
            </View>
            <AppText
                testID={coursesTestIds.courseListItemTitle}
                brandColor="contentPrimary"
                rawText={name}
                style={[styles.title, { width }]}
                font="f15w500"
                numberOfLines={1}
                ellipsizeMode="tail"
            />
            <AppText
                style={styles.infoText}
                font="f15w400"
                brandColor="contentSecondary"
                rawText={translate('native.courses.card.hours_lessons', {
                    hours: Math.round(duration / 3600),
                    lessons: lesson_count,
                })}
            />
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        position: 'absolute',
    } as any,

    title: {
        flex: 1,
        marginTop: 8,
    },

    infoText: {
        marginTop: 2,
    },

    complexityWrapper: {
        position: 'absolute',
        left: 8,
        bottom: 8,
    },
})
