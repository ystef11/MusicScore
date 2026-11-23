import { memo, useState, useEffect } from 'react'
import { ListRenderItemInfo, RefreshControl, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native'
import Animated from 'react-native-reanimated'

import { TCourseListDynamicStoreChunk } from '@mu-native/course-list'
import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { layout, useScrollableHeader, useTopBarScrollHandler } from '@mu-native/ds'
import { useValues } from '@ug/store'

import { COLOR_LINK } from '../../constants/styles'
import { isTablet } from '../../Utils/Platform.ts'
import { CoursesCarouselItem } from '../Components/carouselItem/CoursesCarouselItem.tsx'
import { CourseListItem } from '../Components/listItem/CourseListItem.tsx'
import type { TCourse } from '../coursesTypes.ts'
import { NewCoursesEmptyList } from '../NewCoursesEmptyList.tsx'

interface IListItem extends ListRenderItemInfo<TCourse> {
    item: TCourse
}

const courseKeyExtractor = (item: TCourse) => item.id

export const CourseList = memo(
    ({
        storeChunk,
        onRefresh,
        onLoadMore,
        isEmpty = false,
    }: {
        storeChunk: TCourseListDynamicStoreChunk
        onRefresh: () => void
        onLoadMore: (storeChunk: TCourseListDynamicStoreChunk) => void
        isEmpty?: boolean
    }) => {
        const [courses, isLoading] = useValues([
            storeChunk.props.getCourses,
            storeChunk.props.getIsLoading,
        ])

        const scrollHandler = useTopBarScrollHandler()
        const { contentPaddingTop } = useScrollableHeader()

        const { width: windowWidth } = useWindowDimensions()

        // Calculate number of columns based on orientation
        const [numColumns, setNumColumns] = useState(isTablet ? (windowWidth > 900 ? 3 : 2) : 1)

        useEffect(() => {
            if (isTablet) {
                // Portrait: 2 columns, Landscape: 3 columns
                setNumColumns(windowWidth > 900 ? 3 : 2)
            }
        }, [windowWidth])

        const renderCourse = ({ item }: IListItem) => {
            if (isTablet) {
                // Calculate card width based on available space and number of columns
                const horizontalPadding = layout.baseMarginFromEdges * 2
                const columnGap = layout.marginMd
                const totalGaps = (numColumns - 1) * columnGap
                const availableWidth = windowWidth - horizontalPadding - totalGaps
                const cardWidth = availableWidth / numColumns

                return <CoursesCarouselItem course={item} cardWidth={cardWidth} isGrid />
            }
            return <CourseListItem course={item} />
        }

        const handleLoadMore = () => {
            onLoadMore(storeChunk)
        }

        if (isEmpty) {
            return <NewCoursesEmptyList />
        }

        return (
            <Animated.FlatList
                testID={coursesTestIds.courseList}
                key={isTablet ? `tablet${numColumns}` : 'mobile1'}
                data={courses}
                contentContainerStyle={[
                    isTablet ? styles.contentListTablet : styles.contentList,
                    { paddingTop: contentPaddingTop + 12 },
                ]}
                columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                onEndReached={handleLoadMore}
                renderItem={renderCourse}
                keyExtractor={courseKeyExtractor}
                numColumns={numColumns}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor={COLOR_LINK}
                        colors={[COLOR_LINK]}
                        progressViewOffset={contentPaddingTop}
                    />
                }
            />
        )
    },
)

const styles = StyleSheet.create({
    contentList: {
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    contentListTablet: {
        paddingBottom: 12,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    columnWrapper: {
        gap: layout.marginMd,
        justifyContent: 'flex-start',
    },
})
