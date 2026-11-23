import { useCallback, useMemo, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import {
    BaseEmptyStateView,
    brandColors,
    layout,
    useAppSafeArea,
    type IconSource,
} from '@mu-native/ds'
import { cloudDownload } from '@mu-native/icons/cloudDownload'
import { learn } from '@mu-native/icons/learn'
import { translate } from '@mu-native/locale'
import {
    FilterChipsRow,
    FLOATING_TAB_BAR_HEIGHT,
    ListLoader,
    NestedScreenHeader,
    useScreenViewReporter,
} from '@mu-native/new-concept-shared'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import type { TCourse } from '../../../../../App/Courses/coursesTypes'
import { CourseRow } from '../components/CourseRow'
import { useOpenCourse } from '../helpers/useOpenCourse'
import { useMyCourses, type TMyCoursesTab } from '../store/useMyCourses'

const FILTERS: { key: TMyCoursesTab; getLabel: () => string }[] = [
    { key: 'all', getLabel: () => translate('native.new_concept.common.all') },
    { key: 'saved', getLabel: () => translate('native.library.favorites_title') },
    { key: 'purchased', getLabel: () => translate('native.new_concept.common.purchased') },
]

const EMPTY_STATE: Record<TMyCoursesTab, { icon: IconSource; title: string; description: string }> =
    {
        all: {
            icon: learn,
            title: translate('native.new_concept.learn.empty_all_title'),
            description: translate('native.new_concept.learn.empty_all_description'),
        },
        saved: {
            icon: cloudDownload,
            title: translate('native.new_concept.learn.empty_saved_title'),
            description: translate('native.new_concept.learn.empty_saved_description'),
        },
        purchased: {
            icon: learn,
            title: translate('native.new_concept.learn.empty_purchased_title'),
            description: translate('native.new_concept.learn.empty_purchased_description'),
        },
    }

export const MyCoursesScreen = () => {
    const insets = useAppSafeArea()
    const [filter, setFilter] = useState<TMyCoursesTab>('all')
    const openCourse = useOpenCourse()
    const { courses, tabs, isLoading, loadMore } = useMyCourses(filter)

    useScreenViewReporter(MetricaEvents.TEMP_NEW_CONCEPT_MY_COURSES_VIEW)

    // A tab shows when its availability flag is true (§10); `all` is always shown
    // and the active tab stays visible even when its source empties.
    const visibleFilters = useMemo(
        () => FILTERS.filter(item => item.key === 'all' || item.key === filter || tabs?.[item.key]),
        [tabs, filter],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<TCourse>) => (
            <View style={styles.itemRow}>
                <CourseRow course={item} onPress={openCourse} />
            </View>
        ),
        [openCourse],
    )

    const listEmpty = useMemo(() => {
        if (isLoading) return <ListLoader />
        return (
            <View style={styles.emptyState}>
                <BaseEmptyStateView {...EMPTY_STATE[filter]} />
            </View>
        )
    }, [isLoading, filter])

    return (
        <View style={styles.root}>
            <NestedScreenHeader title={translate('native.courses.my_courses')} />
            <FilterChipsRow
                chips={visibleFilters.map(item => ({
                    key: item.key,
                    label: item.getLabel(),
                    isSelected: item.key === filter,
                }))}
                onChipPress={chip => setFilter(chip.key)}
            />
            <FlatList
                data={courses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={ListSeparator}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={listEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingBottom: insets.bottom + FLOATING_TAB_BAR_HEIGHT + layout.marginLg,
                    },
                ]}
            />
        </View>
    )
}

const ListSeparator = () => <View style={styles.separator} />

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    itemRow: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    separator: {
        height: layout.marginMd,
    },
    listContent: {
        flexGrow: 1,
        paddingTop: layout.marginSm,
    },
    emptyState: {
        flex: 1,
    },
})
