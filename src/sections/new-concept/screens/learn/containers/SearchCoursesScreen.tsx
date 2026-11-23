import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import {
    CourseListContext,
    createCourseListDynamicStoreChunk,
    useCourseListContext,
} from '@mu-native/course-list'
import {
    BaseEmptyStateView,
    brandColors,
    layout,
    NativeBottomSheet,
    type NativeBottomSheetRef,
    useAppSafeArea,
} from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import {
    localizeFilterName,
    localizeInstrumentFilterOption,
    localizeSorting,
    translate,
} from '@mu-native/locale'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import {
    FilterChipsRow,
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    NestedScreenHeader,
    ResultsCountRow,
    SearchFieldRow,
    useScreenViewReporter,
} from '@mu-native/new-concept-shared'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import CoursesFilters from '../../../../../App/Courses/Components/filters/CoursesFilters'
import {
    loadCourses,
    loadFilters,
    loadMoreCourses,
} from '../../../../../App/Courses/coursesActionsAsync'
import type { TCourse, TFilter, TFilters } from '../../../../../App/Courses/coursesTypes'
import { CourseListCard } from '../components/CourseListCard'
import { useOpenCourse } from '../helpers/useOpenCourse'

// Own key so this screen's list never shares state with the control-group
// `ScreenSearchCourses` ('search_courses') chunk.
const CHUNK_KEY = 'new_concept_search_courses'

// Selected filters surfaced as removable chips (text + sort are shown elsewhere).
const CHIP_FILTER_KEYS = ['instrument', 'level', 'topics'] as const

type TCourseFilterChip = {
    key: string
    label: string
    filterKey: string
    itemId: string
    isSelected: boolean
}

type TRouteParams = {
    title?: string
    // `text` arrives as a string; refinement filters as string[]. Seeded on mount.
    filters?: { [key: string]: string[] | string }
}

const keyExtractor = (item: TCourse) => item.id

const buildFilterChips = (
    filters: TFilters | null,
    selectedFilters: { [key: string]: string[] | string },
): TCourseFilterChip[] => {
    if (!filters) return []
    const chips: TCourseFilterChip[] = []
    CHIP_FILTER_KEYS.forEach(filterKey => {
        const selectedIds = (selectedFilters[filterKey] as string[] | undefined) ?? []
        const meta = filters[filterKey] as TFilter[] | undefined
        selectedIds.forEach(itemId => {
            const item = meta?.find(entry => entry.id === itemId)
            if (item) {
                chips.push({
                    key: `${filterKey}:${itemId}`,
                    label:
                        filterKey === 'instrument'
                            ? localizeInstrumentFilterOption(item.name)
                            : localizeFilterName(item.name),
                    filterKey,
                    itemId,
                    isSelected: true,
                })
            }
        })
    })
    return chips
}

