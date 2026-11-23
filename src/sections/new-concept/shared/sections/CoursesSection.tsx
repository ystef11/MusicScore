import { useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'
import { localizeCoursesSectionTitle, translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'

import type { TCourse } from '../../../../App/Courses/coursesTypes'
import { CourseCard } from '../components/CourseCard'
import { useFeaturedCourseSection } from '../hooks/useFeaturedCourseSection'

const FALLBACK_SECTION_TITLE = translate('native.new_concept.home.level_up_music_theory')
const MAX_COURSES = 6

const keyExtractor = (item: TCourse) => item.id

const renderItem = ({ item }: ListRenderItemInfo<TCourse>) => <CourseCard course={item} />

export const CoursesSection = () => {
    const featuredSection = useFeaturedCourseSection()

    const onViewAllPress = useCallback(() => {
        if (!featuredSection) return
        const { view_all_data, title } = featuredSection
        let filters: Record<string, string[]> = {}
        Object.entries(view_all_data ?? {}).forEach(([key, value]) => {
            filters = { ...filters, [key]: value.split(',') }
        })
        NavigationService.navigate(Screen.learnSearchCourses, {
            title: localizeCoursesSectionTitle(title),
            filters,
        })
    }, [featuredSection])

    if (!featuredSection || !featuredSection.data?.length) return null

    const sectionTitle =
        localizeCoursesSectionTitle(featuredSection.title) ?? FALLBACK_SECTION_TITLE

    return (
        <View style={styles.container}>
            <SectionHeader
                title={sectionTitle}
                onViewAllPress={onViewAllPress}
                style={styles.header}
            />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={featuredSection.data.slice(0, MAX_COURSES)}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.list}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
    header: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: layout.marginXm,
    },
    list: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: layout.marginXm,
    },
})
