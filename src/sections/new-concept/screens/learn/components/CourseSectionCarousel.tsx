import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { layout, SectionHeader } from '@mu-native/ds'

import type { TCourse } from '../../../../../App/Courses/coursesTypes'

import { CourseCard } from './CourseCard'

type TProps = {
    title: string
    courses: TCourse[]
    onCoursePress: (course: TCourse) => void
    onViewAllPress?: () => void
}

const keyExtractor = (item: TCourse) => item.id

export const CourseSectionCarousel = ({
    title,
    courses,
    onCoursePress,
    onViewAllPress,
}: TProps) => {
    const renderItem = ({ item }: ListRenderItemInfo<TCourse>) => (
        <CourseCard course={item} onPress={onCoursePress} />
    )

    if (!courses.length) return null

    return (
        <View style={styles.container}>
            <SectionHeader title={title} onViewAllPress={onViewAllPress} style={styles.header} />
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={courses}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.list}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginLg,
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