const SearchCoursesResults = ({ showFilters }: { showFilters: () => void }) => {
    const navigation = useAppNavigation()
    const insets = useAppSafeArea()
    const { title, filters: routeFilters } = useAppRoute<TRouteParams>()
    const courseListChunk = useCourseListContext()

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_SEARCH_COURSES_VIEW)

    // Header mode is fixed by the initial route params: a non-empty `text` query
    // means the user arrived via course search (search field + chips + count);
    // otherwise they arrived via a section "View all" (title-only header).
    // Clearing the search field must not flip the mode, so capture it once.
    const isSearchMode = useMemo(
        () => typeof routeFilters?.text === 'string' && routeFilters.text.length > 0,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    )

    const [courses, isLoading, totalItems, selectedFilters] = useValues([
        courseListChunk.props.getCourses,
        courseListChunk.props.getIsLoading,
        courseListChunk.props.getTotalItems,
        courseListChunk.props.getSelectedFilters,
    ])
    const [filtersMeta] = useValues([courseBrowseStoreChunk.props.getFilters])

    const actions = useActions({
        setSearchText: courseListChunk.actions.setSearchText,
        setSelectedFilters: courseListChunk.actions.setSelectedFilters,
        loadCourses,
        loadFilters,
        loadMoreCourses,
    })

    const searchText = (selectedFilters.text as string | undefined) ?? ''
    // Seed the field from the route query, not the chunk — the route filters are
    // only copied into the chunk in a mount effect, after this initial render.
    const [draftTerm, setDraftTerm] = useState(
        typeof routeFilters?.text === 'string' ? routeFilters.text : searchText,
    )

    const openCourse = useOpenCourse()

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false })
    }, [navigation])

    // Seed the route filters (incl. the text query) into the chunk, then load the
    // filter metadata (for chips + the sheet) and the first page of results.
    useEffect(() => {
        if (routeFilters) {
            actions.setSelectedFilters(routeFilters as { [key: string]: string[] })
        }
        actions.loadFilters()
        actions.loadCourses(courseListChunk)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onBack = useCallback(() => navigation.goBack(), [navigation])

    const runSearch = useCallback(
        (text: string) => {
            actions.setSearchText(text)
            actions.loadCourses(courseListChunk)
        },
        [actions, courseListChunk],
    )

    const onSubmit = useCallback(() => runSearch(draftTerm.trim()), [runSearch, draftTerm])

    const onClear = useCallback(() => {
        setDraftTerm('')
        runSearch('')
    }, [runSearch])

    const onLoadMore = useCallback(
        () => actions.loadMoreCourses(courseListChunk),
        [actions, courseListChunk],
    )

    const chips = useMemo(
        () => buildFilterChips(filtersMeta, selectedFilters),
        [filtersMeta, selectedFilters],
    )

    const onRemoveChip = useCallback(
        (chip: TCourseFilterChip) => {
            const current = (selectedFilters[chip.filterKey] as string[] | undefined) ?? []
            actions.setSelectedFilters({
                ...selectedFilters,
                [chip.filterKey]: current.filter(id => id !== chip.itemId),
            } as { [key: string]: string[] })
            actions.loadCourses(courseListChunk)
        },
        [actions, courseListChunk, selectedFilters],
    )

    const sortOptions = useMemo(
        () =>
            (filtersMeta?.sort ?? []).map(item => ({
                id: item.type,
                label: localizeSorting(item.type, item.name),
            })),
        [filtersMeta],
    )

    const selectedSortId =
        (selectedFilters.sort as string[] | undefined)?.[0] ?? filtersMeta?.sort?.[0]?.type

    const onSelectSort = useCallback(
        (id: string) => {
            actions.setSelectedFilters({ ...selectedFilters, sort: [id] } as {
                [key: string]: string[]
            })
            actions.loadCourses(courseListChunk)
        },
        [actions, courseListChunk, selectedFilters],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<TCourse>) => (
            <CourseListCard course={item} onPress={openCourse} />
        ),
        [openCourse],
    )

    const listEmpty = useMemo(() => {
        if (isLoading) return <ListLoader />
        return (
            <View style={styles.emptyState}>
                <BaseEmptyStateView
                    icon={search}
                    title={translate('native.new_concept.learn.no_courses_found')}
                    description={translate('native.new_concept.common.check_spelling_hint')}
                />
            </View>
        )
    }, [isLoading])

    const countText =
        isLoading && courses.length === 0
            ? ''
            : translate('native.new_concept.common.results_count', {
                  count: totalItems.toLocaleString('en-US'),
              })

    return (
        <View style={[styles.root, isSearchMode && { paddingTop: insets.top }]}>
            {isSearchMode ? (
                <>
                    <SearchFieldRow
                        onBack={onBack}
                        value={draftTerm}
                        onChangeText={setDraftTerm}
                        onSubmitEditing={onSubmit}
                        onClear={onClear}
                        placeholder={translate('native.search.placeholder_courses')}
                        returnKeyType="search"
                    />
                    <FilterChipsRow
                        chips={chips}
                        onChipPress={onRemoveChip}
                        onOpenFilters={showFilters}
                    />
                    <ResultsCountRow
                        countText={countText}
                        sortOptions={sortOptions}
                        selectedSortId={selectedSortId}
                        onSelectSort={onSelectSort}
                    />
                </>
            ) : (
                <NestedScreenHeader title={title ?? translate('native.courses.courses')} />
            )}

            <FlatList
                data={courses}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={ListSeparator}
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={listEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg },
                ]}
            />
        </View>
    )
}

const ListSeparator = () => <View style={styles.separator} />

export const SearchCoursesScreen = () => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const { chunk } = useInjectDynamicStoreChunk(CHUNK_KEY, key =>
        createCourseListDynamicStoreChunk(key),
    )

    const showFilters = useCallback(() => sheetRef.current?.present(), [])
    const onCloseFilters = useCallback(() => sheetRef.current?.dismiss(), [])

    return (
        <CourseListContext.Provider value={chunk}>
            <SearchCoursesResults showFilters={showFilters} />
            <NativeBottomSheet ref={sheetRef}>
                <CoursesFilters
                    isFavorites={false}
                    onClose={onCloseFilters}
                    courseListChunk={chunk}
                    hideSort
                />
            </NativeBottomSheet>
        </CourseListContext.Provider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: layout.marginMd,
    },
    separator: {
        height: layout.marginLg,
    },
    emptyState: {
        flex: 1,
        minHeight: 320,
    },
})
