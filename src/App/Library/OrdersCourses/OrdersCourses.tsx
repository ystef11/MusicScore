import React from 'react'
import { StyleSheet, View } from 'react-native'

import {
    CourseListContext,
    createCourseListDynamicStoreChunk,
    useCourseListContext,
} from '@mu-native/course-list'
import { colors, layoutHelpers, style, BaseEmptyStateView } from '@mu-native/ds'
import { learn } from '@mu-native/icons/learn'
import { translate } from '@mu-native/locale'
import { useNavigation } from '@mu-native/navigation'
import { FlashList } from '@shopify/flash-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import { NavHeader } from '../../Components/NavHeader/NavHeader'
import { CourseListItem } from '../../Courses/Components/listItem/CourseListItem'
import { TCourse } from '../../Courses/coursesTypes'
import { isTablet } from '../../Utils/Platform'

import { updateOrdersCoursesThunk } from './ordersCoursesThunks'

const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        backgroundColor: colors.white,
    }),
    listCoursesContainer: style.view({
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(90),
    }),
})

const keyExtractor = (item: TCourse) => item.id

const EmptyComponent = () => {
    return (
        <BaseEmptyStateView
            title={translate('native.courses.orders_empty_title')}
            description={translate('native.courses.orders_empty_subtitle')}
            icon={learn}
        />
    )
}

const ScreenOrders = ({ ...props }) => {
    const navigation = useNavigation()
    const courseListChunk = useCourseListContext()
    const { updateOrdersThunk } = useActions({
        updateOrdersThunk: updateOrdersCoursesThunk,
    })
    const [ordersCourses, isLoading] = useValues([
        courseListChunk.props.getCourses,
        courseListChunk.props.getIsLoading,
    ])

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader {...props} headerTitle={translate('native.myCourses')} noNotifications />
            ),
        })
    }, [])

    const onRefresh = () => {
        updateOrdersThunk(courseListChunk)
    }

    const renderItem = ({ item }: { item: TCourse }) => <CourseListItem course={item} />

    if (ordersCourses.length === 0) {
        return <EmptyComponent />
    }

    return (
        <View style={styles.container}>
            {isTablet ? (
                <FlashList
                    contentContainerStyle={styles.listCoursesContainer}
                    key="tablet4"
                    data={ordersCourses}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={2}
                    onRefresh={onRefresh}
                    refreshing={isLoading}
                />
            ) : (
                <FlashList
                    contentContainerStyle={styles.listCoursesContainer}
                    key="mobile1"
                    data={ordersCourses}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={1}
                    onRefresh={onRefresh}
                    refreshing={isLoading}
                />
            )}
        </View>
    )
}

const ScreenOrdersFunc = () => {
    const { chunk } = useInjectDynamicStoreChunk('order_courses', key =>
        createCourseListDynamicStoreChunk(key),
    )
    return (
        <CourseListContext.Provider value={chunk}>
            <ScreenOrders />
        </CourseListContext.Provider>
    )
}

export default ScreenOrdersFunc
