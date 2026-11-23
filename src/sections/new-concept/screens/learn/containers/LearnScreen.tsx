import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, type ScrollViewInstance, StyleSheet, View } from 'react-native'

import { brandColors, layout, SearchField, useAppSafeArea } from '@mu-native/ds'
import { localizeCoursesSectionTitle, translate } from '@mu-native/locale'
import { CoursesPaymentModalWrapper, FloatingButtonContainer } from '@mu-native/marketing'
import { NavigationService, Screen, useAppNavigation } from '@mu-native/navigation'
import {
    FLOATING_TAB_BAR_HEIGHT,
    LEARN_TAB_ROUTE,
    RootScreenHeader,
    ScreenStateGate,
    usePullToRefresh,
    useScreenViewReporter,
    useTabScrollToTop,
} from '@mu-native/new-concept-shared'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { TCourse, TSection } from '../../../../../App/Courses/coursesTypes'
import { ContinueStudyingCarousel } from '../components/ContinueStudyingCarousel'
import { CourseSectionCarousel } from '../components/CourseSectionCarousel'
import { useOpenCourse } from '../helpers/useOpenCourse'
import { useLearnScreen } from '../store/useLearnScreen'

export const LearnScreen = () => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const scrollRef = useTabScrollToTop<ScrollViewInstance>(LEARN_TAB_ROUTE)

    const openCourse = useOpenCourse()
    const [searchInput, setSearchInput] = useState('')
    const { isLoading, isError, hasData, refresh, continueStudying, sections } = useLearnScreen()
    const { isRefreshing, onRefresh } = usePullToRefresh(refresh)
    const [isTabletPaymentModal, setIsTabletPaymentModal] = useState(false)

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_LEARN_VIEW)

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    const openContinueStudyingCourse = useCallback(
        (course: TCourse) =>
            openCourse(course, {
                blockName: 'My courses',
                position: continueStudying.indexOf(course),
            }),
        [openCourse, continueStudying],
    )

    const catalogSections = useMemo<TSection[]>(
        () => sections.filter(section => !!section.data?.length),
        [sections],
    )

    const onSearchSubmit = useCallback(() => {
        const query = searchInput.trim()
        if (!query) return
        NavigationService.navigate(Screen.learnSearchCourses, {
            title: query,
            filters: { text: query },
        })
    }, [searchInput])

    const onMyCoursesViewAll = useCallback(() => {
        navigation.push(Screen.learnMyCourses)
    }, [navigation])

    const onSectionViewAll = useCallback((section: TSection) => {
        let filters: Record<string, string[]> = {}
        Object.entries(section.view_all_data ?? {}).forEach(([key, value]) => {
            filters = { ...filters, [key]: value.split(',') }
        })
        NavigationService.navigate(Screen.learnSearchCourses, {
            title: localizeCoursesSectionTitle(section.title),
            filters,
        })
    }, [])

    return (
        <TrackedScreen screenName={PerformanceScreen.courses} interactive={hasData}>
            <View style={[styles.root, { paddingTop: insets.top }]}>
                <CoursesPaymentModalWrapper onTabletModalChange={setIsTabletPaymentModal} />
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingBottom:
                                insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg,
                        },
                    ]}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    <RootScreenHeader
                        search={
                            isTabletPaymentModal ? undefined : (
                                <SearchField
                                    placeholder={translate('native.search.placeholder_courses')}
                                    value={searchInput}
                                    onChangeText={setSearchInput}
                                    onClear={() => setSearchInput('')}
                                    onSubmitEditing={onSearchSubmit}
                                    returnKeyType="search"
                                />
                            )
                        }
                    />

                    <ScreenStateGate
                        hasData={hasData}
                        isLoading={isLoading}
                        isError={isError}
                        onRetry={refresh}
                    >
                        {continueStudying.length > 0 && (
                            <ContinueStudyingCarousel
                                courses={continueStudying}
                                onCoursePress={openContinueStudyingCourse}
                                onViewAllPress={onMyCoursesViewAll}
                            />
                        )}

                        {catalogSections.map(section => (
                            <CourseSectionCarousel
                                key={section.title}
                                title={localizeCoursesSectionTitle(section.title) ?? section.title}
                                courses={section.data}
                                onCoursePress={course =>
                                    openCourse(course, {
                                        blockName:
                                            localizeCoursesSectionTitle(section.title) ??
                                            section.title,
                                        position: section.data.indexOf(course),
                                    })
                                }
                                onViewAllPress={() => onSectionViewAll(section)}
                            />
                        ))}
                    </ScreenStateGate>
                </ScrollView>
                <FloatingButtonContainer
                    isShowLearnPlan
                    bottomOffset={insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg}
                />
            </View>
        </TrackedScreen>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    // Lets the first-frame loading/error state fill the viewport and center.
    scrollContent: {
        flexGrow: 1,
    },
})
