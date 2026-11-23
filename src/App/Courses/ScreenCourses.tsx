import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    Keyboard,
    ListRenderItemInfo,
    RefreshControl,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { getIsAuthorized } from '@mu-native/auth'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import {
    CourseListContext,
    createCourseListDynamicStoreChunk,
    useCourseListContext,
} from '@mu-native/course-list'
import {
    BrandAppLoader,
    brandColors,
    NativeBottomSheet,
    NativeBottomSheetRef,
    ScrollableHeaderProvider,
    useScrollableHeader,
    useTopBarScrollHandler,
} from '@mu-native/ds'
import { CoursesPaymentModalWrapper, FloatingButtonContainer } from '@mu-native/marketing'
import { navigationThunks, Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import debounce from 'lodash.debounce'
import Animated from 'react-native-reanimated'

import NavHeaderSearchBar from '../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import MetricaEvents from '../constants/MetricaEvents'
import { COLOR_LINK } from '../constants/styles'
import reportEvent from '../Utils/Analytics'

import CoursesCarousel from './Components/carousel/CoursesCarousel'
import CoursesFilters from './Components/filters/CoursesFilters.tsx'
import { CourseList } from './Containers/CourseList.tsx'
import { loadCourses, loadFilters, loadMoreCourses, loadSections } from './coursesActionsAsync'
import type { TSection } from './coursesTypes'

interface ISectionItem extends ListRenderItemInfo<TSection> {
    item: TSection
}

const carouselKeyExtractor = (item: TSection) => item.title
const renderCarousel = ({ item }: ISectionItem) => <CoursesCarousel section={item} />
const handleFocusInput = () => {
    reportEvent(MetricaEvents.SEARCH_FOCUS, { ui: 'courses' })
}

const Sections = memo(({ onRefresh }: { onRefresh: () => void }) => {
    const [isLoading, sections] = useValues([
        courseBrowseStoreChunk.props.getIsLoading,
        courseBrowseStoreChunk.props.getSections,
    ])
    const scrollHandler = useTopBarScrollHandler()
    const { contentPaddingTop } = useScrollableHeader()

    if (!sections?.length && isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <BrandAppLoader />
            </View>
        )
    }

    return (
        <Animated.FlatList
            testID={coursesTestIds.courseSections}
            key="#"
            style={styles.list}
            data={sections}
            contentContainerStyle={{ paddingTop: contentPaddingTop }}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={onRefresh}
                    tintColor={COLOR_LINK}
                    colors={[COLOR_LINK]}
                    progressViewOffset={contentPaddingTop}
                />
            }
            renderItem={renderCarousel}
            keyExtractor={carouselKeyExtractor}
        />
    )
})

const Courses = ({ onRefresh, isEmpty }: { onRefresh: () => void; isEmpty: boolean }) => {
    const courseListChunk = useCourseListContext()
    const { loadMore } = useActions({ loadMore: loadMoreCourses })

    return (
        <CourseList
            storeChunk={courseListChunk}
            onRefresh={onRefresh}
            onLoadMore={loadMore}
            isEmpty={isEmpty}
        />
    )
}

