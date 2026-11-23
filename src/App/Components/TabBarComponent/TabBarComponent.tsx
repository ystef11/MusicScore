import { useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { getStoreValue } from '@mu-native/common'
import { colors } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import { exploreCommonStoreChunk } from '@mu-native/explore-common'
import { marketingStorage } from '@mu-native/marketing'
import { BottomTabBarProps, NavigationService } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { getAllSelectedFiltersQuantity, searchStoreChunk } from '@mu-native/search'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import { COLOR_SILVER } from '../../constants/styles'
import { exploreScoreListStoreChunk } from '../../Explore/exploreScoreListStoreChunk'
import { screenExploreThunks } from '../../Explore/ScreenExplore/thunks/thunks'
import reportEvent from '../../Utils/Analytics'

import { TabBarItem } from './tabBarItem/TabBarItem'
import { getTabBarRoutes } from './tabBarSettings'

const TabBarComponent = ({ state }: BottomTabBarProps) => {
    const [scrollToTop, activeDecorData] = useValues([
        exploreCommonStoreChunk.props.getScrollToTop,
        dynamicDecorStoreChunk.props.getActiveDecorData,
    ])
    const actions = useActions({
        setIsOpenOmrModal: omrStoreChunk.actions.setIsOpenOmrModal,
        resetFilters: searchStoreChunk.actions.resetAllSelectedFilters,
        resetSort: searchStoreChunk.actions.resetSelectedSort,
        setSearchTerm: searchStoreChunk.actions.setSearchTerm,
        search: screenExploreThunks.search,
    })

    const profileDecorIconUri = useMemo(
        () => ({ uri: activeDecorData?.profile_icon }),
        [activeDecorData?.profile_icon],
    )

    const tabBarRoutes = getTabBarRoutes()

    useEffect(() => {
        reportEvent(MetricaEvents.NAVIGATION_BAR_ELEMENT_SHOW, {
            'params.key': tabBarRoutes.map((_, index) => `tab${index + 1}`),
            'params.value': tabBarRoutes.map(() => 0),
            'params.str_value': tabBarRoutes.map(item => item.routeName),
        })
    }, [tabBarRoutes])

    const onBrowseTabRePress = useCallback(() => {
        const filtersQuantity = getStoreValue(getAllSelectedFiltersQuantity)
        const sort = getStoreValue(searchStoreChunk.props.getSelectedSort)
        const searchTerm = getStoreValue(searchStoreChunk.props.getSearchTerm)
        const hasActiveSearch =
            filtersQuantity > 0 || (!!sort && sort !== 'relevance') || !!searchTerm

        if (hasActiveSearch) {
            actions.resetFilters()
            actions.resetSort()
            actions.setSearchTerm('')
            actions.search(exploreScoreListStoreChunk, '')
            reportEvent(MetricaEvents.SEARCH_FILTERS_RESET, { ui: 'scores' })
        }
    }, [actions])

    const onChangeTab = useCallback(
        (tabIndex: number) => {
            const tabBarItem = tabBarRoutes[tabIndex]
            const routeName = tabBarItem.routeName

            reportEvent(MetricaEvents.NAVIGATION_BAR_ELEMENT_CLICK, {
                'params.key': [`tab${tabIndex + 1}`],
                'params.value': [0],
                'params.str_value': [routeName],
            })

            if (routeName === 'LearnTab') {
                marketingStorage.set('tabCourses', true)
            }

            if (routeName === 'OmrTab') {
                actions.setIsOpenOmrModal(true)
                return
            }
            NavigationService.navigate(routeName as any)
        },
        [actions, tabBarRoutes],
    )

    const isCourseTabWasOpen = marketingStorage.get('tabCourses')

    const activeRouteName = state.routes[state.index]?.name

    return (
        <View style={styles.tabBarContainer}>
            {tabBarRoutes.map((route, index) => (
                <TabBarItem
                    profileDecorIconUri={profileDecorIconUri}
                    isShowHolidayIcon={false}
                    route={route}
                    tabIndex={index}
                    key={route.label}
                    isCurrentTab={route.routeName === activeRouteName}
                    onChangeTab={onChangeTab}
                    hasNotifications={false}
                    scrollToTop={route.routeName === 'BrowseTab' ? scrollToTop : undefined}
                    onRePress={route.routeName === 'BrowseTab' ? onBrowseTabRePress : undefined}
                    isCourseTabWasOpen={isCourseTabWasOpen}
                    profileIconStyle={activeDecorData?.profileIconStyle}
                />
            ))}
        </View>
    )
}

export default TabBarComponent

const styles = StyleSheet.create({
    tabBarContainer: {
        paddingHorizontal: 4,
        justifyContent: 'space-around',
        flexDirection: 'row',
        width: '100%',
        backgroundColor: colors.white,
        borderColor: COLOR_SILVER,
        borderWidth: 1,
    },
})
