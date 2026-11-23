import { Component, Fragment } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { connect } from 'react-redux'

import { platform } from '@mu-native/common'
import { courseBrowseStoreChunk } from '@mu-native/course-browse'
import { type TCourseListDynamicStoreChunk } from '@mu-native/course-list'
import { BrandAppLoader, FilterSortItem, FiltersToggleExpanded } from '@mu-native/ds'
import { localizeFilter, translate } from '@mu-native/locale'
import {
    FilterItem,
    FilterSectionTitle,
    FilterSheetBottomButtons,
    TFilterKey,
} from '@mu-native/search'

import MetricaEvents from '../../../constants/MetricaEvents'
import type { State } from '../../../Reducers/Types'
import reportEvent from '../../../Utils/Analytics'
import { loadCourses, loadFilters } from '../../coursesActionsAsync'
import { TFilter, TFilters, TSort } from '../../coursesTypes'

interface IProps {
    filters: TFilters | null
    selectedFilters: { [key: string]: string[] }
    loadCourses: () => void
    loadFilters: () => void
    setSelectedFilters: (filters: { [key: string]: string[] }) => void
    onClose: () => void
    hideSort?: boolean
}

interface IState {
    expandedFilters: Record<string, boolean>
}

class CoursesFilters extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = {
            expandedFilters: {},
        }
    }

    handleApply = () => {
        const { selectedFilters } = this.props

        reportEvent(MetricaEvents.COURSES_FILTERS_APPLY, { value: selectedFilters })

        this.props.onClose()
    }

    handleReset = () => {
        const { setSelectedFilters, loadFilters } = this.props

        reportEvent(MetricaEvents.SEARCH_FILTERS_RESET, { ui: 'courses' })

        setSelectedFilters({})
        loadFilters()
    }

    handleSingleSelection = (filter: string, id: string) => {
        const { selectedFilters, setSelectedFilters, loadCourses } = this.props
        const storedFilters = selectedFilters[filter] ?? []
        const selected = [id]
        const toInsert = selected.filter(item => !storedFilters.includes(item))
        setSelectedFilters({ ...selectedFilters, [filter]: toInsert })

        const toRemove = selected.filter(item => storedFilters.includes(item))
        toRemove.forEach(value => {
            reportEvent(MetricaEvents.COURSES_FILTERS_REMOVE, { value })
        })
        loadCourses()
    }

    toggleExpanded = (filterKey: string) => {
        this.setState(prev => ({
            expandedFilters: {
                ...prev.expandedFilters,
                [filterKey]: !prev.expandedFilters[filterKey],
            },
        }))
    }

    renderSort = () => {
        const { filters, selectedFilters } = this.props
        const selected = selectedFilters?.sort || []

        return (
            <>
                <FilterSectionTitle title={translate('native.sorting.title')} isChevronHidden />
                {!!filters?.sort?.length &&
                    filters?.sort?.map((item: TSort) => (
                        <FilterSortItem
                            key={item.type}
                            onPress={() => this.handleSingleSelection('sort', item.type)}
                            name={item.name}
                            id={item.type}
                            isSelected={selected.includes(item.type)}
                        />
                    ))}
            </>
        )
    }

    renderFilters = (filter: TFilterKey | 'sort') => {
        if (filter === 'sort') return null
        const isExpanded = this.state.expandedFilters[filter] || false
        const { filters, selectedFilters } = this.props
        const filtersData = {
            items: (filters as any)[filter],
            keys: (filters as any)[filter]?.map((item: TFilter) => item.id),
        }
        const firstData = !isExpanded ? filtersData.items.slice(0, 4) : filtersData.items
        const selected = selectedFilters[filter] || []
        const titleSort = localizeFilter(filter)

        return (
            <Fragment key={filter.toString()}>
                <FilterSectionTitle title={titleSort} isChevronHidden />
                {firstData?.map((item: TSort & { id: string; count: string }) => (
                    <FilterItem
                        id={item.id}
                        filterKey={filter}
                        key={`item-${item.name}`}
                        name={item.name}
                        count={parseInt(item.count, 10)}
                        onPress={this.handleSingleSelection}
                        isSelected={selected.includes(item.id)}
                    />
                ))}

                {filtersData.items?.length > 4 && (
                    <FiltersToggleExpanded
                        isExpanded={isExpanded}
                        setExpanded={() => this.toggleExpanded(filter)}
                    />
                )}
            </Fragment>
        )
    }

    render() {
        const { filters } = this.props

        if (!filters) {
            return (
                <View style={styles.loaderContainer}>
                    <BrandAppLoader />
                </View>
            )
        }

        return (
            <>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {!this.props.hideSort && this.renderSort()}
                    {(Object.keys(filters) as (TFilterKey | 'sort')[]).map(this.renderFilters)}
                </ScrollView>

                <FilterSheetBottomButtons
                    onSearch={this.handleApply}
                    onClear={this.handleReset}
                    isClearDisabled={
                        !Object.values(this.props.selectedFilters).some(arr => arr.length > 0)
                    }
                />
            </>
        )
    }
}

type SProps = {
    courseListChunk: TCourseListDynamicStoreChunk
    isFavorites?: boolean
    onClose: () => void
    hideSort?: boolean
}

const mapStateToProps = (state: State, ownProps: SProps) => ({
    filters: courseBrowseStoreChunk.props.getFilters(state),
    selectedFilters: ownProps.courseListChunk.props.getSelectedFilters(state),
})

const mapDispatchToProps = (dispatch: (...args: Array<any>) => any, ownProps: SProps) => ({
    loadCourses: () => {
        dispatch(loadCourses(ownProps.courseListChunk, ownProps.isFavorites))
    },
    loadFilters: () => {
        dispatch(loadFilters())
    },
    setSelectedFilters: (filters: { [key: string]: string[] }) => {
        dispatch(ownProps.courseListChunk.actions.setSelectedFilters(filters))
    },
})

const getHeight = () => {
    if (platform.isTablet) {
        return 700
    }
    if (platform.isPhoneX) {
        return 600
    }
    if (platform.isIos) {
        return 490
    }
    return 390
}

const styles = StyleSheet.create({
    loaderContainer: {
        width: '100%',
        height: getHeight(),
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
})

// @ts-ignore
export default connect(
    mapStateToProps,
    mapDispatchToProps,
    // @ts-ignore
)(CoursesFilters) as React.ComponentClass<SProps>