const ScreenCourseBrowse = ({ showFilters }: { showFilters: () => void }) => {
    const navigation = useAppNavigation()
    const courseListChunk = useCourseListContext()
    const [courses, selectedFilters, isAuthorized] = useValues([
        courseListChunk.props.getCourses,
        courseListChunk.props.getSelectedFilters,
        getIsAuthorized,
    ])
    const actions = useActions({
        setSearchText: courseListChunk.actions.setSearchText,
        loadFilters,
        loadCourses,
        loadSections,
        setSelectedFilters: courseListChunk.actions.setSelectedFilters,
        setScreens: navigationThunks.setScreen,
    })

    const searchText = (selectedFilters.text as string | undefined) ?? ''

    const [showCourses, setShowCourses] = useState(false)
    const [isTabletPaymentModal, setIsTabletPaymentModal] = useState(false)

    const onShowFilters = useCallback(() => {
        Keyboard.dismiss()
        reportEvent(MetricaEvents.COURSES_FILTERS_SHOW)

        setShowCourses(true)
        showFilters()
    }, [showFilters])

    const runSearch = useCallback(
        debounce(() => {
            setShowCourses(true)
            actions.loadCourses(courseListChunk)
        }, 1000),
        [],
    )

    const onSearch = useCallback(
        (text: string) => {
            actions.setSearchText(text)
            runSearch()
        },
        [runSearch],
    )

    const onClearSearch = useCallback(() => {
        reportEvent(MetricaEvents.SEARCH_CANCEL, { ui: 'courses' })
        actions.setSearchText('')
        actions.loadCourses(courseListChunk)
    }, [])

    const onRefresh = useCallback(() => {
        actions.loadFilters()
        actions.loadSections()
        actions.loadCourses(courseListChunk)
    }, [])

    useEffect(() => {
        onRefresh()
    }, [isAuthorized, onRefresh])

    const shouldUpdateScreenNameRef = useRef(false)

    useEffect(() => {
        actions.setScreens(Screen.coursesMain)
        const focusListener = navigation.addListener('focus', () => {
            shouldUpdateScreenNameRef.current = true
            reportEvent(MetricaEvents.COURSES_ALL_VIEW, { screen: Screen.coursesMain })
        })

        return () => {
            focusListener()
        }
    }, [])

    const selectedFiltersLength = Object.keys(selectedFilters)?.length
    useEffect(() => {
        if (!shouldUpdateScreenNameRef.current) return

        if (searchText) {
            if (courses?.length) {
                actions.setScreens(Screen.searchCourses)
            } else {
                actions.setScreens('CoursesNoResult')
            }
        } else if (selectedFiltersLength) {
            actions.setScreens('CoursesBrowse')
        } else {
            actions.setScreens(Screen.coursesMain)
        }
    }, [courses.length, searchText, selectedFiltersLength])

    const showCourseList = useMemo(() => {
        const nonEmptyFilters = Object.keys(selectedFilters).filter(
            (key: string) => selectedFilters[key]?.length,
        )
        return showCourses && !!nonEmptyFilters.length
    }, [selectedFilters, showCourses])

    const searchBarNode = !isTabletPaymentModal ? (
        <NavHeaderSearchBar
            testID={coursesTestIds.coursesSearchBar}
            isFilterWasOpen
            searchTerm={searchText}
            openFilterScreen={onShowFilters}
            onChangeText={onSearch}
            clearInputValue={onClearSearch}
            onSearchFocus={handleFocusInput}
            filtersApplied={Object.keys(selectedFilters)?.length}
            moduleKey="courses"
        />
    ) : null

    return (
        <ScrollableHeaderProvider
            headerContent={searchBarNode}
            backgroundColor={brandColors.backgroundDefault}
        >
            <View style={styles.contentContainer}>
                <CoursesPaymentModalWrapper onTabletModalChange={setIsTabletPaymentModal} />
                <View style={styles.container}>
                    {showCourseList ? (
                        <Courses
                            onRefresh={onRefresh}
                            isEmpty={searchText.length > 0 && courses.length === 0}
                        />
                    ) : (
                        <Sections onRefresh={onRefresh} />
                    )}
                    <FloatingButtonContainer isShowLearnPlan />
                </View>
            </View>
        </ScrollableHeaderProvider>
    )
}

const ScreenCoursesFunc = () => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const showFilters = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    const onDismiss = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    const { chunk } = useInjectDynamicStoreChunk('browse', key =>
        createCourseListDynamicStoreChunk(key),
    )

    return (
        <CourseListContext.Provider value={chunk}>
            <ScreenCourseBrowse showFilters={showFilters} />
            <NativeBottomSheet ref={sheetRef}>
                <CoursesFilters isFavorites={false} onClose={onDismiss} courseListChunk={chunk} />
            </NativeBottomSheet>
        </CourseListContext.Provider>
    )
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    contentContainer: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    } as ViewStyle,
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
        paddingLeft: 6,
    } as ViewStyle,
    list: {
        paddingBottom: 24,
    } as ViewStyle,
})

export default ScreenCoursesFunc
