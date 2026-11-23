import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { CarouselListTitle, layout } from '@mu-native/ds'
import { localizeCoursesSectionTitle } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import { isTablet } from '../../../Utils/Platform'
import type { TCourse, TSection } from '../../coursesTypes'
import { CoursesCarouselItem } from '../carouselItem/CoursesCarouselItem'

interface IListItem extends ListRenderItemInfo<TCourse> {
    item: TCourse
}
const keyExtractor = (item: TCourse) => item.id

const CoursesCarousel = ({ section }: { section: TSection }) => {
    const navigateToSearchCourses = () => {
        const { title, view_all_data } = section
        reportEvent(MetricaEvents.COURSES_ALL_CLICK, { screen: Screen.coursesMain })

        let filters = {}

        Object.entries(view_all_data ?? {}).forEach(([key, value]) => {
            filters = { ...filters, [key]: value.split(',') }
        })
        NavigationService.navigate(Screen.searchCourses, {
            title: localizeCoursesSectionTitle(section.title),
            filters,
        })
        reportEvent(MetricaEvents.COURSES_VIEW_ALL_OPEN, { type: title })
    }
    const { title, data, view_all_data } = section

    const renderItem = ({ item }: IListItem) => (
        <CoursesCarouselItem
            isEditorPicks={title.toLowerCase() === "editor's picks"}
            course={item}
        />
    )

    return (
        <View style={styles.container}>
            <CarouselListTitle
                text={localizeCoursesSectionTitle(section.title)}
                onPress={navigateToSearchCourses}
                style={styles.titleContainer}
            />
            <FlatList
                data={
                    isTablet || title.toLowerCase() === 'continue studying'
                        ? data
                        : data.slice(0, 3)
                }
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                contentContainerStyle={styles.carousel}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    )
}

export default CoursesCarousel

export const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: layout.baseMarginFromEdges - 6,
        marginBottom: 12,
        alignItems: 'center',
    },
    carousel: {
        paddingHorizontal: layout.baseMarginFromEdges - 6,
        paddingBottom: 10,
        gap: 12,
    },
})
