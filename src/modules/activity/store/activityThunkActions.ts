import { getIsAuthorized } from '@mu-native/auth'
import { DispatchFun, GetStateFun } from '@mu-native/common'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import { processFeedData } from '../../../App/feedScreens/feedScreen/feedUtils'
import reportEvent from '../../../App/Utils/Analytics'
import activityService from '../services/activityService'

import { activityModuleStoreChunk } from './activityStoreChunk'

function fetchUserActivity(page: number) {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        try {
            const isAuthorized = getIsAuthorized(getState())
            if (!isAuthorized) return

            // Mark notifications as seen when user opens the Activity screen (first page load)
            if (page === 1) {
                const now = Math.floor(Date.now() / 1000)
                dispatch(activityModuleStoreChunk.actions.setLastViewedAt(now))
                dispatch(activityModuleStoreChunk.actions.setNotificationCount(0))
            }

            dispatch(activityModuleStoreChunk.actions.setIsLoading(true))
            const activitySettings = activityModuleStoreChunk.props.getSettings(getState())
            const processedSettings = activitySettings
                ?.map(setting => setting?.verb)
                .filter(Boolean)

            reportEvent(MetricaEvents.ACTIVITY_SETTINGS, {
                settings: processedSettings.join(', '),
            })

            const activityResponse = await activityService.requestUserActivity(
                page,
                processedSettings,
            )

            if (activityResponse) {
                const activity = processFeedData(activityResponse.feed)
                dispatch(activityModuleStoreChunk.actions.concatActivity(activity))
                dispatch(
                    activityModuleStoreChunk.actions.setHasMorePages(
                        activityResponse.has_more_page,
                    ),
                )
                if (page === 1) {
                    activityService.invalidateNotificationCache()
                }
            } else {
                dispatch(activityModuleStoreChunk.actions.concatActivity([]))
                dispatch(activityModuleStoreChunk.actions.setHasMorePages(false))
            }
        } catch (e) {
            console.log('[ActivityThunkActions.errorororoor]', e)
        } finally {
            dispatch(activityModuleStoreChunk.actions.setIsLoading(false))
        }
    }
}

function fetchActivityNotificationCount() {
    return async (
        dispatch: (...args: Array<any>) => any,
        getState: (...args: Array<any>) => any,
    ) => {
        const isAuthorized = getIsAuthorized(getState())
        if (!isAuthorized) return

        const defaultDateLastSee = Math.floor(Date.now() / 1000)
        const dateLastSee =
            activityModuleStoreChunk.props.getLastViewedAt(getState()) || defaultDateLastSee
        const response = await activityService.requestActivityNotificationCount(dateLastSee)
        let count = 0
        if (response) {
            count = response.notification_count
            if (count) reportEvent(MetricaEvents.ACTIVITY_NOTIFICATIONS, { count })
        }
        dispatch(activityModuleStoreChunk.actions.setNotificationCount(count))
    }
}

const toggleActivitySetting = (verb: number) => (dispatch: DispatchFun, getState: GetStateFun) => {
    const eventMap: Record<number, string> = {
        31: MetricaEvents.NOTIFICATIONS_SETTINGS_FOLLOWER_TURN,
        22: MetricaEvents.NOTIFICATIONS_SETTINGS_ADDED_TO_FAVORITED_TURN,
        20: MetricaEvents.NOTIFICATIONS_SETTINGS_SCORE_COMMENTED_TURN,
        21: MetricaEvents.NOTIFICATIONS_SETTINGS_REPLY_TO_COMMENT_TURN,
        51: MetricaEvents.NOTIFICATIONS_SETTINGS_SCORE_BOUGHT_BY_CREDIT,
        55: MetricaEvents.NOTIFICATIONS_SETTINGS_BALANCE_UP,
        56: MetricaEvents.NOTIFICATIONS_SETTINGS_BALANCE_UP,
    }
    const eventName = eventMap[verb]
    const settings = activityModuleStoreChunk.props.getSettings(getState())
    const setting = settings.find(setting => setting.verb === verb)

    if (eventMap && setting) {
        reportEvent(eventName, { value: !setting.value ? 'on' : 'off' })
    }
    dispatch(activityModuleStoreChunk.actions.toggleSetting(verb))
}

export const activityThunkActions = {
    fetchActivityNotificationCount,
    toggleActivitySetting,
    fetchUserActivity,
}
