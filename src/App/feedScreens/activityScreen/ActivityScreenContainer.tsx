import { Component, useLayoutEffect } from 'react'
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native'
import { connect } from 'react-redux'

import {
    activityModuleStoreChunk,
    activityThunkActions,
    TActivitySetting,
    TFeedItem,
} from '@mu-native/activity'
import { getIsAuthorized } from '@mu-native/auth'
import { BaseEmptyStateView, layout } from '@mu-native/ds'
import { bell } from '@mu-native/icons/bell'
import { translate } from '@mu-native/locale'
import { useNavigation } from '@mu-native/navigation'
import debounce from 'lodash.debounce'

import { NavHeader } from '../../Components/NavHeader/NavHeader'
import MetricaEvents from '../../constants/MetricaEvents'
import { MARGIN_SM } from '../../constants/styles'
import NoAuthBlock from '../../Elements/noAuthBlock/NoAuthBlock'
import ScreenLayoutWrapperElement from '../../Elements/ScreenLayoutWrapperElement'
import type { State } from '../../Reducers/Types'
import reportEvent from '../../Utils/Analytics'
import FeedListItem from '../feedScreen/components/listItem/FeedListItem'

import EmptyActivityList from './elements/EmptyActivityList'

const INITIAL_PAGE = 1
const keyExtractor = (_: TFeedItem, index: number) => String(index)
const renderItem = ({ item }: { item: TFeedItem }) => {
    return <FeedListItem item={item} notification />
}

type TProps = {
    clearActivity: () => void
    fetchActivity: (page: number) => void
    setIsLoading: (hideLoader: boolean) => void
    activitySettings: TActivitySetting[]
    hasMorePages: boolean
    activity: TFeedItem[] | null
    isLoading: boolean
}

class ActivityScreenContainer extends Component<TProps, { page: number }> {
    constructor(props: TProps) {
        super(props)
        this.onEndReached = debounce(this.onEndReached, 1000)
        this.state = {
            page: INITIAL_PAGE,
        }
    }

    componentDidMount() {
        const { clearActivity, fetchActivity, setIsLoading } = this.props
        setIsLoading(false)
        clearActivity()
        fetchActivity(INITIAL_PAGE)
    }

    componentDidUpdate(prevProps: TProps) {
        const { activitySettings } = this.props

        if (prevProps.activitySettings !== activitySettings) {
            this.update()
        }
    }

    update = () => {
        const { clearActivity, fetchActivity } = this.props
        clearActivity()
        fetchActivity(INITIAL_PAGE)
    }

    onEndReached = () => {
        if (this.props.hasMorePages) {
            this.setState(prevState => {
                const page = prevState.page + 1
                reportEvent(MetricaEvents.ACTIVITY_LOAD_MORE)
                this.props.fetchActivity(page)
                return { page }
            })
        }
    }

    render() {
        const { activity, isLoading } = this.props

        if (!activity?.length && !this.props.isLoading) {
            return (
                <BaseEmptyStateView
                    title={translate('native.notifications.empty_title')}
                    description={translate('native.notifications.empty_description')}
                    icon={bell}
                />
            )
        }

        return (
            <ScreenLayoutWrapperElement style={styles.container}>
                <FlatList
                    data={activity ?? undefined}
                    refreshing={isLoading}
                    onRefresh={this.update}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    onEndReached={this.onEndReached}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<View style={styles.headerContainer} />}
                    ListEmptyComponent={isLoading ? undefined : <EmptyActivityList />}
                />
                <View style={styles.spacer}>
                    <NoAuthBlock feed />
                </View>
            </ScreenLayoutWrapperElement>
        )
    }
}

const mapStateToProps = (state: State) => ({
    activity: activityModuleStoreChunk.props.getUserActivity(state),
    hasMorePages: activityModuleStoreChunk.props.getHasMorePages(state),
    activitySettings: activityModuleStoreChunk.props.getSettings(state),
    isLoading: activityModuleStoreChunk.props.getIsLoading(state),
    isAuthorized: getIsAuthorized(state),
})

const mapDispatchToProps = (dispatch: (...args: Array<any>) => any) => ({
    clearActivity: () => {
        dispatch(activityModuleStoreChunk.actions.clearActivity())
    },
    fetchActivity: (page: number) => {
        reportEvent(MetricaEvents.NOTIFICATIONS_REQUEST)
        dispatch(activityThunkActions.fetchUserActivity(page))
    },
    setIsLoading: (hideLoader: boolean) => {
        dispatch(activityModuleStoreChunk.actions.setIsLoading(hideLoader))
    },
})

const ActivityScreenContainerFunc = (props: any) => {
    const { setOptions } = useNavigation()

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    testID="Feed notifications back"
                    headerTitle={translate('native.screens_titles.activity_screen')}
                    noNotifications
                />
            ),
        })
    }, [])

    return <ActivityScreenContainer {...props} />
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
    } as ViewStyle,
    headerContainer: {
        marginTop: MARGIN_SM,
    } as ViewStyle,
    spacer: {
        marginBottom: 24,
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ActivityScreenContainerFunc)
