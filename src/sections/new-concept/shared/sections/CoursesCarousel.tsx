import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'

import type { TCourse } from '../../../../App/Courses/coursesTypes'
import { CourseCard } from '../components/CourseCard'

const MAX_COURSES = 6

const keyExtractor = (item: TCourse) => item.id

type TProps = {
    title: string
    courses: TCourse[]
    onViewAllPress?: () => void
}

/** Presentational course carousel — data comes from a screen controller (§3/§5). */
export const CoursesCarousel = ({ title, courses, onViewAllPress }: TProps) => {
    if (!courses.length) return null

    const renderItem = ({ item, index }: ListRenderItemInfo<TCourse>) => (
        <CourseCard course={item} blockName={title} position={index} />
    )

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onViewAllPress={onViewAllPress} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={courses.slice(0, MAX_COURSES)}
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
