import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native'

import { coursesTestIds, libraryTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import {
    CourseListContext,
    createCourseListDynamicStoreChunk,
    useCourseListContext,
} from '@mu-native/course-list'
import {
    BaseEmptyStateView,
    BrandAppLoader,
    layout,
    NativeBottomSheet,
    NativeBottomSheetRef,
    style,
} from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import {
    navigationThunks,
    Screen,
    useAppNavigation,
    useAppRoute,
    useNavHeader,
} from '@mu-native/navigation'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import debounce from 'lodash.debounce'

import NavHeaderSearchBar from '../Components/NavHeader/headerSearchBar/NavHeaderSearchBar.tsx'
import MetricaEvents from '../constants/MetricaEvents'
import { COLOR_BLUE_600, COLOR_WHITE } from '../constants/styles'
import reportEvent from '../Utils/Analytics'
import { isTablet } from '../Utils/Platform'

import { CoursesCarouselItem } from './Components/carouselItem/CoursesCarouselItem'
import CoursesFilters from './Components/filters/CoursesFilters.tsx'
import { CourseListItem } from './Components/listItem/CourseListItem'
import PaymentButton from './Components/PaymentButton'
import { loadCourses, loadMoreCourses } from './coursesActionsAsync'
import type { TCourse } from './coursesTypes'

const keyExtractor = (item: TCourse) => item.id
type TCourseR = { item: TCourse }

const ScreenSearchCourses = ({ showFilters }: { showFilters: (isFavorites: boolean) => void }) => {
    const navigation = useAppNavigation()
    const params = useAppRoute<{ filters: { [key: string]: string[] }; favorites?: boolean }>()
    const courseListChunk = useCourseListContext()
    const { width: windowWidth } = useWindowDimensions()

    // Calculate number of columns based on orientation
    const [numColumns, setNumColumns] = useState(
        platform.isTablet ? (windowWidth > 900 ? 3 : 2) : 1,
    )

    useEffect(() => {
        if (platform.isTablet) {
            // Portrait: 2 columns, Landscape: 3 columns
            setNumColumns(windowWidth > 900 ? 3 : 2)
        }
    }, [windowWidth])

    const [courses, isLoading, isCoursesStatus, isLearnLiteAccess, creditBalance, selectedFilters] =
        useValues([
            courseListChunk.props.getCourses,
            courseListChunk.props.getIsLoading,
            marketingStoreChunk.props.getIsCourses,
            marketingStoreChunk.props.getIsLearningLite,
            marketingStoreChunk.props.getCourseBalance,
            courseListChunk.props.getSelectedFilters,
        ])

    const searchText = (selectedFilters.text as string | undefined) ?? ''
    const isFavorites = !!params.favorites
    const isUserHasCreditBalance = creditBalance > 0

    const actions = useActions({
        setSelectedFilters: courseListChunk.actions.setSelectedFilters,
        setSearchText: courseListChunk.actions.setSearchText,
        loadCourses,
        loadMoreCourses,
        setScreen: navigationThunks.setScreen,
        setMarketingSource: marketingStoreChunk.actions.setSource,
    })

    const onOpenExplore = useCallback(() => {
        navigation.navigate('LearnTab')
    }, [navigation])

    const onOpenLanding = useCallback(
        (isLearnLite: boolean) => {
            actions.setMarketingSource(
                marketingConstants.sources[
                    isLearnLite ? 'catalogBannerEditorPicks' : 'coursesBottomCTA'
                ],
            )
            reportEvent(MetricaEvents.COURSE_CLICK_BUTTON_CTA)

            navigation.push(Screen.screenLongLanding, {
                planName: isLearnLite && !isLearnLiteAccess ? 'learningLite' : 'learning',
            })
        },
        [actions, isLearnLiteAccess, navigation],
    )

    const runSearch = useCallback(
        debounce((isFavorites: boolean) => {
            actions.loadCourses(courseListChunk, isFavorites)
        }, 1000),
        [actions],
    )

    const onSearch = useCallback(
        (text: string) => {
            actions.setSearchText(text)
            runSearch(isFavorites)
        },
        [actions, runSearch, isFavorites],
    )

    const onClearSearch = useCallback(() => {
        if (!searchText.length) return
        actions.setSearchText('')
        actions.loadCourses(courseListChunk, isFavorites)
    }, [actions, courseListChunk, isFavorites, searchText.length])

    const onLoadMore = useCallback(() => {
        actions.loadMoreCourses(courseListChunk, isFavorites)
    }, [actions, courseListChunk, isFavorites])

    const onRefresh = useCallback(() => {
        if (!checkConnectionSafely()) return
        actions.loadCourses(courseListChunk, isFavorites)
    }, [actions, courseListChunk, isFavorites])

    const onShowFilters = useCallback(() => {
        reportEvent(MetricaEvents.COURSES_FILTERS_SHOW)

        showFilters(isFavorites)
    }, [isFavorites, showFilters])

    useEffect(() => {
        actions.setScreen(courses.length ? null : 'CoursesNoResults')
    }, [actions, courses])

    useEffect(() => {
        const filters = params?.filters
        if (filters) actions.setSelectedFilters(filters)
        if (params?.favorites) {
            actions.setScreen('LibraryCourses')
            navigation.setParams({ customScreenName: 'LibraryCourses' })
            reportEvent(MetricaEvents.COURSES_FAVORITES_VIEW, {
                previous_screen: Screen.libraryMain,
            })
        }

        onRefresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const renderItem = useCallback(
        (props: TCourseR) => {
            const isEditorPicks = !!params?.filters?.only_editors_picks

            if (isTablet) {
                // Calculate card width based on available space and number of columns
                const horizontalPadding = layout.baseMarginFromEdges * 2
                const columnGap = layout.marginMd
                const totalGaps = (numColumns - 1) * columnGap
                const availableWidth = windowWidth - horizontalPadding - totalGaps
                const cardWidth = availableWidth / numColumns

                return (
                    <CoursesCarouselItem
                        course={props.item}
                        isEditorPicks={isEditorPicks}
                        cardWidth={cardWidth}
                        isGrid
                    />
                )
            }

            return <CourseListItem course={props.item} isEditorPicks={isEditorPicks} />
        },
        [params?.filters?.only_editors_picks, numColumns, windowWidth],
    )

    function hasSearch() {
        return !!Object.values(selectedFilters).find(s => s.length > 0)
    }

    const isOnlyEditorPicks = !!params?.filters?.only_editors_picks

    const _courses = courses

    if (_courses.length === 0 && !hasSearch() && !isLoading) {
        return (
            <BaseEmptyStateView
                title={translate('native.favorite_courses.empty_title')}
                description={translate('native.favorite_courses.empty_description')}
                icon={brokenHeart}
            />
        )
    }

    return (
        <View style={styles.container}>
            <NavHeaderSearchBar
                testID={coursesTestIds.coursesSearchBar}
                searchTerm={searchText}
                isFilterWasOpen
                openFilterScreen={onShowFilters}
                onChangeText={onSearch}
                clearInputValue={onClearSearch}
                moduleKey="courses"
            />
            {isLoading && _courses.length === 0 && <BrandAppLoader />}
            {!isLoading && _courses.length > 0 && (
                <>
                    <FlatList
                        testID={coursesTestIds.courseList}
                        key={platform.isTablet ? `tablet${numColumns}` : 'mobile1'}
                        contentContainerStyle={[
                            styles.list,
                            platform.isTablet && styles.listTablet,
                        ]}
                        columnWrapperStyle={platform.isTablet ? styles.columnWrapper : undefined}
                        data={_courses}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        numColumns={numColumns}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={onRefresh}
                                tintColor={COLOR_BLUE_600}
                                colors={[COLOR_BLUE_600]}
                            />
                        }
                        onEndReachedThreshold={0.01}
                        onEndReached={onLoadMore}
                    />
                    <PaymentButton
                        isLearnLite={isOnlyEditorPicks}
                        isCoursesStatus={isCoursesStatus}
                        goLanding={onOpenLanding}
                        isUserHasCreditBalance={isUserHasCreditBalance}
                    />
                </>
            )}
            {!isLoading && _courses.length === 0 && (
                <BaseEmptyStateView
                    title={translate('native.favorite_courses.empty_title')}
                    description={translate('native.favorite_courses.empty_description')}
                    icon={brokenHeart}
                />
            )}
        </View>
    )
}

const ScreenSearchCoursesFunc = (props: any) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const title = props.route?.params?.title
    const headerTitle = props.route?.params?.favorites
        ? translate('native.screens_titles.favorite_courses_screen')
        : title

    useNavHeader(headerTitle, false, libraryTestIds.navigation.coursesBack, true)

    const showFilters = useCallback((isFavorites: boolean) => {
        sheetRef.current?.present(isFavorites)
    }, [])

    const onDismiss = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const { favorites } = useAppRoute<{ favorites?: boolean }>()

    const { chunk } = useInjectDynamicStoreChunk(
        favorites ? 'course_favorites' : 'search_courses',
        key => createCourseListDynamicStoreChunk(key),
    )

    return (
        <CourseListContext.Provider value={chunk}>
            <ScreenSearchCourses {...props} showFilters={showFilters} />
            <NativeBottomSheet ref={sheetRef}>
                {(isFavorites: boolean) => {
                    return (
                        <CoursesFilters
                            isFavorites={isFavorites}
                            onClose={onDismiss}
                            courseListChunk={chunk}
                        />
                    )
                }}
            </NativeBottomSheet>
        </CourseListContext.Provider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
    list: {
        paddingVertical: 12,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    listTablet: style.view({
        alignSelf: 'center',
    }),
    columnWrapper: {
        gap: layout.marginMd,
        justifyContent: 'flex-start',
    },
})

export default ScreenSearchCoursesFunc
